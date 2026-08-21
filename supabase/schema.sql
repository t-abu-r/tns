-- ============================================================================
-- The National School & College (TNS) — Supabase Schema
-- Run this in: Supabase Dashboard -> SQL Editor -> New Query -> Run
--
-- Tables:
--   public.events         -> shown under "Upcoming Events & Schedule"
--   public.announcements  -> shown under "Latest Notices & Announcements"
--
-- Security: Row Level Security (RLS) is ON.
--   - Anyone (visitor on the website) can READ.
--   - Only logged-in admin users (email/password users created in
--     Supabase -> Authentication -> Users) can INSERT / UPDATE / DELETE.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. EVENTS TABLE
-- ---------------------------------------------------------------------------
create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  slug        text not null default '',
  date        date not null,
  description text not null,
  content     text not null default '',
  location    text,
  status      text not null default 'Upcoming',
  media       jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now(),
  created_by  uuid references auth.users (id) on delete set null
);

-- ---------------------------------------------------------------------------
-- 2. ANNOUNCEMENTS TABLE
-- ---------------------------------------------------------------------------
create table if not exists public.announcements (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  slug         text not null default '',
  category     text not null default 'Academic',
  description  text not null,
  content      text not null default '',
  date_label   text not null default '',
  footer_label text not null default '',
  link_text    text not null default 'Enquire',
  link_href    text not null default '#contact',
  media        jsonb not null default '[]'::jsonb,
  created_at   timestamptz not null default now(),
  created_by   uuid references auth.users (id) on delete set null
);

-- ---------------------------------------------------------------------------
-- 3. SETTINGS TABLE (editable content like Administrative Office Hours)
-- ---------------------------------------------------------------------------
create table if not exists public.settings (
  key        text primary key,
  value      text not null default '',
  updated_at timestamptz not null default now()
);

insert into public.settings (key, value) values
  ('office_hours_message',
   'During the summer break, the admissions and admin office is available to assist families with enrollment, fee structure, and prospectus requests.'),
  ('office_hours_day_1', 'Mon – Fri'),
  ('office_hours_time_1', '8:00 AM – 1:00 PM'),
  ('office_hours_day_2', 'Saturday'),
  ('office_hours_time_2', 'Closed')
on conflict (key) do update set value = excluded.value, updated_at = now();

-- ---------------------------------------------------------------------------
-- 4. ENABLE ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------
alter table public.events        enable row level security;
alter table public.announcements enable row level security;
alter table public.settings      enable row level security;

-- ---------------------------------------------------------------------------
-- 5. POLICIES — anyone may read
-- ---------------------------------------------------------------------------
drop policy if exists "public read events" on public.events;
create policy "public read events"
  on public.events
  for select
  using (true);

drop policy if exists "public read announcements" on public.announcements;
create policy "public read announcements"
  on public.announcements
  for select
  using (true);

drop policy if exists "public read settings" on public.settings;
create policy "public read settings"
  on public.settings
  for select
  using (true);

-- ---------------------------------------------------------------------------
-- 6. POLICIES — only logged-in users may write
-- ---------------------------------------------------------------------------
drop policy if exists "authenticated insert events" on public.events;
create policy "authenticated insert events"
  on public.events
  for insert
  with check (auth.role() = 'authenticated');

drop policy if exists "authenticated update events" on public.events;
create policy "authenticated update events"
  on public.events
  for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "authenticated delete events" on public.events;
create policy "authenticated delete events"
  on public.events
  for delete
  using (auth.role() = 'authenticated');

drop policy if exists "authenticated insert announcements" on public.announcements;
create policy "authenticated insert announcements"
  on public.announcements
  for insert
  with check (auth.role() = 'authenticated');

drop policy if exists "authenticated update announcements" on public.announcements;
create policy "authenticated update announcements"
  on public.announcements
  for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "authenticated delete announcements" on public.announcements;
create policy "authenticated delete announcements"
  on public.announcements
  for delete
  using (auth.role() = 'authenticated');

drop policy if exists "authenticated upsert settings" on public.settings;
create policy "authenticated upsert settings"
  on public.settings
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- 7. OPTIONAL SEED — sample rows so the site is not empty while you test
-- ---------------------------------------------------------------------------
-- insert into public.events (title, date, description, location, status) values
--   ('New Academic Session 2026-2027', '2026-08-24',
--    'Campus reopens for the new academic session. Administrative offices remain open Mon-Fri, 8:00 AM - 1:00 PM for admissions inquiries.',
--    'Main Campus, Lahore', 'Active Notice'),
--   ('Orientation Week - New Session 2026-2027', '2026-08-24',
--    'Welcome sessions, timetable distribution, and subject counseling for all O & A Level students. Attendance mandatory.',
--    'Main Assembly Hall, TNS Campus', 'Upcoming');
--
-- insert into public.announcements (title, category, description, date_label, footer_label, link_text, link_href) values
--   ('A-Level Subject Options Form Available', 'Academic',
--    'Students joining A-Level (Grade 11) in Session 2026-2027 are requested to collect and submit their subject selection forms from the Admissions Office before August 20.',
--    'Aug 2026', 'Admissions Office', 'Enquire', '#admissions');
