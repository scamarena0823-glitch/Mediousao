-- MEDIOUSAO: reservas de Próximamente + estado listo + programación posterior
-- Ejecutar en Supabase SQL Editor.

-- 1) Las reservas de productos Próximamente no deben vencer a las 24 horas.
create or replace function public.reserve_upcoming_product(
  p_product_id uuid,
  p_customer_name text,
  p_customer_phone text
)
returns table(order_id uuid, order_number text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product public.products%rowtype;
  v_order_id uuid;
  v_order_number text;
begin
  select * into v_product
  from public.products
  where id = p_product_id
    and active = true
    and city = 'Bonao'
    and is_upcoming = true
    and available = true
    and stock > 0
    and coalesce(is_reserved,false) = false
  for update;

  if not found then
    raise exception 'Este producto ya no está disponible para reservar';
  end if;

  v_order_id := gen_random_uuid();
  v_order_number := 'MED-' || floor(100000 + random() * 900000)::text;

  insert into public.orders (
    id, order_number, customer_name, customer_phone, delivery_address,
    payment_method, status, total, fulfillment_method, reservation_expires_at
  ) values (
    v_order_id, v_order_number, p_customer_name, p_customer_phone,
    'Pendiente de programar cuando esté disponible',
    'cod', 'reserved', v_product.price, null, null
  );

  insert into public.order_items (
    order_id, product_id, product_name, quantity, price
  ) values (
    v_order_id, v_product.id, v_product.name, 1, v_product.price
  );

  update public.products
  set is_reserved = true,
      reserved_until = null,
      reserved_order_id = v_order_id
  where id = v_product.id;

  return query select v_order_id, v_order_number;
end;
$$;

grant execute on function public.reserve_upcoming_product(uuid,text,text) to anon, authenticated;

-- 2) Cuando el administrador recibe el producto, puede marcar la orden como lista.
create or replace function public.mark_reserved_order_ready(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.admins a
    where lower(a.email) = lower(auth.jwt()->>'email')
  ) then
    raise exception 'No autorizado';
  end if;

  update public.orders
  set status = 'ready'
  where id = p_order_id
    and status = 'reserved';

  if not found then
    raise exception 'La reserva no está en estado reservado';
  end if;
end;
$$;

grant execute on function public.mark_reserved_order_ready(uuid) to authenticated;

-- 3) El cliente programa delivery o recogida DESPUÉS de recibir la notificación.
create or replace function public.schedule_reserved_order(
  p_order_id uuid,
  p_customer_phone text,
  p_fulfillment_method text,
  p_delivery_address text default null,
  p_delivery_date date default null,
  p_delivery_time text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_fulfillment_method not in ('delivery','pickup') then
    raise exception 'Método de entrega inválido';
  end if;

  if p_fulfillment_method = 'delivery' then
    if coalesce(trim(p_delivery_address),'') = '' then
      raise exception 'La dirección de delivery es obligatoria';
    end if;
    if p_delivery_date is null or p_delivery_time is null then
      raise exception 'El día y horario de delivery son obligatorios';
    end if;
  end if;

  update public.orders
  set fulfillment_method = p_fulfillment_method,
      delivery_address = case when p_fulfillment_method = 'delivery' then p_delivery_address else 'Recoger en punto de entrega' end,
      delivery_date = case when p_fulfillment_method = 'delivery' then p_delivery_date else null end,
      delivery_time = case when p_fulfillment_method = 'delivery' then p_delivery_time else null end,
      status = 'confirmed'
  where id = p_order_id
    and status = 'ready'
    and customer_phone = p_customer_phone;

  if not found then
    raise exception 'No se encontró una reserva lista con esos datos';
  end if;
end;
$$;

grant execute on function public.schedule_reserved_order(uuid,text,text,text,date,text) to anon, authenticated;
