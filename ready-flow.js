/* MEDIOUSAO ready flow v2026-09-13-10 */
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

/* Visual refresh: premium, urban, minimal and mobile-first. No functional changes. */
(function(){
  if(document.getElementById('mediousaoVisualRefresh'))return;
  const style=document.createElement('style');style.id='mediousaoVisualRefresh';style.textContent=`
:root{--m-red:#e50914;--m-black:#0b0b0d;--m-ink:#151518;--m-soft:#f6f6f7;--m-line:#e8e8eb}
body{background:#ececee;color:var(--m-ink)}
.app{background:#fff;box-shadow:0 0 50px rgba(0,0,0,.10)}
header{padding:20px 18px 15px;border-bottom:1px solid #e8e8eb}
.logo{font-size:31px;letter-spacing:-1.8px}
.sub{font-size:12px;letter-spacing:.15px;color:#6f7075}
.brandline{width:48px;height:4px;margin-top:10px}
header .search{margin-top:16px;background:#f5f5f6;border-color:#ededf0;border-radius:16px;padding:14px 16px}
header .search:focus{background:#fff;border-color:#111}
body>.app> .notice{margin:10px 18px 0!important;border:0;border-radius:14px;background:#f7f7f8;box-shadow:none;padding:11px 13px;font-size:12px}
main{padding:14px 18px 100px}
.hero{position:relative;overflow:hidden;background:linear-gradient(135deg,#0b0b0d 0%,#17171a 68%,#2a080b 100%);color:#fff;border:0;border-radius:24px;padding:25px 21px;margin-bottom:20px;box-shadow:0 14px 35px rgba(0,0,0,.16)}
.hero:after{content:"";position:absolute;width:150px;height:150px;border:1px solid rgba(229,9,20,.55);border-radius:50%;right:-65px;top:-45px;box-shadow:0 0 0 18px rgba(229,9,20,.04),0 0 0 38px rgba(229,9,20,.025)}
.hero h1{position:relative;z-index:1;font-size:31px;line-height:1.02;letter-spacing:-1.15px;max-width:300px}
.hero p{position:relative;z-index:1;color:#c9c9cc!important}
.hero .btn{position:relative;z-index:2;border-radius:14px;margin-top:16px;padding:13px 17px}
.section{margin:24px 0 12px}
.section h2{font-size:21px;letter-spacing:-.55px}
.grid{gap:11px}
.card{border:1px solid #e9e9ec;border-radius:20px;box-shadow:0 8px 24px rgba(0,0,0,.055)}
.card .photo{height:175px;background:#f7f7f8}
.card .info{padding:13px 13px 14px}
.card .name{font-size:14px;letter-spacing:-.1px}
.card .tag{font-size:11px;color:#85868a}
.card .price{font-size:20px;letter-spacing:-.35px;margin:8px 0 10px}
.card .btn{border-radius:12px;padding:11px 10px;font-size:14px}
.btn{border-radius:14px;font-weight:850}
.btn.primary{background:var(--m-red);box-shadow:0 8px 18px rgba(229,9,20,.18)}
.notice{border-color:var(--m-line);border-radius:16px;background:#fafafa;box-shadow:none}
.filters select{border-color:#e5e5e8;border-radius:14px;padding:12px;background:#fafafa}
.choices .choice{border-radius:14px;padding:13px}
nav{padding-top:10px;border-top:1px solid #e5e5e8;box-shadow:0 -8px 24px rgba(0,0,0,.045)}
nav button{font-size:11px;letter-spacing:.1px}
nav .on{font-weight:900}
.detailphoto{height:330px;border-radius:22px;background:#f7f7f8}
@media(max-width:380px){.card .photo{height:150px}.hero h1{font-size:28px}.logo{font-size:29px}}
`;document.head.appendChild(style);
})();
