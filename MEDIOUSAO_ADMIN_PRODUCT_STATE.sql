-- MEDIOUSAO: control seguro de disponibilidad desde ADM
-- Ejecutar una sola vez en Supabase > SQL Editor.

create or replace function public.admin_set_product_state(
  p_product_id uuid,
  p_state text
)
returns public.products
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product public.products;
  v_email text := lower(coalesce(auth.jwt() ->> 'email',''));
begin
  if not exists (
    select 1 from public.admins a
    where lower(a.email) = v_email
  ) then
    raise exception 'No autorizado: solo un administrador puede cambiar el estado del producto';
  end if;

  if p_state not in ('upcoming','available','sold') then
    raise exception 'Estado de producto inválido';
  end if;

  update public.products
  set is_upcoming = (p_state = 'upcoming'),
      available = (p_state = 'available')
  where id = p_product_id
  returning * into v_product;

  if not found then
    raise exception 'Producto no encontrado';
  end if;

  return v_product;
end;
$$;

grant execute on function public.admin_set_product_state(uuid,text) to authenticated;
revoke execute on function public.admin_set_product_state(uuid,text) from anon;
