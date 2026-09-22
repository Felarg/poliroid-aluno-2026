/** Coordena as etapas visíveis da publicação e preserva os dados necessários à recuperação. */
"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { MAX_IMAGE_BYTES } from "./contracts";
import type { PublicationSubmission } from "./client-api";
import { ImagePicker } from "./image-picker";
import { CaptionField } from "./caption-field";

/** Informa ao diálogo quando o envio impede seu fechamento. */
interface PublishFormProps {
  onPendingChange: (pending: boolean) => void;
}

/** Mantém o estado do caso de uso; transporte e seleção de arquivo têm responsabilidades próprias. */
export function PublishForm({ onPendingChange }: PublishFormProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pendingPublication, setPendingPublication] =
    useState<PublicationSubmission | null>(null);
  // A ref bloqueia um segundo envio antes mesmo de React renderizar o botão desabilitado.
  const submitting = useRef(false);

  function selectImage(selectedFile: File | null) {
    setFile(selectedFile);
    setPendingPublication(null);
    setError("");
    setMessage("");
  }

  function showPublicationSuccess() {
    setPendingPublication(null);
    setFile(null);
    setCaption("");
    setMessage("Foto publicada! Sua galeria e seu feed foram atualizados.");
    // Descarta os dados pré-carregados para que a nova foto também apareça na galeria.
    router.refresh();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || submitting.current) {
      return;
    }
    const validationMessage = validatePublicationForm(file, caption);
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    submitting.current = true;
    setPending(true);
    onPendingChange(true);
    setError("");
    try {
      // TODO: coordenar autorização, upload, finalização e recuperação.
      
      let pending = pendingPublication;
      
      if(!pending){
        const uploadAutorization =  await requestUpload(file)
        await uploadImage(file, uploadAutorization)
        const publicationSubmission = {
          uploadId: uploadAutorization.uploadId,
          caption: caption ? caption : ""
        }
        setPendingPublication(publicationSubmission)
      }
      
      const publicationResult = await finalizePublication(publicationSubmission)

      if(publicationResult.sucess){
        showPublicationSuccess();
        return
      }

      setError(publicationResult.message)

      if (publicationResult.restartUpload) {
        setPendingPublication(null)
      }
    } catch {
      // TODO: mostrar uma mensagem e preservar a tentativa quando for seguro repetir.
      const friendly = error instanceof Error && error.constructor === Error
      setError(friendly ? error.message : "Não foi possível concluir")
    } finally {
      submitting.current = false;
      setPending(false);
      onPendingChange(false);
    }
  }

  let buttonLabel = "Publicar foto";
  if (pending) {
    buttonLabel = "Publicando…";
  } else if (pendingPublication) {
    buttonLabel = "Tentar finalizar novamente";
  }

  return (
    <form onSubmit={submit} className="space-y-4" aria-busy={pending}>
      <ImagePicker file={file} disabled={pending} onSelect={selectImage} />
      <CaptionField
        value={caption}
        disabled={pending || pendingPublication !== null}
        onChange={setCaption}
      />
      {pendingPublication && !pending && (
        <p className="text-sm text-stone-600">
          Tente finalizar novamente para recuperar esta publicação. Para iniciar
          outra tentativa, selecione o arquivo novamente.
        </p>
      )}
      <button
        type="submit"
        disabled={pending || !file}
        className="rounded-lg bg-orange-700 px-5 py-3 font-medium text-white disabled:opacity-50"
      >
        {buttonLabel}
      </button>
      <p role="status" className="text-sm text-stone-700">
        {message}
      </p>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
    </form>
  );
}

function validatePublicationForm(file: File, caption: string): string | null {
  const supportedType = ["image/jpeg", "image/png", "image/webp"].includes(
    file.type,
  );
  if (file.size < 1 || file.size > MAX_IMAGE_BYTES || !supportedType) {
    return "Selecione JPEG, PNG ou WebP não vazio de até 10 MiB.";
  }
  if (Array.from(caption.trim()).length > 2200) {
    return "A legenda deve ter até 2.200 caracteres.";
  }
  return null;
}
