/** Seleção e prévia local de imagem; este componente não conhece publicação nem endpoints. */
"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";

interface ImagePickerProps {
  file: File | null;
  disabled: boolean;
  onSelect: (file: File | null) => void;
}

/** O pai controla o arquivo; a URL temporária existe apenas para apresentar sua prévia. */
export function ImagePicker({ file, disabled, onSelect }: ImagePickerProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!file && inputRef.current) {
      inputRef.current.value = "";
    }
    // Object URLs mantêm o arquivo na memória até sua liberação explícita.
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [file, previewUrl]);

  function selectImage(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0] ?? null;
    let nextPreviewUrl = "";
    if (selectedFile) {
      nextPreviewUrl = URL.createObjectURL(selectedFile);
    }
    setPreviewUrl(nextPreviewUrl);
    onSelect(selectedFile);
  }

  return (
    <div className="space-y-4">
      <label className="block" htmlFor={inputId}>
        Imagem (JPEG, PNG ou WebP, até 10 MiB)
      </label>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        required
        disabled={disabled}
        onChange={selectImage}
        className="block w-full rounded border p-2 disabled:opacity-50"
      />
      {file && previewUrl && (
        <Image
          src={previewUrl}
          alt="Prévia da foto selecionada"
          width={512}
          height={512}
          unoptimized
          className="max-h-80 w-full rounded-lg object-contain"
        />
      )}
    </div>
  );
}
