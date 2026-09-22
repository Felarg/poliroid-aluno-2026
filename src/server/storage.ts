import "server-only";
import { S3Client } from "@aws-sdk/client-s3";
import { requireEnv } from "./env";

/** Cria o cliente S3 interno; MinIO implementa a mesma API de object storage. */
export function getStorage(): S3Client {
  const endpointUrl = requireEnv("STORAGE_ENDPOINT");
  if (!URL.canParse(endpointUrl)) {
    throw new Error("STORAGE_ENDPOINT deve ser uma URL válida.");
  }
  const endpoint = new URL(endpointUrl);
  if (!["http:", "https:"].includes(endpoint.protocol)) {
    throw new Error("STORAGE_ENDPOINT deve usar HTTP ou HTTPS.");
  }
  return new S3Client({
    endpoint: endpoint.href,
    region: "us-east-1",
    forcePathStyle: true,
    credentials: {
      accessKeyId: requireEnv("MINIO_ROOT_USER"),
      secretAccessKey: requireEnv("MINIO_ROOT_PASSWORD"),
    },
    requestHandler: { connectionTimeout: 3000, requestTimeout: 3000 },
    maxAttempts: 1,
  });
}
