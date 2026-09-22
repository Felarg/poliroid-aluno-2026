-- migrate:up
-- lower() preserva a busca sem distinguir maiúsculas; pattern_ops atende LIKE com prefixo.
CREATE INDEX users_username_prefix_idx ON users (lower(username) text_pattern_ops);
CREATE INDEX users_name_prefix_idx ON users (lower(name) text_pattern_ops);

-- migrate:down
DROP INDEX users_name_prefix_idx;
DROP INDEX users_username_prefix_idx;
