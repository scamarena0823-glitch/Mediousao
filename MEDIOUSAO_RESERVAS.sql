-- MEDIOUSAO: reservas de 24 horas + disponibilidad
-- Zona inicial de servicio: Bonao, República Dominicana
-- Ejecutar una sola vez en Supabase > SQL Editor

alter table public.products
  add column if not exists city text default 'Bonao',
  add column if not exists is_reserved boolean default false,
  add column if not exists reserved_until timestamptz,
  add column if not exists reserved_order_id uuid;

update public.products set city = 'Bonao' where city is null;
create index if not exists idx_products_city on public.products (city);
create index if not exists idx_products_reserved_until
  on public.products (reserved_until);

create index if not exists idx_products_is_reserved
  on public.products (is_reserved);

alter table public.orders
  add column if not exists city text default 'Bonao',
  add column if not exists delivery_sector text;

update public.orders set city = 'Bonao' where city is null;

-- Libera reservas vencidas y devuelve el producto al catálogo.
create or replace function public.release_expired_reservations()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.products
  set is_reserved = false,
      reserved_until = null,
      reserved_order_id = null
  where is_reserved = true
    and reserved_until is not null
    and reserved_until <= now();

  update public.orders
  set status = 'cancelled'
  where status = 'reserved'
    and reservation_expires_at is not null
    and reservation_expires_at <= now();
end;
$$;

-- Reserva un producto de forma atómica durante 24 horas.
-- Si otra persona intenta reservarlo al mismo tiempo, solo una podrá hacerlo.
create or replace function public.reserve_product(
  p_product_id uuid,
  p_customer_name text,
  p_customer_phone text,
  p_fulfillment_method text,
  p_delivery_address text default null,
  p_delivery_sector text default null,
  p_delivery_date date default null,
  p_delivery_time text default null,
  p_city text default 'Bonao'
)
returns table(order_id uuid, order_number text, expires_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product public.products%rowtype;
  v_order_id uuid;
  v_order_number text;
  v_expires timestamptz := now() + interval '24 hours';
begin
  if coalesce(p_city,'') <> 'Bonao' then
    raise exception 'MEDIOUSAO actualmente opera exclusivamente en Bonao';
  end if;

  if p_fulfillment_method not in ('delivery','pickup') then
    raise exception 'Método de entrega inválido';
  end if;

  if p_fulfillment_method = 'delivery' then
    if coalesce(trim(p_delivery_address),'') = '' then
      raise exception 'La dirección de delivery es obligatoria';
    end if;
    if coalesce(trim(p_delivery_sector),'') = '' then
      raise exception 'El sector de Bonao es obligatorio';
    end if;
    if p_delivery_date is null or p_delivery_time is null then
      raise exception 'El día y horario de delivery son obligatorios';
    end if;
  end if;

  perform public.release_expired_reservations();

  select * into v_product
  from public.products
  where id = p_product_id
    and active = true
    and city = 'Bonao'
    and available = true
    and stock > 0
    and (is_reserved = false or is_reserved is null)
  for update;

  if not found then
    raise exception 'Este producto ya no está disponible';
  end if;

  v_order_id := gen_random_uuid();
  v_order_number := 'MED-' || floor(100000 + random() * 900000)::text;

  insert into public.orders (
    id, order_number, customer_name, customer_phone, delivery_address, delivery_sector,
    city, payment_method, status, total, fulfillment_method, delivery_date,
    delivery_time, reservation_expires_at
  ) values (
    v_order_id, v_order_number, p_customer_name, p_customer_phone,
    case when p_fulfillment_method = 'delivery' then p_delivery_address else 'Recoger en punto de entrega' end,
    case when p_fulfillment_method = 'delivery' then p_delivery_sector else null end,
    'Bonao', 'cod', 'reserved', v_product.price, p_fulfillment_method,
    p_delivery_date, p_delivery_time, v_expires
  );

  insert into public.order_items (
    order_id, product_id, product_name, quantity, price
  ) values (
    v_order_id, v_product.id, v_product.name, 1, v_product.price
  );

  update public.products
  set is_reserved = true,
      reserved_until = v_expires,
      reserved_order_id = v_order_id
  where id = v_product.id;

  return query select v_order_id, v_order_number, v_expires;
end;
$$;

grant execute on function public.release_expired_reservations() to anon, authenticated;
grant execute on function public.reserve_product(uuid,text,text,text,text,text,date,text,text) to anon, authenticated;
