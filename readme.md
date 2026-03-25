# Arc — Physique Transformation Tracker

A full-stack physique transformation app. Log workouts, upload progress photos, and track your journey toward your goal physique. Features a ranked progression system and AI-powered analysis (coming soon).

---

## Tech Stack

- **Next.js 14** — App Router, Server Components
- **Supabase** — Auth, PostgreSQL database, Storage (`@supabase/ssr`)
- **Tailwind CSS** + **shadcn/ui** — Dark mode UI
- **TypeScript** — Strict mode, zero `any`
- **react-hook-form** + **zod** — Form validation
- **recharts** — Volume charts
- **sonner** — Toast notifications

---

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com/) project (free tier works)

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/dereklian677/ArcFitnessApp.git
cd ArcFitnessApp
npm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
```

Fill in your values from the [Supabase dashboard](https://app.supabase.com) → Project Settings → API:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 3. Run the database schema

In your Supabase project, go to **SQL Editor** → paste the full contents of `schema.sql` → click **Run**.

This creates all tables, RLS policies, triggers, and the storage bucket.

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## App Routes

| Route | Description |
|---|---|
| `/` | Landing page |
| `/signup` | Create account |
| `/login` | Sign in |
| `/onboarding` | Profile setup (post-signup) |
| `/dashboard` | Main dashboard |
| `/workouts` | Workout history |
| `/workouts/new` | Log a workout |
| `/workouts/[id]` | Workout detail |
| `/photos` | Progress photo gallery |
| `/photos/upload` | Upload a photo |
| `/progress` | Progress overview + charts |
| `/profile` | Profile settings |

---

## Project Structure

```
/app
  /(auth)         → Login, Signup
  /(onboarding)   → Post-signup setup
  /(dashboard)    → Authenticated app routes
/components
  /ui             → shadcn/ui primitives
  /layout         → Sidebar, MobileNav, Header
  /workouts       → Workout-specific components
  /photos         → Photo gallery components
  /progress       → Charts, ScoreRing, AI placeholders
  /shared         → EmptyState, RankBadge, SkeletonCard
/lib
  /supabase       → Client/server Supabase instances
  /hooks          → Data fetching hooks
  /utils          → Helper functions
  /validations    → Zod schemas
  /constants      → Exercise list, rank thresholds
/types            → TypeScript types
middleware.ts     → Auth + route protection
schema.sql        → Full database schema
```

---

## Rank System

| Rank | Workouts Required |
|---|---|
| Bronze | 0 |
| Silver | 10 |
| Gold | 25 |
| Platinum | 50 |
| Diamond | 100 |

Rank is updated automatically via a Supabase database trigger on each workout insert.

---

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key (safe for browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key — server-only, never expose to browser |

> Never commit `.env.local`. It is already in `.gitignore`.

---

## Contributing

This is a personal project. Feel free to fork and adapt it for your own use.
