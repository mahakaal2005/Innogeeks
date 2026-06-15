import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

function buildPool(): InstanceType<typeof Pool> {
  const host = process.env.SUPABASE_DB_HOST;
  const password = process.env.SUPABASE_DB_PASSWORD;

  if (host && password) {
    return new Pool({
      host,
      port: Number(process.env.SUPABASE_DB_PORT ?? "5432"),
      user: process.env.SUPABASE_DB_USER ?? "postgres",
      password,
      database: process.env.SUPABASE_DB_NAME ?? "postgres",
      ssl: { rejectUnauthorized: false },
      max: 20,
    });
  }

  if (process.env.DATABASE_URL) {
    return new Pool({ connectionString: process.env.DATABASE_URL });
  }

  throw new Error(
    "No database configuration found. Set SUPABASE_DB_HOST + SUPABASE_DB_PASSWORD (or DATABASE_URL).",
  );
}

export const pool = buildPool();
export const db = drizzle(pool, { schema });

export * from "./schema";
