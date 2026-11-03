-- Requires the existing profiles table and public.is_admin() function from schema.sql.
-- Safe to apply repeatedly; policies are recreated by name.

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
grant select on public.original_jobs to anon, authenticated;
grant insert, update on public.original_jobs to authenticated;
create index if not exists original_jobs_published_date_idx on public.original_jobs (date_posted desc) where status = 'published';

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
grant insert on public.job_applications to anon, authenticated;
grant select, update on public.job_applications to authenticated;
create index if not exists job_applications_job_date_idx on public.job_applications (job_id, created_at desc);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('cvs', 'cvs', false, 5242880, array['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
on conflict (id) do update set public = false, file_size_limit = 5242880, allowed_mime_types = excluded.allowed_mime_types;
drop policy if exists "Applicants can upload CVs for published jobs" on storage.objects;
drop policy if exists "Admins can read applicant CVs" on storage.objects;
create policy "Applicants can upload CVs for published jobs" on storage.objects for insert to anon, authenticated with check (
  bucket_id = 'cvs'
  and exists (select 1 from public.original_jobs where id::text = (storage.foldername(name))[1] and status = 'published')
  and storage.filename(name) ~ '^[0-9a-f-]{36}[.](pdf|docx)$'
);
create policy "Admins can read applicant CVs" on storage.objects for select to authenticated using (bucket_id = 'cvs' and public.is_admin());
