/** Mantém a estrutura do feed durante uma navegação ainda sem dados no cache. */
import { PostListSkeleton } from "@/features/publication/post-list-skeleton";

/** Reserva o título, a ação de publicação e o espaço das fotos. */
export default function FeedLoading() {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold">Meu feed</h1>
        <button
          type="button"
          disabled
          className="rounded-lg bg-orange-700 px-4 py-2 font-medium text-white opacity-50"
        >
          Nova publicação
        </button>
      </div>
      <PostListSkeleton />
    </>
  );
}
