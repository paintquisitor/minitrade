import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { users } from './db/schema/users.js';

// Database setup
const client = createClient({
  url: process.env.TURSO_DATABASE_URL || process.env.LIBSQL_URL || '',
  authToken: process.env.TURSO_AUTH_TOKEN || process.env.LIBSQL_AUTH_TOKEN,
});

const db = drizzle(client);

async function insertUser() {
  try {
    console.log('Inserting test user...');
    const result = await db.insert(users).values({
      id: 1,
      email: 'test@example.com',
    }).returning();

    console.log('User inserted successfully:', result);
  } catch (error) {
    console.error('Failed to insert user:', error);
  }
}

insertUser();
