/** Comunicação do navegador com a API e o MinIO, sem depender de componentes ou estado React. */
import type { Page, PostDTO, UploadAuthorization } from "./contracts";

/** Carrega a continuação de feed ou galeria, mantendo o cursor opaco para a interface. */
export async function getPostsPage(
  kind: "feed" | "user",
  cursor: string,
  userId?: string,
): Promise<Page<PostDTO>> {
  const path =
    kind === "feed" ? "/api/v1/feed" : `/api/v1/users/${userId}/posts`;
  const response = await fetch(`${path}?cursor=${encodeURIComponent(cursor)}`);
  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }
  return response.json();
}

/** Dados preservados para repetir uma finalização sem criar outro post. */
export interface PublicationSubmission {
  uploadId: string;
  caption: string;
}

/** Distingue uma publicação confirmada de uma falha que exige repetir ou reiniciar o envio. */
export type PublicationResult =
  | { success: true; post: PostDTO }
  | { success: false; message: string; restartUpload: boolean };

/** Obtém os campos assinados para enviar somente o arquivo selecionado. */
export async function requestUpload(file: File): Promise<UploadAuthorization> {
  const response = await fetch("/api/v1/uploads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentType: file.type, sizeBytes: file.size }),
  });
  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }
  return response.json();
}

/** Envia os bytes ao staging privado; o arquivo precisa ser o último campo do formulário S3. */
export async function uploadImage(
  file: File,
  authorization: UploadAuthorization,
): Promise<void> {
  const form = new FormData();
  for (const [name, value] of Object.entries(authorization.fields)) {
    form.append(name, value);
  }
  form.append("file", file);

  const response = await fetch(authorization.uploadUrl, {
    method: "POST",
    body: form,
  });
  if (!response.ok) {
    throw new Error("Não foi possível enviar a imagem. Tente novamente.");
  }
}

/** Uma falha de rede pode ocorrer depois do commit; o chamador deve preservar a submissão. */
export async function finalizePublication(
  submission: PublicationSubmission,
): Promise<PublicationResult> {
  const response = await fetch("/api/v1/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(submission),
  });
  if (!response.ok) {
    const message = await readErrorMessage(response);
    const restartUpload = [400, 410, 413, 415].includes(response.status);
    return { success: false, message, restartUpload };
  }
  const post: PostDTO = await response.json();
  return { success: true, post };
}

async function readErrorMessage(response: Response): Promise<string> {
  const body: { error?: { message?: string } } = await response.json();
  return body.error?.message ?? "Não foi possível concluir. Tente novamente.";
}
