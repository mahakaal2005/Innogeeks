---
name: Express API architecture
description: Trusted Express server pattern for Club Innogeeks — what it handles, key conventions, and how it authenticates.
---

# Express API architecture

## What the trusted server handles (service-role key, bypasses RLS)
- `POST /api/payments/orders` — create Razorpay order (idempotent via razorpay_order_id check)
- `POST /api/payments/webhook` — verify HMAC-SHA256 signature, update payment_status
- `GET  /api/quiz/:quizId` — serve questions WITHOUT correct_option_index
- `POST /api/quiz/:quizId/submit` — server-side scoring, one-per-email, updates round1_status
- `POST /api/recruitment/assign-role` — calls `assign_member_role` Postgres RPC atomically
- `POST /api/cloudinary/sign` — HMAC-SHA256 of sorted params + api_secret

## Auth pattern
- `requireAuth` middleware: extracts Bearer JWT → `supabaseAdmin.auth.getUser(token)` → `req.user`
- `requireCoreTeam` middleware: requireAuth + role check via service-role DB query
- Webhook endpoint: no JWT (Razorpay doesn't send one); verified by HMAC-SHA256 of rawBody

## Raw body for webhook
- `express.json()` has a `verify` callback that saves `req.rawBody = buf`
- Webhook handler reads `req.rawBody` directly (not `req.body`) for signature check

## Rate limits (express-rate-limit)
- `generalLimiter`: 120 req/min — applied app-wide
- `paymentLimiter`: 20 req/min — payments routes
- `quizLimiter`: 5 req/min — quiz submit (prevents brute force)

## CORS
- `ALLOWED_ORIGINS` env var (comma-separated); if empty, allows all origins (dev mode)
- Set this in production to actual Android app domain

## Key files
- `artifacts/api-server/src/lib/supabase.ts` — supabaseAdmin singleton
- `artifacts/api-server/src/lib/razorpay.ts` — razorpay singleton (null if keys missing, returns 503)
- `artifacts/api-server/src/middleware/auth.ts` — requireAuth, requireCoreTeam
- `artifacts/api-server/src/middleware/rateLimiter.ts` — tiered limiters
- `artifacts/api-server/src/routes/` — payments, quiz, recruitment, cloudinary

**Why:** Express trusted server is the ONLY way to do operations that require the service-role key (bypassing RLS) or calling external APIs (Razorpay, Cloudinary) with secret keys that can't be on the client.
