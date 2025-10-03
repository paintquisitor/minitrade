import { relations, sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { users } from './users.ts';
import { items } from './items.ts';

// Enums (TypeScript-level) for SQLite text columns
export const tradeTypes = ['WTB', 'WTS', 'WTT'] as const;
export type TradeType = typeof tradeTypes[number];

export const tradeStatuses = ['open', 'closed', 'cancelled', 'expired'] as const;
export type TradeStatus = typeof tradeStatuses[number];

export const proposalStatuses = ['pending', 'withdrawn', 'declined', 'accepted', 'expired'] as const;
export type ProposalStatus = typeof proposalStatuses[number];

export const proposalItemSides = ['creator', 'proposer'] as const;
export type ProposalItemSide = typeof proposalItemSides[number];

// trades
export const trades = sqliteTable('trades', {
  id: integer('id').primaryKey(),
  creatorId: integer('creator_id').notNull().references(() => users.id),
  type: text('type').notNull().$type<TradeType>(),
  title: text('title').notNull(),
  body: text('body'),
  tags: text('tags', { mode: 'json' }).$type<string[] | null>(),
  status: text('status').notNull().$type<TradeStatus>(),
  expiresAt: text('expires_at'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

// proposals
export const proposals = sqliteTable('proposals', {
  id: integer('id').primaryKey(),
  tradeId: integer('trade_id').notNull().references(() => trades.id),
  proposerId: integer('proposer_id').notNull().references(() => users.id),
  creatorCashCents: integer('creator_cash_cents').notNull().default(0),
  proposerCashCents: integer('proposer_cash_cents').notNull().default(0),
  status: text('status').notNull().$type<ProposalStatus>(),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

// proposal_items
export const proposalItems = sqliteTable('proposal_items', {
  id: integer('id').primaryKey(),
  proposalId: integer('proposal_id').notNull().references(() => proposals.id),
  itemId: integer('item_id').notNull().references(() => items.id),
  side: text('side').notNull().$type<ProposalItemSide>(),
});

// reviews (stub for later use)
export const reviews = sqliteTable('reviews', {
  id: integer('id').primaryKey(),
  tradeId: integer('trade_id').notNull().references(() => trades.id),
  authorId: integer('author_id').notNull().references(() => users.id),
  targetUserId: integer('target_user_id').notNull().references(() => users.id),
  rating: integer('rating'),
  comment: text('comment'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const tradesRelations = relations(trades, ({ one, many }) => ({
  creator: one(users, {
    fields: [trades.creatorId],
    references: [users.id],
  }),
  proposals: many(proposals),
  reviews: many(reviews),
}));

export const proposalsRelations = relations(proposals, ({ one, many }) => ({
  trade: one(trades, {
    fields: [proposals.tradeId],
    references: [trades.id],
  }),
  proposer: one(users, {
    fields: [proposals.proposerId],
    references: [users.id],
  }),
  items: many(proposalItems),
}));

export const proposalItemsRelations = relations(proposalItems, ({ one }) => ({
  proposal: one(proposals, {
    fields: [proposalItems.proposalId],
    references: [proposals.id],
  }),
  item: one(items, {
    fields: [proposalItems.itemId],
    references: [items.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  trade: one(trades, {
    fields: [reviews.tradeId],
    references: [trades.id],
  }),
  author: one(users, {
    fields: [reviews.authorId],
    references: [users.id],
  }),
  targetUser: one(users, {
    fields: [reviews.targetUserId],
    references: [users.id],
  }),
}));

export type Trade = typeof trades.$inferSelect;
export type NewTrade = typeof trades.$inferInsert;
export type Proposal = typeof proposals.$inferSelect;
export type NewProposal = typeof proposals.$inferInsert;
export type ProposalItem = typeof proposalItems.$inferSelect;
export type NewProposalItem = typeof proposalItems.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;


