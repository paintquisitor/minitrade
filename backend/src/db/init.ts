import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { sql } from 'drizzle-orm';

// Database setup
const client = createClient({
  url: process.env.TURSO_DATABASE_URL || process.env.LIBSQL_URL || 'file:./local.db',
  authToken: process.env.TURSO_AUTH_TOKEN || process.env.LIBSQL_AUTH_TOKEN,
});

const db = drizzle(client);

// Initialize database tables
async function initDatabase() {
  try {
    console.log('Initializing database...');

    // Create users table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        email TEXT,
        password_hash TEXT,
        display_name TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create trades table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS trades (
        id INTEGER PRIMARY KEY,
        creator_id INTEGER NOT NULL REFERENCES users(id),
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        body TEXT,
        tags TEXT,
        image_urls TEXT,
        status TEXT NOT NULL,
        expires_at TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create proposals table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS proposals (
        id INTEGER PRIMARY KEY,
        trade_id INTEGER NOT NULL REFERENCES trades(id),
        proposer_id INTEGER NOT NULL REFERENCES users(id),
        creator_cash_cents INTEGER NOT NULL DEFAULT 0,
        proposer_cash_cents INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create proposal_items table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS proposal_items (
        id INTEGER PRIMARY KEY,
        proposal_id INTEGER NOT NULL REFERENCES proposals(id),
        item_id INTEGER NOT NULL,
        side TEXT NOT NULL
      )
    `);

    // Create items table (referenced by proposal_items)
    await client.execute(`
      CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert a test user
    await client.execute(`
      INSERT OR IGNORE INTO users (id, email) VALUES (1, 'test@example.com')
    `);

    console.log('Database initialized successfully');
    process.exit(0);
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

initDatabase();
