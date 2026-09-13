/* MEDIOUSAO ready flow v2026-09-13-9 */
(function(){
  function addAdminAccess(){
    if(document.getElementById('mediousaoAdminAccess'))return;
    const header=document.querySelector('header'); if(!header)return;
    const btn=document.createElement('button'); btn.id='mediousaoAdminAccess'; btn.className='btn'; btn.style.cssText='margin-top:10px;width:100%;font-size:13px'; btn.textContent='🔐 Administración'; btn.onclick=function(){if(typeof window.show==='function')window.show('adminLogin')}; header.appendChild(btn);
  }
  function forceUpcomingButtons(){
    const box=document.getElementById('upcomingGrid'); if(!box)return;
    box.querySelectorAll('.card').forEach(card=>{
      const info=card.querySelector('.info'); if(!info||info.querySelector('[data-mediousao-upcoming-action]'))return;
      const old=Array.from(info.querySelectorAll('button')).filter(b=>/reservar|recoger/i.test(b.textContent||'')); if(!old.length)return;
      let id=null; for(const b of old){const m=String(b.getAttribute('onclick')||'').match(/reserveUpcoming\(['\"]([^'\"]+)['\"]/);if(m){id=m[1];break;}}
      if(!id){const name=card.querySelector('.name');const p=(window.upcomingProducts||[]).find(x=>name&&name.textContent.trim()===String(x.name).trim());if(p)id=p.id;}
      if(!id)return; old.forEach(b=>b.remove());
      const action=document.createElement('button'); action.className='btn primary full'; action.setAttribute('data-mediousao-upcoming-action','1'); action.textContent='Reservar ahora';
      action.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();window.mediousaoOpenUpcoming(id);}); info.appendChild(action);
    });
  }
  const oldLoadUpcoming=window.loadUpcoming;
  if(typeof oldLoadUpcoming==='function')window.loadUpcoming=async function(){const r=await oldLoadUpcoming.apply(this,arguments);setTimeout(forceUpcomingButtons,0);setTimeout(forceUpcomingButtons,150);setTimeout(forceUpcomingButtons,500);return r;};
  window.mediousaoOpenUpcoming=async function(id){
    let p=(window.upcomingProducts||[]).find(x=>x.id===id);
    if(!p && typeof client!=='undefined'){const {data,error}=await client.from('products').select('id,name,price,image_url,category,stock,active,is_reserved,is_upcoming,arrival_date,item_type,audience,city').eq('id',id).maybeSingle();if(!error)p=data||null;}
    if(!p){alert('No se pudo abrir este producto. Recarga la página e inténtalo de nuevo.');return;}
    window.selectedProduct=p; window.reserveMode='upcoming';
    const escText=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
    const rp=document.getElementById('reserveProduct'); if(rp)rp.innerHTML='<b>'+escText(p.name)+'</b> · RD$'+Number(p.price||0).toLocaleString('es-DO')+'<br><span class="muted">⏳ Próximamente · Te notificaremos cuando esté disponible.</span>';
    const d=document.getElementById('deliveryFields'),u=document.getElementById('pickupFields'),b=document.getElementById('reserveBtn'); if(d)d.style.display='none';if(u)u.style.display='none';if(b)b.textContent='Reservar ahora';
    document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active')); const reserve=document.getElementById('reserve');if(reserve)reserve.classList.add('active');window.scrollTo(0,0);
  };
  window.reserveUpcoming=window.mediousaoOpenUpcoming;
  window.submitReservation=async function(){
    const p=window.selectedProduct;if(!p){alert('No hay producto seleccionado.');return;}
    const name=document.getElementById('rName').value.trim(),phone=document.getElementById('rPhone').value.trim(); if(!name||!phone){alert('Completa nombre y teléfono.');return;} if(window.reserveMode!=='upcoming'){alert('Modo de reserva incorrecto.');return;}
    try{
      const {data,error}=await client.rpc('reserve_product',{p_product_id:p.id,p_customer_name:name,p_customer_phone:phone,p_fulfillment_method:'pickup',p_delivery_address:null,p_delivery_date:null,p_delivery_time:null,p_delivery_sector:null,p_city:'Bonao'});
      if(error){console.error('MEDIOUSAO reserve_product error:',error);alert('ERROR SUPABASE: '+(error.message||'sin mensaje')+(error.details?'\nDetalles: '+error.details:'')+(error.hint?'\nAyuda: '+error.hint:''));return;}
      const row=data&&data[0];if(row&&row.order_number){localStorage.setItem('mediousao_last_reservation',JSON.stringify({order_id:row.order_id,order_number:row.order_number,phone}));localStorage.setItem('mediousao_order_id',row.order_id);} alert('💚 ¡Reserva realizada! Te notificaremos cuando tu producto esté disponible.');if(typeof window.show==='function')window.show('home');
    }catch(err){console.error('MEDIOUSAO reserve exception:',err);alert('ERROR AL GUARDAR: '+(err?.message||String(err)));}
  };
  const observer=new MutationObserver(forceUpcomingButtons); function start(){addAdminAccess();const box=document.getElementById('upcomingGrid');if(box)observer.observe(box,{childList:true,subtree:true});forceUpcomingButtons();let n=0;const timer=setInterval(function(){forceUpcomingButtons();if(++n>30)clearInterval(timer)},250);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();

/* Separate admin orders into regular orders and Próximamente reservations. */
(function(){
  const moneyAdmin=n=>'RD$'+Number(n||0).toLocaleString('es-DO');
  const escAdmin=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  function orderCard(o,isUpcoming){
    const statusOptions=isUpcoming
      ? ['reserved','confirmed','preparing','on_the_way','delivered','cancelled']
      : ['confirmed','preparing','on_the_way','delivered','cancelled'];
    return `<div class="admin-item">
      <b>${escAdmin(o.order_number)}</b> · ${moneyAdmin(o.total)}
      <div class="muted">${escAdmin(o.customer_name)} · ${escAdmin(o.customer_phone)}</div>
      <div class="muted">${escAdmin(o.delivery_address||'')}${o.delivery_sector?' · Sector: '+escAdmin(o.delivery_sector):''}</div>
      <div class="muted">${o.fulfillment_method==='delivery'?'🛵 Delivery':'🏪 Recoger'}${o.delivery_date?' · '+escAdmin(o.delivery_date):''}${o.delivery_time?' · '+escAdmin(o.delivery_time):''}</div>
      ${isUpcoming?'<div class="tag" style="font-weight:900;color:#b0000a;margin-top:6px">⏳ Reserva de Próximamente · sin vencimiento</div>':''}
      <div style="margin-top:8px"><b>Estado:</b> ${escAdmin(o.status)}</div>
      <select class="search" style="margin-top:8px" onchange="updateOrderStatus('${o.id}',this.value)">${statusOptions.map(s=>`<option value="${s}" ${o.status===s?'selected':''}>${s}</option>`).join('')}</select>
    </div>`;
  }
  window.loadAdminOrders=async function(){
    const box=document.getElementById('adminOrders');
    if(!box)return;
    box.innerHTML='<div class="muted">Cargando pedidos…</div>';
    const {data,error}=await client.from('orders').select('id,order_number,customer_name,customer_phone,delivery_address,delivery_sector,city,payment_method,status,total,created_at,fulfillment_method,delivery_date,delivery_time,reservation_expires_at').eq('city',SERVICE_CITY).order('created_at',{ascending:false}).limit(100);
    if(error){box.innerHTML='<div class="error">No se pudieron cargar los pedidos. Revisa las políticas de administrador.</div>';console.error(error);return;}
    const rows=data||[];
    const upcoming=rows.filter(o=>o.status==='reserved' && !o.reservation_expires_at);
    const regular=rows.filter(o=>!(o.status==='reserved' && !o.reservation_expires_at));
    box.innerHTML=`
      <div class="box" style="padding:14px;margin-bottom:14px;border:1px solid #f1caca">
        <div class="row"><h2>⏳ Reservaciones Próximamente</h2><span class="status-pill red">${upcoming.length}</span></div>
        <div class="muted" style="margin-bottom:8px">Reservas de productos que todavía no han llegado.</div>
        <div id="adminUpcomingReservations">${upcoming.map(o=>orderCard(o,true)).join('')||'<div class="notice">No hay reservaciones de Próximamente.</div>'}</div>
      </div>
      <div class="box" style="padding:14px">
        <div class="row"><h2>📦 Pedidos disponibles</h2><span class="status-pill green">${regular.length}</span></div>
        <div class="muted" style="margin-bottom:8px">Pedidos normales y reservas de productos disponibles.</div>
        <div id="adminRegularOrders">${regular.map(o=>orderCard(o,false)).join('')||'<div class="notice">No hay pedidos disponibles.</div>'}</div>
      </div>`;
  };
})();
