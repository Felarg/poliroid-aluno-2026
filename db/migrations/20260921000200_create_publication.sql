-- Uploads coordenam a publicação; os bytes permanecem no MinIO.
-- migrate:up
CREATE TABLE uploads (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id uuid NOT NULL REFERENCES users(id),
    staging_key text NOT NULL UNIQUE,
    content_type text NOT NULL CHECK (content_type IN ('image/jpeg', 'image/png', 'image/webp')),
    size_bytes integer NOT NULL CHECK (size_bytes BETWEEN 1 AND 10485760),
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'expired')),
    created_at timestamptz NOT NULL DEFAULT now(),
    expires_at timestamptz NOT NULL DEFAULT now() + interval '1 hour',
    image_width integer,
    image_height integer,
    CHECK (status <> 'published' OR (image_width > 0 AND image_height > 0 AND image_width IS NOT NULL AND image_height IS NOT NULL))
);
CREATE TABLE posts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id uuid NOT NULL REFERENCES users(id),
    upload_id uuid NOT NULL UNIQUE REFERENCES uploads(id),
    image_key text NOT NULL UNIQUE,
    caption text NOT NULL DEFAULT '' CHECK (char_length(caption) <= 2200),
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX posts_author_created_idx ON posts (author_id, created_at DESC, id DESC);
CREATE INDEX posts_created_idx ON posts (created_at DESC, id DESC);

-- migrate:down
DROP TABLE posts;
DROP TABLE uploads;
