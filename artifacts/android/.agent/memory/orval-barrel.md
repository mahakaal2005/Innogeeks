---
name: Orval codegen barrel conflict
description: How to fix the duplicate export conflict that arises from orval's zod + types dual output.
---

# Orval codegen barrel conflict

## The problem
Orval's `zod` output mode with `schemas: { path: "generated/types", type: "typescript" }` generates:
- `generated/api.ts` — Zod validator schemas (`export const RazorpayWebhookBody = zod.object(...)`)
- `generated/types/` — TypeScript types (`export type RazorpayWebhookBody = {...}`)

Both have the same names. When `lib/api-zod/src/index.ts` re-exports both:
```ts
export * from "./generated/api";
export * from "./generated/types"; // ← conflicts with api.ts names
```
TypeScript throws `TS2308: Module has already exported member 'X'`. `export type *` doesn't fully suppress this either.

## The fix
Only export from `./generated/api` in the barrel:
```ts
export * from "./generated/api";
// do NOT re-export ./generated/types
```
Consumers who need TypeScript types use `z.infer<typeof SchemeName>` — no separate type import needed.

**Why:** Orval generates types specifically so you can use `z.infer<>` — the barrel just needs the Zod schemas, not the redundant type re-exports.

**Permanent fix (2025-06):** The codegen script in `lib/api-spec/package.json` now runs a node one-liner immediately after orval to overwrite the barrel:
```json
"codegen": "orval --config ./orval.config.ts && node -e \"require('fs').writeFileSync('../../lib/api-zod/src/index.ts', \\\"export * from './generated/api';\\\\n\\\")\" && pnpm -w run typecheck:libs"
```
This is the durable fix — do not remove it. Never manually edit `lib/api-zod/src/index.ts`.
