/** Tags das leituras SQL e invalidação imediata após commits da API. */
import "server-only";
import { revalidateTag } from "next/cache";

/** Grupos de leitura que compartilham a mesma regra de invalidação. */
export const cacheTags = {
  users: "users",
  posts: "posts",
} as const;

/** Expira feed, galerias e posts depois de publicação ou curtida. */
export function invalidatePosts(): void {
  revalidateTag(cacheTags.posts, { expire: 0 });
}

/** Follow altera perfis, busca, feed e permissão de curtir. */
export function invalidateSocialReads(): void {
  revalidateTag(cacheTags.users, { expire: 0 });
  invalidatePosts();
}
