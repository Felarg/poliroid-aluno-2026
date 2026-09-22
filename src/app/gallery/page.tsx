/** Página da galeria própria, independente da lista e do formulário do feed. */
import { connection } from "next/server";
import { randomUUID } from "node:crypto";
import { getUserPostsPage } from "@/features/publication/queries";
import { getViewer } from "@/features/users/get-viewer";
import { GalleryPostList } from "@/features/publication/gallery-post-list";

/** Carrega a galeria do viewer; o mesmo componente serve para perfis públicos. */
export default async function GalleryPage() {
  await connection();
  const viewer = await getViewer();
  const page = await getUserPostsPage(viewer.id, {});
  // Cada leitura do servidor reinicia a paginação e descarta respostas da lista anterior.
  const listKey = randomUUID();
  return (
    <>
      <h1 className="text-3xl font-semibold">Minha galeria</h1>
      <GalleryPostList
        key={listKey}
        userId={viewer.id}
        posts={page.items}
        nextCursor={page.nextCursor}
      />
    </>
  );
}
