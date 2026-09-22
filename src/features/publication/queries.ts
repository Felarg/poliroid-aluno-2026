/** Leituras de posts e páginas do feed e das galerias, com estado social no mesmo snapshot. */
import "server-only";
import { getDatabase } from "@/server/database";
import { requireEnv } from "@/server/env";
import { getViewerId } from "@/server/identity";
import type { Page, PostDTO } from "./contracts";
import { ApiError } from "@/server/api";
import { unstable_cache } from "next/cache";
import { cacheTags } from "@/server/cache";

interface PostRow {
  id: string;
  author_id: string;
  username: string;
  name: string;
  avatar_url: string | null;
  image_key: string;
  image_width: number;
  image_height: number;
  caption: string;
  created_at_text: string;
  like_count: string;
  liked_by_viewer: boolean;
  can_like: boolean;
}
// Texto UTC preserva os microssegundos que Date descartaria ao montar o cursor.
const selectPost = `SELECT p.*, to_char(p.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS created_at_text, u.username, u.name, u.avatar_url, up.image_width, up.image_height
  , (SELECT count(*) FROM likes l WHERE l.post_id = p.id)::text AS like_count
  , EXISTS (SELECT 1 FROM likes viewer_like WHERE viewer_like.post_id = p.id AND viewer_like.user_id = $1) AS liked_by_viewer
  , (p.author_id = $1 OR EXISTS (SELECT 1 FROM follows permission_follow
      WHERE permission_follow.follower_id = $1 AND permission_follow.followee_id = p.author_id AND permission_follow.active)) AS can_like
  FROM posts p JOIN users u ON u.id = p.author_id JOIN uploads up ON up.id = p.upload_id`;

function toPost(row: PostRow): PostDTO {
  return {
    id: row.id,
    author: {
      id: row.author_id,
      username: row.username,
      name: row.name,
      avatarUrl: row.avatar_url,
    },
    imageUrl: `${requireEnv("STORAGE_PUBLIC_ENDPOINT")}/${requireEnv("STORAGE_PUBLIC_BUCKET")}/${row.image_key}`,
    imageWidth: row.image_width,
    imageHeight: row.image_height,
    caption: row.caption,
    createdAt: row.created_at_text,
    likeCount: Number(row.like_count),
    likedByViewer: row.liked_by_viewer,
    canLike: row.can_like,
  };
}

/** Recupera o resultado confirmado, inclusive após perda da resposta de publicação. */
async function readPost(id: string, viewerId: string): Promise<PostDTO> {
  const result = await getDatabase().query<PostRow>(
    `${selectPost} WHERE p.id = $2`,
    [viewerId, id],
  );
  if (!result.rows[0]) {
    throw new ApiError(404, "POST_NOT_FOUND", "Publicação não encontrada.");
  }
  return toPost(result.rows[0]);
}

const cachedReadPost = unstable_cache(readPost, ["post"], {
  tags: [cacheTags.posts],
  revalidate: 60,
});

/** Recupera um post com o estado pessoal do viewer na chave do cache. */
export function getPost(id: string): Promise<PostDTO> {
  return cachedReadPost(id, getViewerId());
}

interface Cursor {
  createdAt: string;
  id: string;
  context: string;
}

function encodeCursor(cursor: Cursor): string {
  return Buffer.from(JSON.stringify(cursor), "utf8").toString("base64url");
}

