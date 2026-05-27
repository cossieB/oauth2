BEGIN;
CREATE TABLE users (
    user_id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    email_verified INT NOT NULL DEFAULT 0 CHECK (email_verified IN (0,1)),
    password TEXT NOT NULL,
    image TEXT,
    name TEXT,
    surname TEXT
) STRICT;

CREATE TABLE clients (
    client_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE, -- application owner
    redirect_uri TEXT NOT NULL,
    logo TEXT NOT NULL
) STRICT;

CREATE TABLE keys (
    key_id INT PRIMARY KEY,
    private_key TEXT NOT NULL,
    public_key TEXT NOT NULL
) STRICT;

CREATE TABLE user_consent (
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    client_id TEXT NOT NULL REFERENCES clients(client_id) ON DELETE CASCADE,
    scopes TEXT NOT NULL DEFAULT "",
    created_at INT NOT NULL,
    modified_on INT
) STRICT;

CREATE TABLE refresh_tokens (
    token_id INT PRIMARY KEY,
    token TEXT NOT NULL,
    client_id TEXT NOT NULL REFERENCES clients(client_id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    scopes TEXT NOT NULL,
    expires_at INT NOT NULL,
    revoked_at INT
) STRICT;

COMMIT;