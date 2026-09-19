-- Phase 2: Supabase schema for per-user chat sessions and messages
-- This migration creates the required tables, RLS policies, indexes, and a safe
-- profile creation trigger. It does not introduce any service-role key or backend.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text null,
  full_name text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  is_archived boolean not null default false
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chat_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  sender text not null check (sender in ('user', 'cadberry')),
  content text not null,
  created_at timestamptz not null default now(),
  message_order integer not null,
  language text null,
  metadata jsonb null
);

create index if not exists idx_chat_sessions_user_id
  on public.chat_sessions (user_id);

create index if not exists idx_chat_sessions_updated_at
  on public.chat_sessions (updated_at desc);

create index if not exists idx_chat_messages_chat_id
  on public.chat_messages (chat_id);

create index if not exists idx_chat_messages_user_id
  on public.chat_messages (user_id);

create index if not exists idx_chat_messages_created_at
  on public.chat_messages (created_at desc);

alter table public.profiles enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    split_part(new.email, '@', 1)
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(public.profiles.full_name, excluded.full_name),
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create policy "Profiles can be read by owner"
on public.profiles
for select
using (auth.uid() = id);

create policy "Profiles can be created by owner"
on public.profiles
for insert
with check (auth.uid() = id);

create policy "Profiles can be updated by owner"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Sessions can be read by owner"
on public.chat_sessions
for select
using (auth.uid() = user_id);

create policy "Sessions can be created by owner"
on public.chat_sessions
for insert
with check (auth.uid() = user_id);

create policy "Sessions can be updated by owner"
on public.chat_sessions
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Sessions can be deleted by owner"
on public.chat_sessions
for delete
using (auth.uid() = user_id);

create policy "Messages can be read by owners of their chat"
on public.chat_messages
for select
using (
  auth.uid() = user_id
  and exists (
    select 1
    from public.chat_sessions cs
    where cs.id = chat_messages.chat_id
      and cs.user_id = auth.uid()
  )
);

create policy "Messages can be inserted by owners of their chat"
on public.chat_messages
for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.chat_sessions cs
    where cs.id = chat_messages.chat_id
      and cs.user_id = auth.uid()
  )
);

create policy "Messages can be updated by owner"
on public.chat_messages
for update
using (
  auth.uid() = user_id
  and exists (
    select 1
    from public.chat_sessions cs
    where cs.id = chat_messages.chat_id
      and cs.user_id = auth.uid()
  )
)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.chat_sessions cs
    where cs.id = chat_messages.chat_id
      and cs.user_id = auth.uid()
  )
);

create policy "Messages can be deleted by owner"
on public.chat_messages
for delete
using (
  auth.uid() = user_id
  and exists (
    select 1
    from public.chat_sessions cs
    where cs.id = chat_messages.chat_id
      and cs.user_id = auth.uid()
  )
);

-- Optional helper policy for future UI access: messages must belong to the same user and chat.
-- This is enforced by the owner checks above and the chat owner constraint.
