/* MEDIOUSAO ready flow
   Admin: marks a reserved upcoming product as received/ready.
   Customer: reserves upcoming with name + phone only, then chooses delivery/pickup after arrival.
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
    btn.onclick=function(){ if(typeof window.show==='function') window.show('adminLogin'); };
    header.appendChild(btn);
  }

  window.loadUpcomingAdmin = async function(){
    const box = document.getElementById('adminUpcomingProducts');
    if(!box){ if(oldLoadUpcomingAdmin) return oldLoadUpcomingAdmin(); return; }
    box.innerHTML = '<div class="muted">Cargando…</div>';
    try{
      const {data,error} = await client.from('products')
        .select('id,name,price,is_upcoming,is_reserved,reserved_order_id,arrival_date,active')
        .order('created_at',{ascending:false});
      if(error) throw error;
      const list = (data||[]).filter(p => p.is_upcoming === true || p.is_reserved === true);
      box.innerHTML = list.map(p => {
        const reserved = !!p.is_reserved;
        const status = reserved ? '<span class="status-pill red">🔒 Reservado</span>' : '<span class="status-pill">⏳ Próximamente</span>';
        const action = reserved && p.reserved_order_id
          ? '<button class="btn primary full" style="margin-top:9px" onclick="markProductReady(\''+p.id+'\',\''+p.reserved_order_id+'\')">📦 Marcar recibido / listo</button>'
          : '<div class="muted" style="margin-top:8px">Aún no reservado.</div>';
        return '<div class="admin-item"><div class="row"><b>'+esc(p.name)+'</b><span>'+money(p.price)+'</span></div><div class="muted">'+status+(p.arrival_date?' · Llegada: '+esc(p.arrival_date):'')+'</div>'+action+'</div>';
      }).join('') || '<div class="muted">No hay productos próximos o reservados.</div>';
    }catch(e){ box.innerHTML = '<div class="error">No se pudieron cargar los productos: '+esc(e.message||e)+'</div>'; }
  };

  window.markProductReady = async function(productId,orderId){
    if(!confirm('¿Confirmas que este producto ya llegó y está listo?')) return;
    try{
      const now = new Date().toISOString();
      const {error:oe} = await client.from('orders').update({status:'ready',ready_at:now}).eq('id',orderId);
      if(oe) throw oe;
      const {error:pe} = await client.from('products').update({is_upcoming:false}).eq('id',productId);
      if(pe) throw pe;
      alert('✅ Producto marcado como recibido. El cliente ya puede elegir delivery o recoger.');
      await window.loadUpcomingAdmin();
      if(typeof window.loadAdminOrders === 'function') await window.loadAdminOrders();
      if(typeof window.checkReservedOrder === 'function') await window.checkReservedOrder();
    }catch(e){ alert('No se pudo marcar como listo: '+(e.message||e)); }
  };

  // Customer home: Próximamente shows only "Reservar ahora".
  window.loadUpcoming = async function(){
    const box=document.getElementById('upcomingGrid');
    if(!box)return;
    box.innerHTML='<div class="notice">Cargando Próximamente…</div>';
    const {data,error}=await client.from('products').select('id,name,price,image_url,category,stock,active,is_reserved,is_upcoming,arrival_date,item_type,audience,city').eq('active',true).eq('city',SERVICE_CITY).eq('is_upcoming',true).gt('stock',0).order('created_at',{ascending:false});
    if(error){box.innerHTML='<div class="error">No pudimos cargar Próximamente.</div>';console.error(error);return;}
    window.upcomingProducts=data||[];
    box.innerHTML=upcomingProducts.map(p=>{
      const photo=p.image_url?`<img src="${esc(p.image_url)}" alt="${esc(p.name)}" loading="lazy">`:icon(p);
      const date=p.arrival_date?`<div class="tag">Llegada estimada: ${esc(p.arrival_date)}</div>`:'';
      const action=p.is_reserved
        ? `<div class="tag" style="font-weight:900;color:#111;margin-top:10px">🔒 RESERVADO</div>`
        : `<button class="btn primary full" onclick="reserveUpcoming('${p.id}')">Reservar ahora</button>`;
      return `<div class="card"><div class="photo">${photo}</div><div class="info"><div class="name">${esc(p.name)}</div><div class="tag">⏳ PRÓXIMAMENTE</div>${date}<div class="price">${money(p.price)}</div>${action}</div></div>`;
    }).join('') || '<div class="notice">No hay productos próximos todavía.</div>';
  };

  // Upcoming reservation: collect only name and phone.
  window.reserveUpcoming = function(id){
    window.selectedProduct=upcomingProducts.find(p=>p.id===id);
    window.reserveMode='upcoming';
    if(!selectedProduct)return;
    document.getElementById('reserveProduct').innerHTML=`<b>${esc(selectedProduct.name)}</b> · ${money(selectedProduct.price)}<br><span class="muted">⏳ Próximamente · Te notificaremos cuando esté disponible.</span>`;
    document.getElementById('deliveryFields').style.display='none';
    document.getElementById('pickupFields').style.display='none';
    document.getElementById('reserveBtn').textContent='Reservar ahora';
    show('reserve');
  };

  window.submitReservation = async function(){
    if(!selectedProduct)return;
    const name=document.getElementById('rName').value.trim();
    const phone=document.getElementById('rPhone').value.trim();
    if(!name||!phone)return alert('Completa nombre y teléfono.');
    if(reserveMode==='upcoming'){
      const {data,error}=await client.rpc('reserve_product',{
        p_product_id:selectedProduct.id,
        p_customer_name:name,
        p_customer_phone:phone,
        p_fulfillment_method:'pickup',
        p_delivery_address:null,
        p_delivery_date:null,
        p_delivery_time:null,
        p_delivery_sector:null,
        p_city:SERVICE_CITY
      });
      if(error){alert('No se pudo guardar la reserva. Inténtalo de nuevo.');console.error(error);return;}
      const row=data&&data[0];
      if(row&&row.order_number){
        localStorage.setItem('mediousao_last_reservation',JSON.stringify({order_id:row.order_id,order_number:row.order_number,phone}));
        localStorage.setItem('mediousao_order_id',row.order_id);
      }
      alert('💚 ¡Reserva realizada! Te notificaremos cuando tu producto esté disponible.');
      show('home');
      await window.loadUpcoming();
      return;
    }
    alert('Esta reserva ya está lista para ser programada desde el flujo correspondiente.');
  };

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',addAdminAccess);
  else addAdminAccess();
})();
