import {
  S3Client,
  HeadBucketCommand,
  CreateBucketCommand,
  DeleteBucketPolicyCommand,
  PutBucketPolicyCommand,
} from "@aws-sdk/client-s3";

const storage = new S3Client({
  endpoint: process.env.STORAGE_ENDPOINT,
  region: "us-east-1",
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.MINIO_ROOT_USER,
    secretAccessKey: process.env.MINIO_ROOT_PASSWORD,
  },
});
const stagingBucket = process.env.STORAGE_STAGING_BUCKET;
const publicBucket = process.env.STORAGE_PUBLIC_BUCKET;

for (const Bucket of [stagingBucket, publicBucket]) {
  try {
    await storage.send(new HeadBucketCommand({ Bucket }));
  } catch (error) {
    if (error.$metadata?.httpStatusCode !== 404) throw error;
    await storage.send(new CreateBucketCommand({ Bucket }));
  }
}

// Somente objetos finais têm leitura pública; upload e listagem exigem credenciais.
await storage.send(new DeleteBucketPolicyCommand({ Bucket: stagingBucket }));
await storage.send(
  new PutBucketPolicyCommand({
    Bucket: publicBucket,
    Policy: JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: { AWS: ["*"] },
          Action: ["s3:GetObject"],
          Resource: [`arn:aws:s3:::${publicBucket}/*`],
        },
      ],
    }),
  }),
);
console.log(
  "Buckets configurados: staging privado e imagens com leitura pública.",
);
