  create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    role text not null default 'user' check (role in ('user', 'admin')),
    created_at timestamptz not null default now()
  );

  create table if not exists public.job_submissions (
    id uuid primary key default gen_random_uuid(),
    title text not null check (char_length(title) between 3 and 160),
    company text not null check (char_length(company) between 2 and 120),
    location text not null check (char_length(location) between 2 and 120),
    type text not null check (type in ('Internship', 'Full-time Entry Level', 'Contract')),
    status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
    submitted_by uuid not null references auth.users(id) on delete cascade,
    created_at timestamptz not null default now()
  );

  alter table public.profiles enable row level security;
  alter table public.job_submissions enable row level security;

  create or replace function public.is_admin()
  returns boolean language sql stable security definer set search_path = public
  as $$ select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') $$;

  drop policy if exists "Users can read their own profile" on public.profiles;
  drop policy if exists "Users can submit jobs" on public.job_submissions;
  drop policy if exists "Users can read own jobs and admins can read all" on public.job_submissions;
  drop policy if exists "Admins can moderate jobs" on public.job_submissions;
  create policy "Users can read their own profile" on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
  create policy "Users can submit jobs" on public.job_submissions for insert to authenticated with check (submitted_by = auth.uid());
  create policy "Users can read own jobs and admins can read all" on public.job_submissions for select to authenticated using (submitted_by = auth.uid() or public.is_admin());
  create policy "Admins can moderate jobs" on public.job_submissions for update to authenticated using (public.is_admin()) with check (public.is_admin());

  -- After creating an account, promote the intended admin in Supabase SQL editor:
  -- insert into public.profiles (id, role) values ('USER_UUID_HERE', 'admin') on conflict (id) do update set role = 'admin';

