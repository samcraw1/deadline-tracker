# Deadline Tracker

Automated DOL retirement plan notice deadline tracking for third-party administrators (TPAs).

## The Problem

TPAs manage dozens of retirement plans, each requiring 8-15 DOL-mandated notices per year. Missing a single deadline means compliance risk, potential penalties, and audit headaches. Most firms track this in spreadsheets that break when plans change, staff turns over, or plan year ends vary across clients.

## What This Does

- **Deadline Engine** — Automatically generates notice deadlines based on each client's plan type (401k, 403b, DB, 457b), plan year end, and features (Safe Harbor, Auto Enrollment, RMD). Handles annual, quarterly, and event-driven notices.
- **Dashboard with Overdue Alerts** — At-a-glance view of what's overdue, due this week, and upcoming. Overdue items are impossible to miss.
- **Status Workflow** — Pending > Sent > Confirmed, with timestamped notes for audit trail ("Sent via email to john@company.com 3/10/26").
- **Compliance Reports** — CSV export and printable reports per client, ready for DOL auditors.
- **AI Compliance Assistant** — Built-in chatbot for quick answers about DOL notice requirements and ERISA regulations.
- **Daily Cron** — Automatically marks past-due deadlines as overdue and logs alerts.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, TypeScript) |
| Database | Supabase (Postgres + Auth + RLS) |
| UI | shadcn/ui + Tailwind CSS v4 |
| AI | OpenAI GPT-4o-mini (streaming) |
| Hosting | Vercel (with Cron) |

## Architecture Decisions

**Server Components everywhere** — All pages fetch data on the server. No loading spinners, no client-side data fetching, no stale cache issues. The dashboard loads with real data, not skeletons.

**Deadline engine as pure logic** — `lib/deadline-engine.ts` takes a client and notice types, returns deadline objects. No side effects beyond the final DB upsert. Easy to test, easy to extend.

**URL-driven filters** — Deadline filters use `searchParams`, so filtered views are shareable and survive refresh. No client state to manage.

**Row-Level Security** — Every table has RLS policies. Currently all authenticated users see everything (internal team), but the schema is ready for multi-tenant isolation.

**Upsert with plan_year** — Deadlines use a unique constraint on `(client_id, notice_type_id, plan_year)`. Regenerating deadlines never creates duplicates.

## What I'd Add Next

- **Email notifications** via Resend — automated alerts at 60, 30, and 7 days before due
- **Multi-tenant workspaces** — isolate client data by TPA firm using Supabase RLS
- **ICS calendar export** — sync deadlines to Outlook/Google Calendar
- **Bulk status updates** — mark multiple deadlines as sent at once
- **PDF branded reports** — templated compliance reports with firm branding
- **File attachments** — attach proof of delivery (email receipts, certified mail tracking)
- **Audit versioning** — track every status change with who/when/why

## Getting Started

```bash
npm install
cp .env.example .env.local  # add your Supabase + OpenAI keys
npm run dev
```

## Environment Variables

| Variable | Description |
|----------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `OPENAI_API_KEY` | OpenAI API key for chat assistant |
| `CRON_SECRET` | Secret for authenticating cron job requests |
