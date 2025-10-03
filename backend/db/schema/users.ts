import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Minimal stub to satisfy FKs; extend later with real fields
export const users = sqliteTable('users', {
  id: integer('id').primaryKey(),
  email: text('email'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;