function decodeCursor(
  value: string | undefined,
  context: string,
): Cursor | undefined {
  if (!value) {
    return undefined;
  }
  try {
    const parsed: unknown = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8"),
    );
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !("createdAt" in parsed) ||
      !("id" in parsed) ||
      !("context" in parsed)
    ) {
      throw new Error();
    }
    const cursor = parsed;
    if (
      typeof cursor.createdAt !== "string" ||
      typeof cursor.id !== "string" ||
      cursor.context !== context
    ) {
      throw new Error();
    }
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        cursor.id,
      )
    ) {
      throw new Error();
    }
    const match =
      /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,6}))?Z$/.exec(
        cursor.createdAt,
      );
    if (!match) {
      throw new Error();
    }
    const [, year, month, day, hour, minute, second] = match;
    const date = new Date(
      Date.UTC(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour),
        Number(minute),
        Number(second),
      ),
    );
    if (
      date.getUTCFullYear() !== Number(year) ||
      date.getUTCMonth() !== Number(month) - 1 ||
      date.getUTCDate() !== Number(day) ||
      date.getUTCHours() !== Number(hour) ||
      date.getUTCMinutes() !== Number(minute) ||
      date.getUTCSeconds() !== Number(second)
    ) {
      throw new Error();
    }
    return { createdAt: cursor.createdAt, id: cursor.id, context };
  } catch {
    throw new ApiError(400, "INVALID_CURSOR", "Cursor inválido.");
  }
}

function pageLimit(limit?: number): number {
  if (limit === undefined) {
    return 20;
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
    throw new ApiError(
      400,
      "INVALID_LIMIT",
      "O limite deve estar entre 1 e 50.",
    );
  }
  return limit;
}

async function getPostsPage(
  viewerId: string,
  where: string,
  values: unknown[],
  context: string,
  options: { cursor?: string; limit?: number },
): Promise<Page<PostDTO>> {
  const limit = pageLimit(options.limit);
  const cursor = decodeCursor(options.cursor, context);
  const params: unknown[] = [viewerId, ...values];
  let cursorWhere = "";
  if (cursor) {
    params.push(cursor.createdAt, cursor.id);
    cursorWhere = ` AND (p.created_at, p.id) < ($${params.length - 1}, $${params.length})`;
  }
  params.push(limit + 1);
  const result = await getDatabase().query<PostRow>(
    `${selectPost} WHERE ${where}${cursorWhere} ORDER BY p.created_at DESC, p.id DESC LIMIT $${params.length}`,
    params,
  );
  const rows = result.rows.slice(0, limit);
  const last = rows[rows.length - 1];
  return {
    items: rows.map(toPost),
    nextCursor:
      result.rows.length > limit && last
        ? encodeCursor({
            createdAt: last.created_at_text,
            id: last.id,
            context,
          })
        : null,
  };
}

/** Retorna uma página da galeria pública de um usuário. */
async function readUserPostsPage(
  userId: string,
  viewerId: string,
  options: { cursor?: string; limit?: number },
): Promise<Page<PostDTO>> {
  return getPostsPage(
    viewerId,
    "p.author_id = $2",
    [userId],
    `user:${userId}`,
    options,
  );
}

const cachedUserPostsPage = unstable_cache(readUserPostsPage, ["user-posts"], {
  tags: [cacheTags.posts],
  revalidate: 60,
});

/** Retorna uma galeria com autor, viewer e cursor na chave do cache. */
export function getUserPostsPage(
  userId: string,
  options: { cursor?: string; limit?: number },
): Promise<Page<PostDTO>> {
  return cachedUserPostsPage(userId, getViewerId(), options);
}

/** Monta o feed na leitura a partir do viewer e dos follows ativos. */
async function readFeedPage(
  viewerId: string,
  options: {
    cursor?: string;
    limit?: number;
  },
): Promise<Page<PostDTO>> {
  return getPostsPage(
    viewerId,
    "(p.author_id = $1 OR EXISTS (SELECT 1 FROM follows f WHERE f.follower_id = $1 AND f.followee_id = p.author_id AND f.active))",
    [],
    `feed:${viewerId}`,
    options,
  );
}

const cachedFeedPage = unstable_cache(readFeedPage, ["feed-page"], {
  tags: [cacheTags.posts],
  revalidate: 60,
});

/** Monta o feed com viewer e cursor explícitos para o cache. */
export function getFeedPage(options: {
  cursor?: string;
  limit?: number;
}): Promise<Page<PostDTO>> {
  return cachedFeedPage(getViewerId(), options);
}
