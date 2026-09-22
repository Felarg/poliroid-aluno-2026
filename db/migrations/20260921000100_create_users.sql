-- migrate:up
CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    username text NOT NULL UNIQUE CHECK (username = lower(username)),
    name text NOT NULL,
    avatar_url text
);

-- migrate:down
DROP TABLE users;
