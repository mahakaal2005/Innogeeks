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

**How to apply:** After any `pnpm --filter @workspace/api-spec run codegen`, verify `lib/api-zod/src/index.ts` still only has the single `export * from "./generated/api"` line.
