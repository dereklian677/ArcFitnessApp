# ArcFitnessApp

A physique transformation tracker. Log workouts, track progress photos, and visualize your journey toward your goal physique.

---

## Tech Stack

- [Next.js 14](https://nextjs.org/) (App Router)
- [Supabase](https://supabase.com/) (Auth, Database, Storage)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)

---

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com/) project (free tier is fine)
- A [GitHub](https://github.com/) account

---

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/dereklian677/ArcFitnessApp.git
cd ArcFitnessApp
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root of the project:

```bash
cp .env.example .env.local
```

Then fill in your Supabase credentials from your [Supabase project settings](https://app.supabase.com):

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Run the database migration

In your Supabase project, go to the **SQL Editor** and paste the contents of `schema.sql`, then click **Run**.

Alternatively, if you have the Supabase CLI installed:

```bash
supabase db push
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key (server-side only) |

> Never commit your `.env.local` file. It is already listed in `.gitignore`.

---

## Project Structure

```
/app            → Next.js App Router pages
/components     → Reusable UI components
/lib            → Supabase client, hooks, utilities
/types          → TypeScript types
schema.sql      → Database schema and RLS policies
```

---

## Contributing

This is a personal project. Feel free to fork and adapt it for your own use.
