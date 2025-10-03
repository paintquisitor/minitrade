import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: ['./backend/db/schema/**/*.ts'],
  out: './drizzle',
  dialect: 'turso',
  dbCredentials: {
    url: (
      process.env.TURSO_DATABASE_URL ||
      process.env.LIBSQL_URL ||
      process.env.DATABASE_URL ||
      process.env.DB_URL ||
      ''
    ),
    authToken: (
      process.env.TURSO_AUTH_TOKEN ||
      process.env.LIBSQL_AUTH_TOKEN ||
      process.env.AUTH_TOKEN ||
      process.env.DATABASE_AUTH_TOKEN ||
      undefined
    ),
  },
  verbose: true,
  strict: true,
});


