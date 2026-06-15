# Club Innogeeks

KIET's tech club management platform — Supabase-native backend + thin trusted Express server + Android app + quiz website.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the Express API server (port from `$PORT`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push Drizzle schema (needs Supabase pooler, unreachable from Replit — apply via SQL Editor instead)
- See `.env.example` for all required env vars

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 + Supabase JS v2 (service-role key)
- DB: Supabase Postgres + Drizzle ORM + RLS
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec → React Query hooks + Zod schemas)
- Payments: Razorpay UPI · Files: Cloudinary
- Build: esbuild (CJS bundle)

## Where things live

```
artifacts/api-server/src/
  app.ts                    # Express setup (helmet, cors, rate-limit, 10MB body)
  routes/                   # health, payments, quiz, recruitment, recruitment-admin, admin, cloudinary, club-info, config
  middleware/auth.ts        # requireAuth, requireRole([...]), requireCoreTeam, requireCoordinator
  middleware/rateLimiter.ts # tiered rate limiters (general/payment/quiz)
  lib/supabase.ts           # supabaseAdmin singleton (service-role, bypasses RLS)
  lib/razorpay.ts           # razorpay singleton (returns null if keys missing → 503)

lib/db/src/schema/          # 13-table Drizzle schema (all enums, tables, indexes)
lib/api-spec/openapi.yaml   # OpenAPI contract — source of truth for codegen
lib/api-client-react/       # generated React Query hooks
lib/api-zod/                # generated Zod validators

supabase/migrations/
  001_schema.sql            # DDL — enums, tables, indexes (apply via Supabase SQL Editor)
  002_rls.sql               # RLS policies, profile trigger, assign_member_role RPC
  003_club_info.sql         # club_info singleton table + RLS (public read, core_team write)

docs/                       # architecture docs (PRD, TRP, system design, Android arch, etc.)
.env.example                # all required env vars with descriptions
.local/continuation_prompt.md  # full context for continuing on another platform
```

## Architecture decisions

- **Supabase-native**: Android + quiz site hit Supabase SDKs directly; RLS enforces RBAC. Express only handles operations that need service-role or server-side trust (Razorpay, quiz scoring, Cloudinary signing).
- **JWT verification**: Express reads `Authorization: Bearer <supabase_jwt>`, calls `supabaseAdmin.auth.getUser(token)` — no separate session store needed.
- **Role model**: 4 roles (`public`, `member`, `coordinator`, `core_team`), 5 domains (`android`, `web`, `ml`, `iot`, `arvr`). `requireRole(["coordinator","core_team"])` factory used everywhere.
- **Atomic role assignment**: `assign_member_role` Postgres RPC handles Round2→member atomically inside a transaction; called from Express.
- **Raw body for webhooks**: Razorpay HMAC-SHA256 requires raw bytes; saved via `express.json verify` callback as `req.rawBody`.

## Product

4 roles: public → applies → member → coordinator → core_team. 5 tech domains. Features: recruitment flow (Razorpay UPI payments, Round1 quiz, Round2 interview), attendance, resources, events, admin tools.

## User preferences

- Skip `drizzle-kit push` from Replit (Supabase pooler unreachable) — user applies SQL via MCP/SQL Editor
- User is casual/friendly style

## Gotchas

- **Supabase pooler unreachable from Replit** (ENOTFOUND tenant error, all regions). Apply schema via Supabase SQL Editor or MCP tool — do not attempt `drizzle-kit push` from this environment.
- **Orval codegen overwrites `lib/api-zod/src/index.ts`** adding a second `export * from './generated/types'` which causes TS2308 name-clash. Fixed: codegen script now runs a node one-liner after orval to reset the barrel to only `export * from './generated/api'`.
- **`zod/v4` subpath**: server artifacts must import from `zod/v4`, not `zod`. Package must declare `"zod": "catalog:"` as a direct dependency.
- **Razorpay types**: ships its own TS types — no `@types/razorpay` needed.
- **CORS**: empty `ALLOWED_ORIGINS` allows all origins in dev; set it in production.
- **Never `console.log` in server code**: use `req.log` in handlers, `logger` singleton elsewhere.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- `.local/continuation_prompt.md` — full context document for picking up this project on another platform
