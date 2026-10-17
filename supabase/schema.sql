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
  mode text not null default 'Remote' check (mode in ('Remote', 'Hybrid', 'Onsite')),
  pay text not null default 'Not specified',
  description text not null check (char_length(description) between 40 and 3000),
  apply_url text,
    status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
    submitted_by uuid not null references auth.users(id) on delete cascade,
    created_at timestamptz not null default now()
  );

  alter table public.profiles enable row level security;
  alter table public.job_submissions enable row level security;

  create or replace function public.is_admin()
  returns boolean language sql stable security definer set search_path = public
  as $$ select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$ begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

  drop policy if exists "Users can read their own profile" on public.profiles;
  drop policy if exists "Users can submit jobs" on public.job_submissions;
  drop policy if exists "Users can read own jobs and admins can read all" on public.job_submissions;
  drop policy if exists "Admins can moderate jobs" on public.job_submissions;
  create policy "Users can read their own profile" on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
  create policy "Users can submit jobs" on public.job_submissions for insert to authenticated with check (submitted_by = auth.uid());
  create policy "Users can read own jobs and admins can read all" on public.job_submissions for select to authenticated using (submitted_by = auth.uid() or public.is_admin());
  create policy "Admins can moderate jobs" on public.job_submissions for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Safe upgrades for an existing table created before these fields were added.
alter table public.job_submissions add column if not exists mode text not null default 'Remote';
alter table public.job_submissions add column if not exists pay text not null default 'Not specified';
alter table public.job_submissions add column if not exists description text not null default 'No description provided';
alter table public.job_submissions add column if not exists apply_url text;

  -- After creating an account, promote the intended admin in Supabase SQL editor:
  -- insert into public.profiles (id, role) values ('USER_UUID_HERE', 'admin') on conflict (id) do update set role = 'admin';

