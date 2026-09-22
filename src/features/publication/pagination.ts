/** Valida parâmetros comuns de páginas antes que cheguem às consultas SQL. */
import { ApiError } from "@/server/api";

/** Rejeita cursor vazio e limites fora do intervalo documentado. */
export function pageOptions(searchParams: URLSearchParams): {
  cursor?: string;
  limit?: number;
} {
  const rawCursor = searchParams.get("cursor");
  if (rawCursor === "") {
    throw new ApiError(400, "INVALID_CURSOR", "Cursor inválido.");
  }
  const cursor = rawCursor ?? undefined;
  const rawLimit = searchParams.get("limit");
  if (rawLimit === null) {
    return { cursor };
  }
  if (!/^\d+$/.test(rawLimit)) {
    throw new ApiError(
      400,
      "INVALID_LIMIT",
      "O limite deve estar entre 1 e 50.",
    );
  }
  const limit = Number(rawLimit);
  if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
    throw new ApiError(
      400,
      "INVALID_LIMIT",
      "O limite deve estar entre 1 e 50.",
    );
  }
  return { cursor, limit };
}
