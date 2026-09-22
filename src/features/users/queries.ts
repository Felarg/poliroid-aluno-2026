/** Consultas públicas de perfis e busca, com relações atuais do viewer. */
import "server-only";
import { getDatabase } from "@/server/database";
import { getViewerId } from "@/server/identity";
import { ApiError } from "@/server/api";
import { unstable_cache } from "next/cache";
import { cacheTags } from "@/server/cache";
import type { UserDTO, UserSearchResult } from "./contracts";

interface UserRow {
  id: string;
  username: string;
  name: string;
  avatar_url: string | null;
  following_by_viewer: boolean;
}

function toUser(row: UserRow, viewerId: string): UserDTO {
  return {
    id: row.id,
    username: row.username,
    name: row.name,
    avatarUrl: row.avatar_url,
    isViewer: row.id === viewerId,
    followingByViewer: row.following_by_viewer,
  };
}

/** Busca um perfil e projeta a relação atual do viewer em uma consulta. */
async function readUser(id: string, viewerId: string): Promise<UserDTO> {
  const result = await getDatabase().query<UserRow>(
    `SELECT u.id, u.username, u.name, u.avatar_url,
            COALESCE(f.active, false) AS following_by_viewer
       FROM users u
       LEFT JOIN follows f ON f.followee_id = u.id AND f.follower_id = $2
      WHERE u.id = $1`,
    [id, viewerId],
  );
  const row = result.rows[0];
  if (!row) {
    throw new ApiError(404, "USER_NOT_FOUND", "Usuário não encontrado.");
  }
  return toUser(row, viewerId);
}

const cachedReadUser = unstable_cache(readUser, ["user-profile"], {
  tags: [cacheTags.users],
  revalidate: 60,
});

/** Inclui o viewer na chave para não misturar estados pessoais. */
export function getUser(id: string): Promise<UserDTO> {
  return cachedReadUser(id, getViewerId());
}

/** Busca prefixos de nome ou username; os índices usam as mesmas expressões lower(). */
async function readSearchUsers(
  term: string,
  viewerId: string,
): Promise<UserSearchResult> {
  const escaped = term.replace(/[\\%_]/g, "\\$&");
  const result = await getDatabase().query<UserRow>(
    `SELECT u.id, u.username, u.name, u.avatar_url,
            COALESCE(f.active, false) AS following_by_viewer
       FROM users u
       LEFT JOIN follows f ON f.followee_id = u.id AND f.follower_id = $2
      WHERE u.id <> $2
        AND (lower(u.username) LIKE lower($1) ESCAPE '\\'
             OR lower(u.name) LIKE lower($1) ESCAPE '\\')
      ORDER BY u.username
      LIMIT 21`,
    [`${escaped}%`, viewerId],
  );
  return {
    items: result.rows.slice(0, 20).map((row) => toUser(row, viewerId)),
    truncated: result.rows.length > 20,
  };
}

const cachedSearchUsers = unstable_cache(readSearchUsers, ["user-search"], {
  tags: [cacheTags.users],
  revalidate: 60,
});

/** Busca por termo e viewer para reutilizar resultados sem misturar relações. */
export function searchUsers(term: string): Promise<UserSearchResult> {
  return cachedSearchUsers(term, getViewerId());
}
