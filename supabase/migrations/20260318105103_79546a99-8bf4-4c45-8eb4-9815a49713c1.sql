
-- Create community_stations table
create table public.community_stations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  postal_code text not null default '48143',
  hours text not null default 'Not specified',
  description text,
  lat double precision not null,
  lon double precision not null,
  wc boolean not null default false,
  dog boolean not null default false,
  late boolean not null default false,
  photo_url text not null,
  submitted_at timestamptz not null default now(),
  verified boolean not null default false,
  report_count integer not null default 1,
  created_at timestamptz not null default now()
);

alter table public.community_stations enable row level security;

create policy "Public read" on public.community_stations
  for select to anon, authenticated using (true);

create policy "Public insert" on public.community_stations
  for insert to anon, authenticated with check (true);

-- Create storage bucket for station photos
insert into storage.buckets (id, name, public) values ('station-photos', 'station-photos', true);

create policy "Public upload station photos" on storage.objects
  for insert to anon, authenticated with check (bucket_id = 'station-photos');

create policy "Public read station photos" on storage.objects
  for select to anon, authenticated using (bucket_id = 'station-photos');
