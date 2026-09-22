/** Prepara usuários, fotos reais no MinIO e relações para explorar os fluxos sem publicar pela UI. */
import pg from "pg";
import sharp from "sharp";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const database = new pg.Client({ connectionString: process.env.DATABASE_URL });
const storage = new S3Client({
  endpoint: process.env.STORAGE_ENDPOINT,
  region: "us-east-1",
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.MINIO_ROOT_USER,
    secretAccessKey: process.env.MINIO_ROOT_PASSWORD,
  },
});

// IDs estáveis permitem repetir o seed sem apagar mudanças feitas em aula.
const users = [
  ["00000000-0000-4000-8000-000000000001", "gabriel", "Gabriel"],
  ["00000000-0000-4000-8000-000000000002", "marina", "Marina Costa"],
  ["00000000-0000-4000-8000-000000000003", "lucas", "Lucas Almeida"],
  ["00000000-0000-4000-8000-000000000004", "ana", "Ana Júlia"],
];

/** Gera uma ilustração pequena por autor e publica metadados somente após guardar seus bytes. */
async function seedPosts(authorId, count, start, color) {
  const image = await sharp({
    create: { width: 640, height: 480, channels: 3, background: color },
  })
    .composite([
      {
        input: Buffer.from(
          '<svg width="640" height="480"><circle cx="480" cy="115" r="55" fill="#fff7dc"/><path d="M0 480V350L200 150L430 480Z" fill="#344c43"/><path d="M220 480L440 230L640 380V480Z" fill="#708d70"/></svg>',
        ),
      },
    ])
    .webp()
    .toBuffer();
  for (let index = 0; index < count; index += 1) {
    const suffix = String(start + index).padStart(12, "0");
    const postId = `10000000-0000-4000-8000-${suffix}`;
    const uploadId = `20000000-0000-4000-8000-${suffix}`;
    const imageKey = `seed/${postId}.webp`;
    await storage.send(
      new PutObjectCommand({
        Bucket: process.env.STORAGE_PUBLIC_BUCKET,
        Key: imageKey,
        Body: image,
        ContentType: "image/webp",
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
    // Uma transação evita deixar apenas metade dos metadados de demonstração.
    await database.query("BEGIN");
    try {
      await database.query(
        `INSERT INTO uploads (id, owner_id, staging_key, content_type, size_bytes, status, image_width, image_height)
         VALUES ($1, $2, $3, 'image/webp', $4, 'published', 640, 480)
         ON CONFLICT (id) DO NOTHING`,
        [uploadId, authorId, `seed-staging/${uploadId}`, image.length],
      );
      await database.query(
        `INSERT INTO posts (id, author_id, upload_id, image_key, caption, created_at)
         VALUES ($1, $2, $3, $4, $5, '2026-09-01T12:00:00Z'::timestamptz + $6 * interval '1 microsecond')
         ON CONFLICT (id) DO NOTHING`,
        [
          postId,
          authorId,
          uploadId,
          imageKey,
          `Paisagem de demonstração ${index + 1}`,
          start + index,
        ],
      );
      await database.query("COMMIT");
    } catch (error) {
      await database.query("ROLLBACK");
      throw error;
    }
  }
}

try {
  await database.connect();
  for (const [id, username, name] of users) {
    await database.query(
      "INSERT INTO users (id, username, name) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING",
      [id, username, name],
    );
  }
  await seedPosts(users[0][0], 3, 1, "#d7aa82");
  await seedPosts(users[1][0], 24, 101, "#9ab8c5");
  await seedPosts(users[2][0], 2, 201, "#c6a6c8");
  await database.query(
    `INSERT INTO follows (follower_id, followee_id, active) VALUES ($1, $2, true)
     ON CONFLICT (follower_id, followee_id) DO NOTHING`,
    [users[0][0], users[1][0]],
  );
  console.log(
    "Seed concluído: quatro usuários, 29 fotos e uma relação inicial. Alterações existentes preservadas.",
  );
} finally {
  await database.end();
  storage.destroy();
}
