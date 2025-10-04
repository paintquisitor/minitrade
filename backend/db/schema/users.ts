import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Users table with authentication fields
export const users = sqliteTable('users', {
  id: integer('id').primaryKey(),
  email: text('email'),
  passwordHash: text('password_hash'),
  displayName: text('display_name'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;


