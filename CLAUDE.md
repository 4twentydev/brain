# Brain - Development Guide

## Project Structure
Monorepo with pnpm workspaces + Turborepo.

- `apps/web` — Next.js 16 (App Router) + Tailwind 4 + shadcn-style components
- `apps/mobile` — Expo SDK 55 + NativeWind v5 (Tailwind 4)
- `packages/shared` — TypeScript types, constants, Zod validation, utils
- `packages/supabase` — Supabase client, typed queries, React hooks
- `supabase/migrations/` — SQL migrations (source of truth for DB schema)

## Commands
- `pnpm dev` — Start all apps in dev mode (via Turborepo)
- `pnpm build` — Build all apps
- `pnpm --filter web dev` — Start only the web app
- `pnpm --filter mobile start` — Start only the mobile app
- `pnpm --filter web build` — Build only the web app

## Key Conventions
- Dark mode first (background: #09090b)
- Design tokens shared between web (CSS variables) and mobile (NativeWind theme)
- All workspace-scoped tables have `workspace_id` column + RLS policies
- Two roles: `admin` (full access) and `worker` (assigned items only)
- Workspace types: `organization` (Elward Systems) and `personal`
- Task model is unified — shopping items, maintenance tasks, and regular tasks use the same `tasks` table with a `type` discriminator
- Fractional indexing via `position` column for manual ordering

## Environment Variables
### Web (apps/web/.env.local)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Mobile (apps/mobile/.env)
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
