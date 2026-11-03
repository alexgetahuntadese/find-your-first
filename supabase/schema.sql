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
  contact_email text not null,
  contact_phone text not null,
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
alter table public.job_submissions add column if not exists contact_email text;
alter table public.job_submissions add column if not exists contact_phone text;

  -- After creating an account, promote the intended admin in Supabase SQL editor:
  -- insert into public.profiles (id, role) values ('USER_UUID_HERE', 'admin') on conflict (id) do update set role = 'admin';

-- Original EthioHub vacancies. Admins publish verified, original listings here;
-- the public site and sitemap read only published rows.
create table if not exists public.original_jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 160),
  company text not null check (char_length(company) between 2 and 120),
  location text not null check (char_length(location) between 2 and 120),
  type text not null check (type in ('Internship', 'Full-time Entry Level', 'Contract')),
  mode text not null check (mode in ('Remote', 'Hybrid', 'Onsite')),
  experience text not null check (experience in ('Undergrad', 'New Grad', '0-2 Years')),
  industry text not null check (industry in ('Tech', 'Design', 'Finance', 'Healthcare', 'Marketing', 'Operations')),
  category text not null check (category in ('Software Engineering', 'Data Analytics', 'Design', 'Marketing', 'Finance', 'Healthcare', 'Operations')),
  pay text not null default 'Not specified',
  paid boolean not null default false,
  tags text[] not null default '{}',
  description text not null check (char_length(description) between 80 and 5000),
  deadline date,
  status text not null default 'published' check (status in ('draft', 'published', 'closed')),
  created_by uuid not null references auth.users(id),
  date_posted timestamptz not null default now(),
  created_at timestamptz not null default now()
);
alter table public.original_jobs enable row level security;
drop policy if exists "Public can read published original jobs" on public.original_jobs;
drop policy if exists "Admins manage original jobs" on public.original_jobs;
create policy "Public can read published original jobs" on public.original_jobs for select to anon, authenticated using (status = 'published' or public.is_admin());
create policy "Admins manage original jobs" on public.original_jobs for all to authenticated using (public.is_admin()) with check (public.is_admin());
create index if not exists original_jobs_published_date_idx on public.original_jobs (date_posted desc) where status = 'published';

-- Applications are private. Applicants can submit but cannot read records;
-- only admins can review them and issue short-lived CV links.
create table if not exists public.job_applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.original_jobs(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (char_length(email) <= 254),
  phone text not null check (char_length(phone) between 5 and 40),
  education text not null check (char_length(education) between 2 and 160),
  note text not null default '' check (char_length(note) <= 2000),
  privacy_consent boolean not null default true check (privacy_consent),
  resume_path text not null unique,
  status text not null default 'new' check (status in ('new', 'reviewed', 'shortlisted', 'rejected')),
  created_at timestamptz not null default now()
);
alter table public.job_applications enable row level security;
drop policy if exists "Anyone can submit an application" on public.job_applications;
drop policy if exists "Admins can review applications" on public.job_applications;
create policy "Anyone can submit an application" on public.job_applications for insert to anon, authenticated with check (
  exists (select 1 from public.original_jobs where id = job_id and status = 'published')
  and resume_path like job_id::text || '/%'
);
create policy "Admins can review applications" on public.job_applications for all to authenticated using (public.is_admin()) with check (public.is_admin());
create index if not exists job_applications_job_date_idx on public.job_applications (job_id, created_at desc);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('cvs', 'cvs', false, 5242880, array['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
on conflict (id) do update set public = false, file_size_limit = 5242880, allowed_mime_types = excluded.allowed_mime_types;
drop policy if exists "Applicants can upload CVs for published jobs" on storage.objects;
drop policy if exists "Admins can read applicant CVs" on storage.objects;
create policy "Applicants can upload CVs for published jobs" on storage.objects for insert to anon, authenticated with check (
  bucket_id = 'cvs'
  and exists (select 1 from public.original_jobs where id::text = (storage.foldername(name))[1] and status = 'published')
  and (storage.filename(name) ~ '^[0-9a-f-]{36}[.](pdf|docx)$')
);
create policy "Admins can read applicant CVs" on storage.objects for select to authenticated using (bucket_id = 'cvs' and public.is_admin());
