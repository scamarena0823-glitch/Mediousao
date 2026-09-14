-- MEDIOUSAO: botones administrables desde el ADM
create table if not exists public.app_buttons (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  icon text,
  action_type text not null default 'catalog' check (action_type in ('catalog','category','product','cart','home','url')),
  action_value text,
  style text not null default 'normal' check (style in ('normal','primary')),
  active boolean not null default true,
  sort_order integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.app_buttons enable row level security;

create or replace function public.mediousao_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email',''))
  );
$$;

grant execute on function public.mediousao_is_admin() to anon, authenticated;

drop policy if exists "app_buttons_public_read_active" on public.app_buttons;
create policy "app_buttons_public_read_active"
on public.app_buttons
for select
to anon, authenticated
using (active = true or public.mediousao_is_admin());

drop policy if exists "app_buttons_admin_insert" on public.app_buttons;
create policy "app_buttons_admin_insert"
on public.app_buttons
for insert
to authenticated
with check (public.mediousao_is_admin());

drop policy if exists "app_buttons_admin_update" on public.app_buttons;
create policy "app_buttons_admin_update"
on public.app_buttons
for update
to authenticated
using (public.mediousao_is_admin())
with check (public.mediousao_is_admin());

drop policy if exists "app_buttons_admin_delete" on public.app_buttons;
create policy "app_buttons_admin_delete"
on public.app_buttons
for delete
to authenticated
using (public.mediousao_is_admin());

create or replace function public.mediousao_touch_app_buttons_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists app_buttons_touch_updated_at on public.app_buttons;
create trigger app_buttons_touch_updated_at
before update on public.app_buttons
for each row execute function public.mediousao_touch_app_buttons_updated_at();
