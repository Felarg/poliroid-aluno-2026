import "server-only";
import { getDatabase } from "@/server/database";
import { getViewerId } from "@/server/identity";
import { unstable_cache } from "next/cache";
import { cacheTags } from "@/server/cache";

/** Dados públicos usados na apresentação da identidade atual. */
export interface Viewer {
  id: string;
  username: string;
  name: string;
}

/** Consulta o usuário mockado no banco real; o seed deve existir antes da leitura. */
async function readViewer(viewerId: string): Promise<Viewer> {
  const result = await getDatabase().query<Viewer>(
    "SELECT id, username, name FROM users WHERE id = $1",
    [viewerId],
  );
  const viewer = result.rows[0];
  if (!viewer) {
    throw new Error(
      "Usuário atual não encontrado. Execute o seed e confira MOCK_VIEWER_ID.",
    );
  }
  return viewer;
}

const cachedReadViewer = unstable_cache(readViewer, ["viewer"], {
  tags: [cacheTags.users],
  revalidate: 60,
});

/** Inclui a identidade mockada na chave da leitura compartilhada. */
export function getViewer(): Promise<Viewer> {
  return cachedReadViewer(getViewerId());
}
