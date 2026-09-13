/* MEDIOUSAO ready flow
   Admin: marks a reserved upcoming product as received/ready.
   Customer-facing ready notification is wired through the order status.
*/
(function(){
  const oldLoadUpcomingAdmin = window.loadUpcomingAdmin;

  function addAdminAccess(){
    if(document.getElementById('mediousaoAdminAccess')) return;
    const header=document.querySelector('header');
    if(!header) return;
    const btn=document.createElement('button');
    btn.id='mediousaoAdminAccess';
    btn.className='btn';
    btn.style.cssText='margin-top:10px;width:100%;font-size:13px';
    btn.textContent='🔐 Administración';
    btn.onclick=function(){
      if(typeof window.show==='function') window.show('adminLogin');
    };
    header.appendChild(btn);
  }

  window.loadUpcomingAdmin = async function(){
    const box = document.getElementById('adminUpcomingProducts');
    if(!box){
      if(oldLoadUpcomingAdmin) return oldLoadUpcomingAdmin();
      return;
    }
    box.innerHTML = '<div class="muted">Cargando…</div>';
    try{
      const {data,error} = await client
        .from('products')
        .select('id,name,price,is_upcoming,is_reserved,reserved_order_id,arrival_date,active')
        .order('created_at',{ascending:false});
      if(error) throw error;

      const list = (data||[]).filter(p => p.is_upcoming === true || p.is_reserved === true);
      box.innerHTML = list.map(p => {
        const reserved = !!p.is_reserved;
        const status = reserved
          ? '<span class="status-pill red">🔒 Reservado</span>'
          : '<span class="status-pill">⏳ Próximamente</span>';
        const action = reserved && p.reserved_order_id
          ? '<button class="btn primary full" style="margin-top:9px" onclick="markProductReady(\''+p.id+'\',\''+p.reserved_order_id+'\')">📦 Marcar recibido / listo</button>'
          : '<div class="muted" style="margin-top:8px">Aún no reservado.</div>';
        return '<div class="admin-item">'
          + '<div class="row"><b>'+esc(p.name)+'</b><span>'+money(p.price)+'</span></div>'
          + '<div class="muted">'+status+(p.arrival_date?' · Llegada: '+esc(p.arrival_date):'')+'</div>'
          + action
          + '</div>';
      }).join('') || '<div class="muted">No hay productos próximos o reservados.</div>';
    }catch(e){
      box.innerHTML = '<div class="error">No se pudieron cargar los productos: '+esc(e.message||e)+'</div>';
    }
  };

  window.markProductReady = async function(productId,orderId){
    if(!confirm('¿Confirmas que este producto ya llegó y está listo?')) return;
    try{
      const now = new Date().toISOString();
      const {error:oe} = await client
        .from('orders')
        .update({status:'ready',ready_at:now})
        .eq('id',orderId);
      if(oe) throw oe;

      const {error:pe} = await client
        .from('products')
        .update({is_upcoming:false})
        .eq('id',productId);
      if(pe) throw pe;

      alert('✅ Producto marcado como recibido. El pedido está listo para coordinar delivery o recoger.');
      await window.loadUpcomingAdmin();
      if(typeof window.loadAdminOrders === 'function') await window.loadAdminOrders();
    }catch(e){
      alert('No se pudo marcar como listo: '+(e.message||e));
    }
  };

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',addAdminAccess);
  else addAdminAccess();
})();
