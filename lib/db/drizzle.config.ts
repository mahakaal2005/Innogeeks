import { defineConfig } from "drizzle-kit";
import path from "path";

const host = process.env.SUPABASE_DB_HOST;
const password = process.env.SUPABASE_DB_PASSWORD;

if (!host || !password) {
  throw new Error(
    "SUPABASE_DB_HOST and SUPABASE_DB_PASSWORD must be set; ensure the Supabase database is configured",
  );
}

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    host,
    port: Number(process.env.SUPABASE_DB_PORT ?? "5432"),
    user: process.env.SUPABASE_DB_USER ?? "postgres",
    password,
    database: process.env.SUPABASE_DB_NAME ?? "postgres",
    ssl: { rejectUnauthorized: false },
  },
});
