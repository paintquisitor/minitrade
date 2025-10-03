import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Minimal stub to satisfy FKs; extend later with real fields
export const items = sqliteTable('items', {
  id: integer('id').primaryKey(),
  name: text('name'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;


