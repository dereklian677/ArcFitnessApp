-- ============================================================
-- Arc Fitness App — Database Schema
-- Run this in the Supabase SQL Editor in one pass
-- ============================================================

-- ============================================================
-- TABLES
-- ============================================================

-- Profiles (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique,
  full_name text,
  height_cm integer,
  weight_kg numeric(5,2),
  goal_type text check (goal_type in ('lean', 'athletic', 'muscular')),
  goal_image_url text,
  progress_score integer default 0,
  rank text default 'Bronze' check (rank in ('Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond')),
  total_workouts integer default 0,
  current_streak integer default 0,
  longest_streak integer default 0,
  created_at timestamptz default now()
);

-- Workouts
create table public.workouts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  notes text,
  completed_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Exercises within a workout
create table public.exercises (
  id uuid default gen_random_uuid() primary key,
  workout_id uuid references public.workouts(id) on delete cascade,
  name text not null,
  sets integer,
  reps integer,
  weight_kg numeric(6,2),
  duration_seconds integer,
  notes text,
  order_index integer default 0
);

-- Progress photos
create table public.progress_photos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  photo_url text not null,
  photo_type text check (photo_type in ('front', 'back', 'side', 'custom')) default 'front',
  ai_score integer,
  ai_notes text,
  taken_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Personal records
create table public.personal_records (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  exercise_name text not null,
  weight_kg numeric(6,2),
  reps integer,
  achieved_at timestamptz default now(),
  unique (user_id, exercise_name)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.workouts enable row level security;
alter table public.exercises enable row level security;
alter table public.progress_photos enable row level security;
alter table public.personal_records enable row level security;

-- Profiles
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Workouts
create policy "Users can manage own workouts" on public.workouts
  for all using (auth.uid() = user_id);

-- Exercises
create policy "Users can manage own exercises" on public.exercises
  for all using (
    auth.uid() = (select user_id from public.workouts where id = workout_id)
  );

-- Progress photos
create policy "Users can manage own photos" on public.progress_photos
  for all using (auth.uid() = user_id);

-- Personal records
create policy "Users can manage own PRs" on public.personal_records
  for all using (auth.uid() = user_id);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create a profiles row when a new auth user signs up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Update total_workouts and rank when a workout is inserted
create or replace function update_user_rank()
returns trigger as $$
declare
  workout_count integer;
  new_rank text;
begin
  select count(*) into workout_count
  from public.workouts
  where user_id = new.user_id;

  new_rank := case
    when workout_count >= 100 then 'Diamond'
    when workout_count >= 50  then 'Platinum'
    when workout_count >= 25  then 'Gold'
    when workout_count >= 10  then 'Silver'
    else 'Bronze'
  end;

  update public.profiles
  set
    total_workouts = workout_count,
    rank = new_rank
  where id = new.user_id;

  return new;
end;
$$ language plpgsql security definer;

create trigger on_workout_created
  after insert on public.workouts
  for each row execute function update_user_rank();

-- ============================================================
-- STORAGE
-- ============================================================

-- Run these in the Supabase Dashboard → Storage → New Bucket
-- OR via the Supabase CLI. SQL storage setup:

insert into storage.buckets (id, name, public)
values ('progress-photos', 'progress-photos', false)
on conflict (id) do nothing;

-- Storage RLS: users can only access their own folder
create policy "Users own their progress photos"
  on storage.objects for all
  using (
    bucket_id = 'progress-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
