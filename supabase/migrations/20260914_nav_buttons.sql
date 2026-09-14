alter table public.app_buttons
  add column if not exists placement text not null default 'home',
  add column if not exists system_key text;

create unique index if not exists app_buttons_system_key_unique
  on public.app_buttons(system_key)
  where system_key is not null;

update public.app_buttons
set placement = 'home'
where placement is null or placement = '';

insert into public.app_buttons (label, icon, action_type, action_value, style, active, visible, placement, sort_order, system_key)
values
  ('Inicio', '⌂', 'home', null, 'normal', true, true, 'nav', 1, 'home'),
  ('Explorar', '👟', 'catalog', null, 'normal', true, true, 'nav', 2, 'catalog'),
  ('Carrito', '🛒', 'cart', null, 'normal', true, true, 'nav', 3, 'cart')
on conflict (system_key) where system_key is not null do update
set label = excluded.label,
    icon = excluded.icon,
    action_type = excluded.action_type,
    placement = 'nav';
