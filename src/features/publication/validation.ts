/** Valida entradas externas antes de iniciar o upload ou acessar o PostgreSQL. */
import "server-only";
import { ApiError as PublicationError, validateId } from "@/server/api";
import { MAX_IMAGE_BYTES } from "./contracts";

export { validateId } from "@/server/api";

/** JSON precisa ser um objeto antes da validação dos campos do fluxo. */
export function validateObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new PublicationError(400, "INVALID_INPUT", "Envie um objeto JSON.");
  }
  return value as Record<string, unknown>;
}

/** Confere as declarações que serão vinculadas à autorização assinada. */
export function validateUploadRequest(input: unknown) {
  const { contentType, sizeBytes } = validateObject(input);
  const supportedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (
    typeof contentType !== "string" ||
    !supportedTypes.includes(contentType)
  ) {
    throw new PublicationError(
      415,
      "INVALID_TYPE",
      "Selecione uma imagem JPEG, PNG ou WebP.",
    );
  }
  if (
    typeof sizeBytes !== "number" ||
    !Number.isSafeInteger(sizeBytes) ||
    sizeBytes < 1
  ) {
    throw new PublicationError(
      400,
      "INVALID_SIZE",
      "Selecione um arquivo não vazio.",
    );
  }
  if (sizeBytes > MAX_IMAGE_BYTES) {
    throw new PublicationError(
      413,
      "IMAGE_TOO_LARGE",
      "A imagem deve ter até 10 MiB.",
    );
  }
  return { contentType, sizeBytes };
}

/** Normaliza a legenda uma vez; a comparação idempotente usa esse mesmo valor. */
export function validatePublicationRequest(input: unknown) {
  const body = validateObject(input);
  const uploadId = validateId(body.uploadId);
  if (body.caption !== undefined && typeof body.caption !== "string") {
    throw new PublicationError(
      400,
      "INVALID_CAPTION",
      "A legenda deve ser um texto.",
    );
  }
  const caption = (body.caption ?? "").trim();
  // Array.from conta pontos de código, diferentemente de string.length para emojis.
  if (Array.from(caption).length > 2200) {
    throw new PublicationError(
      400,
      "CAPTION_TOO_LONG",
      "A legenda deve ter até 2.200 caracteres.",
    );
  }
  return { uploadId, caption };
}
