import "server-only";
import { Pool } from "pg";
import { requireEnv } from "./env";

const databaseGlobal = globalThis as typeof globalThis & {
  databasePool?: Pool;
};

/** Reutiliza o pool entre recarregamentos do Next.js durante o desenvolvimento. */
export function getDatabase(): Pool {
  if (!databaseGlobal.databasePool) {
    const connectionString = requireEnv("DATABASE_URL");
    if (!URL.canParse(connectionString)) {
      throw new Error("DATABASE_URL deve ser uma URL válida.");
    }
    const url = new URL(connectionString);
    if (!["postgres:", "postgresql:"].includes(url.protocol)) {
      throw new Error(
        "DATABASE_URL deve usar o protocolo postgres ou postgresql.",
      );
    }
    databaseGlobal.databasePool = new Pool({
      connectionString,
      max: 5,
      connectionTimeoutMillis: 3000,
      idleTimeoutMillis: 10000,
    });
    databaseGlobal.databasePool.on("error", () => {
      console.error("Uma conexão ociosa com o PostgreSQL foi interrompida.");
    });
  }
  return databaseGlobal.databasePool;
}
