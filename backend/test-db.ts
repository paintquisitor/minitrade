import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { trades } from './db/schema/trades.js';

// Database setup
const client = createClient({
  url: 'file:./local.db',
});

const db = drizzle(client);

async function testInsert() {
  try {
    console.log('Testing database insert...');
    const result = await db.insert(trades).values({
      creatorId: 1,
      type: 'WTS',
      title: 'Test Trade',
      body: 'Test body',
      tags: null,
      status: 'open',
    }).returning();

    console.log('Insert successful:', result);
  } catch (error) {
    console.error('Insert failed:', error);
  }
}

testInsert();
