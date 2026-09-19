-- Store explicit, user-owned coping preferences for future personalized support.
create table if not exists public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  preference text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_user_preferences_user_preference
  on public.user_preferences (user_id, preference);

create index if not exists idx_user_preferences_user_id
  on public.user_preferences (user_id);

alter table public.user_preferences enable row level security;

create policy "Preferences can be read by owner"
  on public.user_preferences
  for select
  using (auth.uid() = user_id);

create policy "Preferences can be created by owner"
  on public.user_preferences
  for insert
  with check (auth.uid() = user_id);

create policy "Preferences can be updated by owner"
  on public.user_preferences
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Preferences can be deleted by owner"
  on public.user_preferences
  for delete
  using (auth.uid() = user_id);
