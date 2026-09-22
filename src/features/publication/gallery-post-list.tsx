/** Lista uma galeria pública ou própria, mantendo sua paginação independente do feed. */
"use client";

import { useRef, useState } from "react";
import { LikeButton } from "@/features/social/like-button";
import { getPostsPage } from "./client-api";
import type { Page, PostDTO } from "./contracts";
import { PostCollection } from "./post-collection";

interface GalleryPostListProps {
  userId: string;
  posts: PostDTO[];
  nextCursor: string | null;
}

/** Carrega novas páginas da galeria sem apagar os posts que já estão visíveis. */
export function GalleryPostList({
  userId,
  posts: initialPosts,
  nextCursor: initialCursor,
}: GalleryPostListProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [nextCursor, setNextCursor] = useState(initialCursor);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const requestId = useRef(0);

  async function loadMore() {
    if (!nextCursor || pending) {
      return;
    }

    const currentRequest = ++requestId.current;
    setPending(true);
    setError("");

    try {
      const page: Page<PostDTO> = await getPostsPage(
        "user",
        nextCursor,
        userId,
      );
      if (currentRequest !== requestId.current) {
        return;
      }
      setPosts((current) => [...current, ...page.items]);
      setNextCursor(page.nextCursor);
    } catch (loadError) {
      if (currentRequest === requestId.current) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Não foi possível carregar mais publicações.",
        );
      }
    } finally {
      if (currentRequest === requestId.current) {
        setPending(false);
      }
    }
  }

  function replacePost(updated: PostDTO) {
    setPosts((current) =>
      current.map((post) => (post.id === updated.id ? updated : post)),
    );
  }

  return (
    <div className="space-y-4">
      <PostCollection
        posts={posts}
        gallery
        actionsFor={(post) => (
          <LikeButton
            postId={post.id}
            liked={post.likedByViewer}
            canLike={post.canLike}
            onChanged={(result) =>
              replacePost({
                ...post,
                likedByViewer: result.likedByViewer,
                likeCount: result.likeCount,
                canLike: result.canLike,
              })
            }
          />
        )}
      />
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      {nextCursor && (
        <button
          type="button"
          onClick={loadMore}
          disabled={pending}
          className="rounded-lg bg-orange-600 px-4 py-2 font-medium text-white hover:bg-orange-700 disabled:opacity-50"
        >
          {pending ? "Carregando…" : "Carregar mais"}
        </button>
      )}
    </div>
  );
}
