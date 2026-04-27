# Master AI System

Starter repo scaffold for a connected AI operating system that manages ecommerce, content, publishing, app planning, tasks, approvals, workers, analytics, and integrations.

## Stack
- Next.js 15 + TypeScript
- Supabase (Postgres, Auth, Storage)
- OpenAI Responses API
- Tailwind CSS

## Apps
- `apps/web`: dashboard and API routes
- `supabase/schema.sql`: starter schema

## Quick start
1. Copy `apps/web/.env.example` to `.env.local`
2. Create the Supabase schema from `supabase/schema.sql`
3. Install dependencies in `apps/web`
4. Run `npm install`
5. Run `npm run dev`

## Notes
- OAuth and marketplace sync flows are starter skeletons.
- Worker routes are protected by `WORKER_SECRET`.
- Several routes are placeholders intended for later production hardening.
