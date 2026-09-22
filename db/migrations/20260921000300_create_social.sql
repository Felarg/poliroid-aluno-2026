-- Relações sociais permanecem como metadados no PostgreSQL para coordenar permissões.
-- migrate:up
CREATE TABLE follows (
    follower_id uuid NOT NULL REFERENCES users(id),
    followee_id uuid NOT NULL REFERENCES users(id),
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (follower_id, followee_id),
    CHECK (follower_id <> followee_id)
);
CREATE INDEX follows_followee_active_idx ON follows (followee_id, follower_id) WHERE active;

CREATE TABLE likes (
    user_id uuid NOT NULL REFERENCES users(id),
    post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, post_id)
);
CREATE INDEX likes_post_idx ON likes (post_id);

-- migrate:down
DROP TABLE likes;
DROP TABLE follows;
