/** Cartão compartilhado pelo feed e pelas galerias, com ações sociais compostas. */
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { PostDTO } from "./contracts";

interface PostCardProps {
  post: PostDTO;
  compact?: boolean;
  actions?: ReactNode;
}

/** Usa o mesmo quadro quadrado nas duas páginas; compact oculta apenas os metadados. */
export function PostCard({ post, compact = false, actions }: PostCardProps) {
  const publishedAt = new Date(post.createdAt).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
  });
  return (
    <article className="w-80 max-w-full flex-none overflow-hidden rounded-xl border border-stone-200 bg-white">
      <Image
        src={post.imageUrl}
        alt={post.caption || `Foto de ${post.author.name}`}
        width={post.imageWidth}
        height={post.imageHeight}
        unoptimized
        className="aspect-square w-full object-cover"
      />
      <div className="space-y-2 p-4">
        {!compact && (
          <>
            <Link href={`/users/${post.author.id}`} className="font-medium">
              @{post.author.username}
            </Link>
            {post.caption && (
              <p className="break-words whitespace-pre-wrap">{post.caption}</p>
            )}
          </>
        )}
        <p className="text-sm text-stone-600" aria-live="polite">
          {post.likeCount} curtidas
        </p>
        {actions}
        <time dateTime={post.createdAt} className="text-sm text-stone-500">
          {publishedAt}
        </time>
      </div>
    </article>
  );
}
