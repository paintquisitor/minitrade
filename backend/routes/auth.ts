import { Router, Request, Response } from 'express';
import type { Logger } from 'pino';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import { eq } from 'drizzle-orm';
import { users } from '../db/schema/users';

// Types for request/response
declare module 'express-session' {
  interface SessionData {
    userId?: number;
  }
}

// Helper functions
const ok = (res: Response, data: unknown, status = 200) => res.status(status).json({ success: true, data });
const fail = (res: Response, message: string, status = 400, extra?: Record<string, unknown>) =>
  res.status(status).json({ success: false, error: message, ...extra });

// Zod schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export function createAuthRouter(deps: { db: LibSQLDatabase; logger: Logger }) {
  const { db, logger } = deps;
  const router = Router();

  // POST /v1/auth/register - Register new user
  router.post('/v1/auth/register', async (req, res) => {
    try {
      const body = registerSchema.parse(req.body);

      // Check if user already exists (email should be unique but database doesn't enforce it)
      const existingUsers = await db.select().from(users).where(eq(users.email, body.email)).limit(1);
      if (existingUsers.length > 0) {
        return fail(res, 'User with this email already exists', 409);
      }

      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(body.password, saltRounds);

      // Create user
      const inserted = await db
        .insert(users)
        .values({
          email: body.email,
          passwordHash,
          displayName: body.displayName || body.email.split('@')[0],
          createdAt: new Date().toISOString(),
        })
        .returning();

      // Set session
      req.session.userId = inserted[0].id;

      return ok(res, {
        user: {
          id: inserted[0].id,
          email: inserted[0].email,
          displayName: inserted[0].displayName,
        }
      }, 201);
    } catch (err: any) {
      logger.error({ err }, 'failed to register user');
      if (err instanceof z.ZodError) return fail(res, 'Invalid request', 400, { issues: err.issues });
      return fail(res, 'Internal error', 500);
    }
  });

  // POST /v1/auth/login - Login user
  router.post('/v1/auth/login', async (req, res) => {
    try {
      const body = loginSchema.parse(req.body);

      // Find user
      const userRows = await db.select().from(users).where(eq(users.email, body.email)).limit(1);
      if (userRows.length === 0) {
        return fail(res, 'Invalid credentials', 401);
      }

      const user = userRows[0];

      // Check password
      const isValidPassword = await bcrypt.compare(body.password, user.passwordHash);
      if (!isValidPassword) {
        return fail(res, 'Invalid credentials', 401);
      }

      // Set session
      req.session.userId = user.id;

      return ok(res, {
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
        }
      });
    } catch (err: any) {
      logger.error({ err }, 'failed to login user');
      if (err instanceof z.ZodError) return fail(res, 'Invalid request', 400, { issues: err.issues });
      return fail(res, 'Internal error', 500);
    }
  });

  // POST /v1/auth/logout - Logout user
  router.post('/v1/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        logger.error({ err }, 'failed to logout user');
        return fail(res, 'Failed to logout', 500);
      }
      res.clearCookie('connect.sid');
      return ok(res, { message: 'Logged out successfully' });
    });
  });

  // GET /v1/auth/me - Get current user
  router.get('/v1/auth/me', async (req, res) => {
    try {
      if (!req.session.userId) {
        return fail(res, 'Not authenticated', 401);
      }

      const userRows = await db.select().from(users).where(eq(users.id, req.session.userId)).limit(1);
      if (userRows.length === 0) {
        req.session.destroy(() => {});
        return fail(res, 'User not found', 404);
      }

      const user = userRows[0];
      return ok(res, {
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
        }
      });
    } catch (err: any) {
      logger.error({ err }, 'failed to get current user');
      return fail(res, 'Internal error', 500);
    }
  });

  return router;
}

export default createAuthRouter;
