/** Chamadas do navegador para follows, likes e páginas de posts das telas. */
import type { LikeResult, FollowResult } from "./contracts";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!response.ok) {
    const body: { error?: { message?: string } } = await response
      .json()
      .catch(() => ({}));
    throw new Error(body.error?.message ?? "Não foi possível concluir a ação.");
  }
  const result: T = await response.json();
  return result;
}

/** Garante o estado desejado; repetir após uma resposta perdida é seguro. */
export function changeLike(
  postId: string,
  liked: boolean,
): Promise<LikeResult> {
  return request(`/api/v1/posts/${postId}/like`, {
    method: liked ? "PUT" : "DELETE",
  });
}

/** Garante o estado desejado de follow; repetir a mesma operação é seguro. */
export function changeFollow(
  userId: string,
  following: boolean,
): Promise<FollowResult> {
  return request(`/api/v1/users/${userId}/follow`, {
    method: following ? "PUT" : "DELETE",
  });
}
