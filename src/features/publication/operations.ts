/** Coordena autorização e publicação; os detalhes SQL ficam nas operações locais abaixo. */
import "server-only";
import { randomUUID } from "node:crypto";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { getDatabase } from "@/server/database";
import { getStorage } from "@/server/storage";
import { getViewerId } from "@/server/identity";
import { requireEnv } from "@/server/env";
import type { UploadAuthorization } from "./contracts";
import { PublicationError } from "./errors";
import {
  validateUploadRequest,
  validatePublicationRequest,
} from "./validation";
import { prepareImage, type PreparedImage } from "./image";
import { getPost } from "./queries";

interface UploadRow {
  id: string;
  owner_id: string;
  staging_key: string;
  size_bytes: number;
  status: "pending" | "published" | "expired";
  expires_at: Date;
}

/** Autoriza exclusivamente uma chave privada por dez minutos e limita o tamanho no MinIO. */
export async function createUpload(
  input: unknown,
): Promise<UploadAuthorization> {
  const { contentType, sizeBytes } = validateUploadRequest(input);
  const uploadId = randomUUID();
  const viewerId = getViewerId();
  const stagingKey = `${viewerId}/${uploadId}`;
  const authorization = await createPresignedPost(getStorage(), {
    Bucket: requireEnv("STORAGE_STAGING_BUCKET"),
    Key: stagingKey,
    Expires: 600,
    Fields: { "Content-Type": contentType },
    Conditions: [
      ["content-length-range", sizeBytes, sizeBytes],
      ["eq", "$Content-Type", contentType],
    ],
  });
  const result = await getDatabase().query<UploadRow>(
    `INSERT INTO uploads (id, owner_id, staging_key, content_type, size_bytes)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [uploadId, viewerId, stagingKey, contentType, sizeBytes],
  );
  return {
    uploadId,
    uploadUrl: browserUploadUrl(authorization.url),
    fields: authorization.fields,
    uploadUrlExpiresAt: new Date(Date.now() + 600_000).toISOString(),
    expiresAt: result.rows[0].expires_at.toISOString(),
  };
}

/** Repetir upload e legenda recupera o mesmo post, mesmo que a resposta anterior se perca. */
export async function publishPost(input: unknown) {
  const { uploadId, caption } = validatePublicationRequest(input);
  const upload = await findUpload(uploadId);
  validateUploadAccess(upload);
  if (upload.status === "published") {
    return recoverPublishedPost(uploadId, caption);
  }

  // Storage e transformação não mantêm conexão SQL nem lock durante o trabalho pesado.
  const image = await prepareImage(upload.staging_key, upload.size_bytes);
  const postId = await commitPublication(uploadId, caption, image);
  if (postId === null) {
    return recoverPublishedPost(uploadId, caption);
  }
  return { post: await getPost(postId), created: true };
}

function browserUploadUrl(internalUrl: string): string {
  // A assinatura POST vincula bucket e chave, não o host interno da rede Docker.
  const uploadUrl = new URL(internalUrl);
  const publicEndpoint = new URL(requireEnv("STORAGE_PUBLIC_ENDPOINT"));
  uploadUrl.host = publicEndpoint.host;
  uploadUrl.protocol = publicEndpoint.protocol;
  return uploadUrl.href;
}

async function findUpload(uploadId: string): Promise<UploadRow | undefined> {
  const result = await getDatabase().query<UploadRow>(
    "SELECT * FROM uploads WHERE id = $1",
    [uploadId],
  );
  return result.rows[0];
}

function validateUploadAccess(
  upload: UploadRow | undefined,
): asserts upload is UploadRow {
  if (!upload) {
    throw new PublicationError(
      404,
      "UPLOAD_NOT_FOUND",
      "Tentativa não encontrada. Selecione a imagem novamente.",
    );
  }
  if (upload.owner_id !== getViewerId()) {
    throw new PublicationError(
      403,
      "UPLOAD_FORBIDDEN",
      "Esta tentativa pertence a outro usuário.",
    );
  }
  // Um resultado publicado continua recuperável depois do vencimento da tentativa.
  if (upload.status === "published") {
    return;
  }
  const hasExpired =
    upload.status === "expired" || upload.expires_at.getTime() <= Date.now();
  if (hasExpired) {
    throw new PublicationError(
      410,
      "UPLOAD_EXPIRED",
      "A tentativa expirou. Selecione a imagem novamente.",
    );
  }
}

async function recoverPublishedPost(uploadId: string, caption: string) {
  const result = await getDatabase().query<{ id: string; caption: string }>(
    "SELECT id, caption FROM posts WHERE upload_id = $1",
    [uploadId],
  );
  const post = result.rows[0];
  if (!post) {
    throw new Error("Upload publicado sem post.");
  }
  if (post.caption !== caption) {
    throw new PublicationError(
      409,
      "CAPTION_CONFLICT",
      "Esta tentativa já foi publicada com outra legenda. Use a legenda original para recuperar o resultado.",
    );
  }
  return { post: await getPost(post.id), created: false };
}

/** Retorna null quando outra finalização já ganhou o lock e publicou o upload. */
async function commitPublication(
  uploadId: string,
  caption: string,
  image: PreparedImage,
): Promise<string | null> {
  const client = await getDatabase().connect();
  try {
    await client.query("BEGIN");
    // Todas as finalizações da mesma tentativa passam por esta linha, uma por vez.
    const result = await client.query<UploadRow>(
      "SELECT * FROM uploads WHERE id = $1 FOR UPDATE",
      [uploadId],
    );
    const upload = result.rows[0];
    validateUploadAccess(upload);
    if (upload.status === "published") {
      await client.query("COMMIT");
      return null;
    }

    const inserted = await client.query<{ id: string }>(
      `INSERT INTO posts (author_id, upload_id, image_key, caption)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [getViewerId(), uploadId, image.key, caption],
    );
    await client.query(
      `UPDATE uploads SET status = 'published', image_width = $2, image_height = $3
       WHERE id = $1`,
      [uploadId, image.width, image.height],
    );
    await client.query("COMMIT");
    return inserted.rows[0].id;
  } catch (error) {
    await client.query("ROLLBACK");
    // Não apagar a imagem: uma falha na resposta do COMMIT não prova que ele falhou.
    throw error;
  } finally {
    client.release();
  }
}
