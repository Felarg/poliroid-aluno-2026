/** Mantém a estrutura da galeria quando seus dados ainda não estão no cache. */
import { PostListSkeleton } from "@/features/publication/post-list-skeleton";

/** Reserva o título e os quadros quadrados enquanto os posts são carregados. */
export default function GalleryLoading() {
  return (
    <>
      <h1 className="text-3xl font-semibold">Minha galeria</h1>
      <PostListSkeleton gallery />
    </>
  );
}
