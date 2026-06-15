#!/bin/bash
set -e

# Install workspace dependencies to match the merged lockfile.
pnpm install --frozen-lockfile

# NOTE: intentionally NOT running `drizzle-kit push` here.
# The Supabase pooler is unreachable from Replit (ENOTFOUND tenant error), so
# schema changes are applied manually via the Supabase SQL Editor using the
# files in supabase/migrations/. See replit.md "Gotchas".
