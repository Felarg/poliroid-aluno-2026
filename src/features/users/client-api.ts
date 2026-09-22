/** Busca usuários pela API sem acoplar transporte ao formulário. */
import type { UserSearchResult } from "./contracts";

/** Retorna resultados e indicação de truncamento para o termo informado. */
export async function searchUsers(term: string): Promise<UserSearchResult> {
  const response = await fetch(`/api/v1/users?q=${encodeURIComponent(term)}`);
  if (!response.ok) {
    const body: { error?: { message?: string } } = await response
      .json()
      .catch(() => ({}));
    throw new Error(body.error?.message ?? "Não foi possível buscar usuários.");
  }
  return response.json();
}
