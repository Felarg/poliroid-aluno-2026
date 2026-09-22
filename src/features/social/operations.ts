/** Operações sociais transacionais; locks protegem a elegibilidade durante likes. */
import "server-only";
import { getDatabase } from "@/server/database";
import { getViewerId } from "@/server/identity";
import { ApiError } from "@/server/api";
import type { FollowResult, LikeResult } from "./contracts";

/** Garante a relação desejada e mantém a linha inativa para coordenação futura. */
export async function setFollowing(
  userId: string,
  following: boolean,
): Promise<FollowResult> {
  const viewerId = getViewerId();
  if (viewerId === userId) {
    throw new ApiError(403, "SELF_FOLLOW", "Você não pode seguir a si mesmo.");
  }
  const client = await getDatabase().connect();
  try {
    await client.query("BEGIN");
    const target = await client.query("SELECT id FROM users WHERE id = $1", [
      userId,
    ]);
    if (!target.rows[0]) {
      throw new ApiError(404, "USER_NOT_FOUND", "Usuário não encontrado.");
    }
    // Uma linha ausente não pode ser bloqueada; criamos e preservamos o par.
    await client.query(
      `INSERT INTO follows (follower_id, followee_id, active) VALUES ($1, $2, false)
       ON CONFLICT (follower_id, followee_id) DO NOTHING`,
      [viewerId, userId],
    );
    await client.query(
      "SELECT 1 FROM follows WHERE follower_id = $1 AND followee_id = $2 FOR UPDATE",
      [viewerId, userId],
    );
    await client.query(
      `UPDATE follows SET active = $3, updated_at = now()
       WHERE follower_id = $1 AND followee_id = $2`,
      [viewerId, userId, following],
    );
    await client.query("COMMIT");
    return { followingByViewer: following };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/** Garante a presença ou ausência da curtida após bloquear o follow elegível. */
export async function setLike(
  postId: string,
  liked: boolean,
): Promise<LikeResult> {
  const viewerId = getViewerId();
  const client = await getDatabase().connect();
  try {
    await client.query("BEGIN");
    const post = await client.query<{ author_id: string }>(
      "SELECT author_id FROM posts WHERE id = $1",
      [postId],
    );
    if (!post.rows[0]) {
      throw new ApiError(404, "POST_NOT_FOUND", "Publicação não encontrada.");
    }
    const authorId = post.rows[0].author_id;
    if (authorId !== viewerId) {
      // FOR SHARE mantém active estável até o commit e permite outros likes.
      // A ordem é sempre Follow antes de Like; unfollow usa FOR UPDATE no mesmo par.
      const follow = await client.query<{ active: boolean }>(
        `SELECT active FROM follows WHERE follower_id = $1 AND followee_id = $2 FOR SHARE`,
        [viewerId, authorId],
      );
      if (!follow.rows[0]?.active) {
        throw new ApiError(
          403,
          "LIKE_FORBIDDEN",
          "Siga o autor para alterar esta curtida.",
        );
      }
    }
    if (liked) {
      await client.query(
        "INSERT INTO likes (user_id, post_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [viewerId, postId],
      );
    } else {
      await client.query(
        "DELETE FROM likes WHERE user_id = $1 AND post_id = $2",
        [viewerId, postId],
      );
    }
    // A consulta após a escrita lê contador e estado pessoal no mesmo snapshot.
    const state = await client.query<{ count: string; liked: boolean }>(
      `SELECT count(*)::text AS count,
              EXISTS (SELECT 1 FROM likes WHERE user_id = $1 AND post_id = $2) AS liked
         FROM likes WHERE post_id = $2`,
      [viewerId, postId],
    );
    await client.query("COMMIT");
    return {
      likedByViewer: state.rows[0].liked,
      likeCount: Number(state.rows[0].count),
      canLike: true,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
