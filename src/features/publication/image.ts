/** Prepara o arquivo final fora da transação SQL: lê staging, valida, transforma e persiste. */
import "server-only";
import {
  GetObjectCommand,
  PutObjectCommand,
  NoSuchKey,
} from "@aws-sdk/client-s3";
import sharp from "sharp";
import { randomUUID } from "node:crypto";
import { getStorage } from "@/server/storage";
import { requireEnv } from "@/server/env";
import { MAX_IMAGE_BYTES } from "./contracts";
import { PublicationError } from "./errors";

/** Referência imutável e dimensões que serão confirmadas junto com o post. */
export interface PreparedImage {
  key: string;
  width: number;
  height: number;
}

/** Falhas após esta operação podem deixar um órfão, mas nunca publicam uma URL sem imagem. */
export async function prepareImage(
  stagingKey: string,
  declaredSize: number,
): Promise<PreparedImage> {
  const input = await readStagingImage(stagingKey, declaredSize);
  const converted = await convertToWebp(input);
  const key = await storeFinalImage(converted.data);
  return { key, width: converted.info.width, height: converted.info.height };
}

async function readStagingImage(
  stagingKey: string,
  declaredSize: number,
): Promise<Buffer> {
  let object;
  try {
    object = await getStorage().send(
      new GetObjectCommand({
        Bucket: requireEnv("STORAGE_STAGING_BUCKET"),
        Key: stagingKey,
      }),
    );
  } catch (error) {
    if (error instanceof NoSuchKey) {
      throw new PublicationError(
        409,
        "UPLOAD_MISSING",
        "O arquivo ainda não chegou. Envie a imagem antes de publicar.",
      );
    }
    throw error;
  }
  if (!object.Body) {
    throw new Error("Storage retornou corpo ausente.");
  }

  const chunks: Buffer[] = [];
  let receivedBytes = 0;
  // O stream limita memória mesmo se o tamanho informado estiver incorreto.
  const reader = object.Body.transformToWebStream().getReader();
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) {
        break;
      }
      receivedBytes += chunk.value.length;
      if (receivedBytes > MAX_IMAGE_BYTES) {
        throw new PublicationError(
          413,
          "IMAGE_TOO_LARGE",
          "A imagem deve ter até 10 MiB.",
        );
      }
      chunks.push(Buffer.from(chunk.value));
    }
  } finally {
    await reader.cancel();
  }
  if (receivedBytes !== declaredSize) {
    throw new PublicationError(
      400,
      "SIZE_MISMATCH",
      "O tamanho recebido difere do declarado. Selecione o arquivo novamente.",
    );
  }
  return Buffer.concat(chunks);
}

async function convertToWebp(input: Buffer) {
  let converted;
  try {
    const image = sharp(input, {
      limitInputPixels: 20_000_000,
      failOn: "warning",
    });
    const metadata = await image.metadata();
    const supportedFormat = ["jpeg", "png", "webp"].includes(metadata.format);
    const animated =
      (metadata.pages ?? 1) !== 1 ||
      (metadata.format === "png" && hasPngAnimation(input));
    const oversizedDimensions = metadata.width > 8192 || metadata.height > 8192;
    if (!supportedFormat || animated || oversizedDimensions) {
      throw new Error("Formato ou dimensões inválidas.");
    }
    // rotate aplica a orientação EXIF; a saída padrão do Sharp remove metadados.
    converted = await image
      .rotate()
      .resize({
        width: 2048,
        height: 2048,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp()
      .toBuffer({ resolveWithObject: true });
  } catch {
    throw new PublicationError(
      415,
      "INVALID_IMAGE",
      "Use JPEG, PNG ou WebP estático, até 20 megapixels e 8.192 px por dimensão.",
    );
  }
  if (converted.data.length > MAX_IMAGE_BYTES) {
    throw new PublicationError(
      413,
      "IMAGE_TOO_LARGE",
      "A imagem processada excede 10 MiB. Escolha uma imagem menor.",
    );
  }
  return converted;
}

async function storeFinalImage(bytes: Buffer): Promise<string> {
  // Uma nova chave por execução impede que tentativas concorrentes sobrescrevam a imagem publicada.
  const key = `${randomUUID()}.webp`;
  await getStorage().send(
    new PutObjectCommand({
      Bucket: requireEnv("STORAGE_PUBLIC_BUCKET"),
      Key: key,
      Body: bytes,
      ContentType: "image/webp",
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
  return key;
}

/** O decoder pode ler só o primeiro quadro de APNG; acTL identifica a animação no contêiner. */
function hasPngAnimation(input: Buffer): boolean {
  let offset = 8;
  while (offset + 12 <= input.length) {
    const length = input.readUInt32BE(offset);
    const type = input.toString("ascii", offset + 4, offset + 8);
    if (type === "acTL") {
      return true;
    }
    offset += 12 + length;
  }
  return false;
}
