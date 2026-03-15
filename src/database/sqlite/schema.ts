/**
 * SQLite Schema
 *
 * Table definitions for the local Sovereign Trust database.
 * All tables use TEXT primary keys (UUIDs) for DID compatibility.
 */

export const CREATE_CREDENTIALS_TABLE = `
  CREATE TABLE IF NOT EXISTS credentials (
    id                   TEXT PRIMARY KEY,
    type                 TEXT NOT NULL,
    title                TEXT NOT NULL,
    description          TEXT NOT NULL DEFAULT '',
    subject_did          TEXT NOT NULL,
    issuer_did           TEXT NOT NULL,
    issuer_id            TEXT NOT NULL,
    issued_at            TEXT NOT NULL,
    expires_at           TEXT,
    status               TEXT NOT NULL DEFAULT 'active',
    trust_state          TEXT NOT NULL DEFAULT 'unknown',
    signature_algorithm  TEXT NOT NULL DEFAULT '',
    proof_hash           TEXT NOT NULL DEFAULT '',
    is_verified          INTEGER NOT NULL DEFAULT 0,
    raw_jwt              TEXT,
    created_at           TEXT NOT NULL,
    updated_at           TEXT NOT NULL
  );
`;

export const CREATE_ISSUERS_TABLE = `
  CREATE TABLE IF NOT EXISTS issuers (
    id           TEXT PRIMARY KEY,
    did          TEXT NOT NULL UNIQUE,
    name         TEXT NOT NULL,
    short_name   TEXT NOT NULL,
    logo_emoji   TEXT NOT NULL DEFAULT '◈',
    category     TEXT NOT NULL DEFAULT '',
    country      TEXT NOT NULL DEFAULT '',
    is_verified  INTEGER NOT NULL DEFAULT 0,
    trust_state  TEXT NOT NULL DEFAULT 'unknown',
    added_at     TEXT NOT NULL
  );
`;

export const CREATE_VERIFICATION_LOG_TABLE = `
  CREATE TABLE IF NOT EXISTS verification_log (
    id            TEXT PRIMARY KEY,
    subject_id    TEXT NOT NULL,
    subject_type  TEXT NOT NULL,
    trust_state   TEXT NOT NULL,
    summary       TEXT NOT NULL DEFAULT '',
    checks_json   TEXT NOT NULL DEFAULT '[]',
    duration_ms   INTEGER NOT NULL DEFAULT 0,
    verified_at   TEXT NOT NULL
  );
`;

export const CREATE_PRODUCTS_TABLE = `
  CREATE TABLE IF NOT EXISTS products (
    id               TEXT PRIMARY KEY,
    name             TEXT NOT NULL,
    description      TEXT NOT NULL DEFAULT '',
    category         TEXT NOT NULL DEFAULT '',
    brand            TEXT NOT NULL DEFAULT '',
    manufacturer_did TEXT NOT NULL,
    serial_number    TEXT NOT NULL,
    batch_id         TEXT,
    manufactured_at  TEXT NOT NULL,
    status           TEXT NOT NULL DEFAULT 'unverified',
    trust_state      TEXT NOT NULL DEFAULT 'unknown',
    custody_chain    TEXT NOT NULL DEFAULT '[]',
    qr_payload       TEXT,
    verified_at      TEXT,
    created_at       TEXT NOT NULL,
    updated_at       TEXT NOT NULL
  );
`;

export const CREATE_POSTS_TABLE = `
  CREATE TABLE IF NOT EXISTS posts (
    id                   TEXT PRIMARY KEY,
    content              TEXT NOT NULL,
    summary              TEXT,
    author_json          TEXT NOT NULL,
    source_url           TEXT,
    source_name          TEXT,
    published_at         TEXT NOT NULL,
    verification_status  TEXT NOT NULL DEFAULT 'unknown',
    trust_state          TEXT NOT NULL DEFAULT 'unknown',
    claim_count          INTEGER NOT NULL DEFAULT 0,
    verified_claim_count INTEGER NOT NULL DEFAULT 0,
    tags_json            TEXT NOT NULL DEFAULT '[]',
    created_at           TEXT NOT NULL
  );
`;

export const CREATE_HANDSHAKES_TABLE = `
  CREATE TABLE IF NOT EXISTS handshakes (
    id             TEXT PRIMARY KEY,
    challenge_json TEXT NOT NULL,
    response_json  TEXT,
    status         TEXT NOT NULL DEFAULT 'pending',
    created_at     TEXT NOT NULL,
    updated_at     TEXT NOT NULL
  );
`;

export const ALL_MIGRATIONS = [
  CREATE_CREDENTIALS_TABLE,
  CREATE_ISSUERS_TABLE,
  CREATE_VERIFICATION_LOG_TABLE,
  CREATE_PRODUCTS_TABLE,
  CREATE_POSTS_TABLE,
  CREATE_HANDSHAKES_TABLE,
] as const;