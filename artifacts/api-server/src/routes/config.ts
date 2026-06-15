import { Router } from "express";
import { generalLimiter } from "../middleware/rateLimiter";

const router = Router();

// Public-safe client configuration. The Supabase anon key is designed to be
// embedded in browser clients (row-level security protects the data), so it is
// safe to serve here. This lets the quiz-site admin surface initialise a
// Supabase client for login without requiring build-time VITE_ env vars.
router.get("/public-config", generalLimiter, (_req, res) => {
  res.json({
    supabaseUrl: process.env.SUPABASE_URL ?? null,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? null,
  });
});

export default router;
