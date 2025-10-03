import { Router, Request, Response } from 'express';
import type { Logger } from 'pino';
import { z } from 'zod';
import { and, eq, inArray, like, sql } from 'drizzle-orm';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import {
  trades,
  tradeTypes,
  tradeStatuses,
  proposals,
  proposalStatuses,
  proposalItems,
  proposalItemSides,
} from '../db/schema/trades.ts';

// Helpers
const ok = (res: Response, data: unknown, status = 200) => res.status(status).json({ success: true, data });
const fail = (res: Response, message: string, status = 400, extra?: Record<string, unknown>) =>
  res.status(status).json({ success: false, error: message, ...extra });

// Zod Schemas
const createTradeSchema = z.object({
  creatorId: z.number().int().positive(),
  type: z.enum(tradeTypes),
  title: z.string().min(1),
  body: z.string().optional(),
  tags: z.array(z.string()).max(20).optional(),
  status: z.enum(tradeStatuses).default('open'),
  expiresAt: z.string().datetime().optional(),
});

const listTradesQuerySchema = z.object({
  type: z.enum(tradeTypes).optional(),
  status: z.enum(tradeStatuses).optional(),
  q: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

const proposalItemSchema = z.object({
  itemId: z.number().int().positive(),
  side: z.enum(proposalItemSides),
});

const createProposalSchema = z.object({
  proposerId: z.number().int().positive(),
  creatorCashCents: z.number().int().min(0).default(0),
  proposerCashCents: z.number().int().min(0).default(0),
  items: z.array(proposalItemSchema).default([]),
});

const actorSchema = z.object({ actorId: z.number().int().positive() });

export function createTradesRouter(deps: { db: LibSQLDatabase; logger: Logger }) {
  const { db, logger } = deps;
  const router = Router();

  // POST /v1/trades -> create new trade
  router.post('/v1/trades', async (req, res) => {
    try {
      const body = createTradeSchema.parse(req.body);
      const inserted = await db
        .insert(trades)
        .values({
          creatorId: body.creatorId,
          type: body.type,
          title: body.title,
          body: body.body,
          tags: (body.tags ?? null) as unknown as string[] | null,
          status: body.status ?? 'open',
          expiresAt: body.expiresAt ?? null,
        })
        .returning();

      return ok(res, inserted[0], 201);
    } catch (err: any) {
      logger.error({ err }, 'failed to create trade');
      if (err instanceof z.ZodError) return fail(res, 'Invalid request', 400, { issues: err.issues });
      return fail(res, 'Internal error', 500);
    }
  });

  // GET /v1/trades -> list trades (filter by type, status, q)
  router.get('/v1/trades', async (req, res) => {
    try {
      const query = listTradesQuerySchema.parse(req.query);
      const filters = [] as any[];
      if (query.type) filters.push(eq(trades.type, query.type));
      if (query.status) filters.push(eq(trades.status, query.status));
      if (query.q) {
        const likeExpr = `%${query.q}%`;
        filters.push(
          and(
            sql`1=1`,
            sql`${trades.title} LIKE ${likeExpr} OR ${trades.body} LIKE ${likeExpr}`,
          ),
        );
      }

      const where = filters.length ? and(...filters) : undefined;
      const rows = await db
        .select()
        .from(trades)
        .where(where as any)
        .limit(query.limit)
        .offset(query.offset);
      return ok(res, rows);
    } catch (err: any) {
      logger.error({ err }, 'failed to list trades');
      if (err instanceof z.ZodError) return fail(res, 'Invalid query', 400, { issues: err.issues });
      return fail(res, 'Internal error', 500);
    }
  });

  // GET /v1/trades/:id -> details + proposals count
  router.get('/v1/trades/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) return fail(res, 'Invalid id', 400);
      const row = await db.query.trades.findFirst({ where: eq(trades.id, id) as any });
      if (!row) return fail(res, 'Not found', 404);
      const [{ cnt }] = await db
        .select({ cnt: sql<number>`cast(count(*) as int)` })
        .from(proposals)
        .where(eq(proposals.tradeId, id));
      return ok(res, { ...row, proposalsCount: cnt });
    } catch (err: any) {
      logger.error({ err }, 'failed to get trade');
      return fail(res, 'Internal error', 500);
    }
  });

  // PATCH /v1/trades/:id/cancel -> creator only
  router.patch('/v1/trades/:id/cancel', async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) return fail(res, 'Invalid id', 400);
      const { actorId } = actorSchema.parse(req.body);
      const row = await db.query.trades.findFirst({ where: eq(trades.id, id) as any });
      if (!row) return fail(res, 'Not found', 404);
      if (row.creatorId !== actorId) return fail(res, 'Forbidden', 403);
      if (row.status !== 'open') return fail(res, 'Trade not open', 409);
      const updated = await db.update(trades).set({ status: 'cancelled' }).where(eq(trades.id, id)).returning();
      return ok(res, updated[0]);
    } catch (err: any) {
      logger.error({ err }, 'failed to cancel trade');
      if (err instanceof z.ZodError) return fail(res, 'Invalid request', 400, { issues: err.issues });
      return fail(res, 'Internal error', 500);
    }
  });

  // POST /v1/trades/:id/proposals -> create proposal
  router.post('/v1/trades/:id/proposals', async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) return fail(res, 'Invalid id', 400);
      const body = createProposalSchema.parse(req.body);

      const tradeRow = await db.query.trades.findFirst({ where: eq(trades.id, id) as any });
      if (!tradeRow) return fail(res, 'Trade not found', 404);
      if (tradeRow.status !== 'open') return fail(res, 'Trade not open', 409);

      const items = body.items ?? [];
      const creatorItems = items.filter((i) => i.side === 'creator');
      const proposerItems = items.filter((i) => i.side === 'proposer');
      if (creatorItems.length > 12 || proposerItems.length > 12) return fail(res, 'Max 12 items per side', 400);
      const anyItems = items.length > 0;
      const anyCash = (body.creatorCashCents ?? 0) + (body.proposerCashCents ?? 0) > 0;
      if (!anyItems && !anyCash) return fail(res, 'Provide at least 1 item or cash > 0', 400);

      const inserted = await db
        .insert(proposals)
        .values({
          tradeId: id,
          proposerId: body.proposerId,
          creatorCashCents: body.creatorCashCents ?? 0,
          proposerCashCents: body.proposerCashCents ?? 0,
          status: 'pending',
        })
        .returning();
      const proposal = inserted[0];

      if (items.length) {
        await db.insert(proposalItems).values(items.map((i) => ({
          proposalId: proposal.id,
          itemId: i.itemId,
          side: i.side,
        })));
      }

      return ok(res, proposal, 201);
    } catch (err: any) {
      logger.error({ err }, 'failed to create proposal');
      if (err instanceof z.ZodError) return fail(res, 'Invalid request', 400, { issues: err.issues });
      return fail(res, 'Internal error', 500);
    }
  });

  // GET /v1/trades/:id/proposals -> list proposals for a trade
  router.get('/v1/trades/:id/proposals', async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) return fail(res, 'Invalid id', 400);
      const props = await db.select().from(proposals).where(eq(proposals.tradeId, id));
      const propIds = props.map((p) => p.id);
      const items = propIds.length
        ? await db.select().from(proposalItems).where(inArray(proposalItems.proposalId, propIds))
        : [];
      const byProposal: Record<number, { proposal: any; items: any[] }> = {};
      for (const p of props) byProposal[p.id] = { proposal: p, items: [] };
      for (const it of items) byProposal[it.proposalId]?.items.push(it);
      return ok(res, Object.values(byProposal));
    } catch (err: any) {
      logger.error({ err }, 'failed to list proposals');
      return fail(res, 'Internal error', 500);
    }
  });

  // GET /v1/proposals/:id -> get single proposal details
  router.get('/v1/proposals/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) return fail(res, 'Invalid id', 400);
      const prop = await db.query.proposals.findFirst({ where: eq(proposals.id, id) as any });
      if (!prop) return fail(res, 'Not found', 404);
      const items = await db.select().from(proposalItems).where(eq(proposalItems.proposalId, id));
      return ok(res, { ...prop, items });
    } catch (err: any) {
      logger.error({ err }, 'failed to get proposal');
      return fail(res, 'Internal error', 500);
    }
  });

  // PATCH /v1/proposals/:id/withdraw -> proposer withdraws
  router.patch('/v1/proposals/:id/withdraw', async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) return fail(res, 'Invalid id', 400);
      const { actorId } = actorSchema.parse(req.body);
      const prop = await db.query.proposals.findFirst({ where: eq(proposals.id, id) as any });
      if (!prop) return fail(res, 'Not found', 404);
      if (prop.proposerId !== actorId) return fail(res, 'Forbidden', 403);
      if (prop.status !== 'pending') return fail(res, 'Proposal not pending', 409);
      const updated = await db.update(proposals).set({ status: 'withdrawn' }).where(eq(proposals.id, id)).returning();
      return ok(res, updated[0]);
    } catch (err: any) {
      logger.error({ err }, 'failed to withdraw proposal');
      if (err instanceof z.ZodError) return fail(res, 'Invalid request', 400, { issues: err.issues });
      return fail(res, 'Internal error', 500);
    }
  });

  // POST /v1/proposals/:id/decline -> creator declines
  router.post('/v1/proposals/:id/decline', async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) return fail(res, 'Invalid id', 400);
      const { actorId } = actorSchema.parse(req.body);
      const prop = await db.query.proposals.findFirst({ where: eq(proposals.id, id) as any });
      if (!prop) return fail(res, 'Not found', 404);
      const tradeRow = await db.query.trades.findFirst({ where: eq(trades.id, prop.tradeId) as any });
      if (!tradeRow) return fail(res, 'Trade not found', 404);
      if (tradeRow.creatorId !== actorId) return fail(res, 'Forbidden', 403);
      if (prop.status !== 'pending') return fail(res, 'Proposal not pending', 409);
      const updated = await db.update(proposals).set({ status: 'declined' }).where(eq(proposals.id, id)).returning();
      return ok(res, updated[0]);
    } catch (err: any) {
      logger.error({ err }, 'failed to decline proposal');
      if (err instanceof z.ZodError) return fail(res, 'Invalid request', 400, { issues: err.issues });
      return fail(res, 'Internal error', 500);
    }
  });

  // POST /v1/proposals/:id/accept -> creator accepts
  router.post('/v1/proposals/:id/accept', async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) return fail(res, 'Invalid id', 400);
      const { actorId } = actorSchema.parse(req.body);

      const result = await db.transaction(async (tx) => {
        const prop = await tx.query.proposals.findFirst({ where: eq(proposals.id, id) as any });
        if (!prop) return { error: { code: 404, message: 'Not found' } };
        const tradeRow = await tx.query.trades.findFirst({ where: eq(trades.id, prop.tradeId) as any });
        if (!tradeRow) return { error: { code: 404, message: 'Trade not found' } };
        if (tradeRow.creatorId !== actorId) return { error: { code: 403, message: 'Forbidden' } };
        if (tradeRow.status !== 'open' || prop.status !== 'pending') return { error: { code: 409, message: 'Trade or proposal not open/pending' } };

        const itemsRows = await tx.select().from(proposalItems).where(eq(proposalItems.proposalId, id));
        const itemIds = itemsRows.map((r) => r.itemId);

        // Optional: if no items and zero cash on both sides, reject
        if (itemIds.length === 0 && (prop.creatorCashCents ?? 0) + (prop.proposerCashCents ?? 0) === 0) {
          return { error: { code: 400, message: 'Nothing to accept (no items and no cash)' } };
        }

        // Create lock table and attempt to lock all items for this proposal
        await tx.execute(
          sql`CREATE TABLE IF NOT EXISTS item_locks (item_id integer PRIMARY KEY, proposal_id integer NOT NULL, locked_at text DEFAULT CURRENT_TIMESTAMP NOT NULL)`,
        );

        // try to lock items (if any)
        for (const itemId of itemIds) {
          try {
            await tx.execute(sql`INSERT INTO item_locks (item_id, proposal_id) VALUES (${itemId}, ${id})`);
          } catch (e: any) {
            // lock conflict
            return { error: { code: 409, message: 'One or more items are currently locked' } };
          }
        }

        // ensure none of these items are already in accepted proposals
        if (itemIds.length) {
          const [{ cnt }] = await tx
            .select({ cnt: sql<number>`cast(count(*) as int)` })
            .from(proposalItems)
            .innerJoin(proposals, eq(proposalItems.proposalId, proposals.id))
            .where(and(inArray(proposalItems.itemId, itemIds), eq(proposals.status, 'accepted')));
          if (cnt > 0) {
            // release locks then conflict
            await tx.execute(sql`DELETE FROM item_locks WHERE item_id IN (${sql.join(itemIds, sql`, `)})`);
            return { error: { code: 409, message: 'Items already unavailable' } };
          }
        }

        // accept this proposal
        await tx.update(proposals).set({ status: 'accepted' }).where(eq(proposals.id, id));
        // close trade
        await tx.update(trades).set({ status: 'closed' }).where(eq(trades.id, prop.tradeId));
        // decline others
        await tx
          .update(proposals)
          .set({ status: 'declined' })
          .where(and(eq(proposals.tradeId, prop.tradeId), eq(proposals.status, 'pending')));

        // release locks for these items (state is persisted now)
        if (itemIds.length) {
          await tx.execute(sql`DELETE FROM item_locks WHERE item_id IN (${sql.join(itemIds, sql`, `)})`);
        }

        const accepted = await tx.query.proposals.findFirst({ where: eq(proposals.id, id) as any });
        return { accepted };
      });

      if ('error' in result && result.error) {
        return fail(res, result.error.message, result.error.code);
      }

      return ok(res, (result as any).accepted);
    } catch (err: any) {
      logger.error({ err }, 'failed to accept proposal');
      if (err instanceof z.ZodError) return fail(res, 'Invalid request', 400, { issues: err.issues });
      return fail(res, 'Internal error', 500);
    }
  });

  return router;
}

export default createTradesRouter;


