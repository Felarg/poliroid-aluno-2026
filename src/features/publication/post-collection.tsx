/** Apresenta uma coleção de posts; paginação e mutações ficam com o chamador. */
import type { ReactNode } from "react";
import type { PostDTO } from "./contracts";
import { PostCard } from "./post-card";

interface PostCollectionProps {
  posts: PostDTO[];
  gallery: boolean;
  actionsFor: (post: PostDTO) => ReactNode;
}

/** Aplica o layout da página mantendo o mesmo cartão e tamanho de foto. */
export function PostCollection({
  posts,
  gallery,
  actionsFor,
}: PostCollectionProps) {
  if (posts.length === 0) {
    return (
      <p className="text-stone-600">
        {gallery
          ? "Nenhuma publicação nesta galeria."
          : "Nenhuma publicação para mostrar."}
      </p>
    );
  }
  const layoutClassName = gallery
    ? "flex flex-wrap justify-center gap-6"
    : "flex flex-col items-center gap-6";
  return (
    <div className={layoutClassName}>
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          compact={gallery}
          actions={actionsFor(post)}
        />
      ))}
    </div>
  );
}
