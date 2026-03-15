// ─── SQLite core ──────────────────────────────────────────────────────────────
export { getDb, closeDb }  from './sqlite/db';
export { runMigrations }   from './sqlite/migrations';
export { seedDatabase }    from './sqlite/seed';

// ─── Repositories ─────────────────────────────────────────────────────────────
export { credentialRepository } from './repositories/credentialRepository';
export { issuerRepository }     from './repositories/issuerRepository';
export { productRepository }    from './repositories/productRepository';
export { postRepository }       from './repositories/postRepository';
export { handshakeRepository }  from './repositories/handshakeRepository';