import "server-only";
import { requireEnv } from "./env";

/** Fronteira única de identidade mockada, substituível por autenticação futura. */
export function getViewerId(): string {
  const viewerId = requireEnv("MOCK_VIEWER_ID");
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      viewerId,
    )
  ) {
    throw new Error("MOCK_VIEWER_ID deve ser um UUID válido.");
  }
  return viewerId;
}
