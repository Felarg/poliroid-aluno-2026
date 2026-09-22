import { HeadBucketCommand } from "@aws-sdk/client-s3";
import { getDatabase } from "@/server/database";
import { requireEnv } from "@/server/env";
import { getStorage } from "@/server/storage";

/** Verifica banco e buckets reais sem expor endereços internos ou credenciais. */
export async function GET() {
  try {
    const storage = getStorage();
    await Promise.all([
      getDatabase().query("SELECT 1 FROM users LIMIT 1"),
      storage.send(
        new HeadBucketCommand({ Bucket: requireEnv("STORAGE_STAGING_BUCKET") }),
      ),
      storage.send(
        new HeadBucketCommand({ Bucket: requireEnv("STORAGE_PUBLIC_BUCKET") }),
      ),
    ]);
    return Response.json(
      { status: "ok", database: "ok", storage: "ok" },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      {
        status: "unavailable",
        message: "Confira os serviços e execute a inicialização do ambiente.",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
