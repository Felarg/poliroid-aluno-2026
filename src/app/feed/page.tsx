/** Página do feed: compõe publicação e posts próprios ou de autores seguidos. */
import { connection } from "next/server";
import { randomUUID } from "node:crypto";
import { getFeedPage } from "@/features/publication/queries";
import { PublishDialog } from "@/features/publication/publish-dialog";
import { FeedPostList } from "@/features/publication/feed-post-list";

/** Carrega a primeira página; continuação e ações ficam no componente cliente. */
export default async function FeedPage() {
  await connection();
  const page = await getFeedPage({});
  // Cada leitura do servidor reinicia a paginação e descarta respostas da lista anterior.
  const listKey = randomUUID();
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold">Meu feed</h1>
        <PublishDialog />
      </div>
      <FeedPostList
        key={listKey}
        posts={page.items}
        nextCursor={page.nextCursor}
      />
    </>
  );
}
