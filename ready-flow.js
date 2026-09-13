/* MEDIOUSAO ready flow v2026-09-13-4 */
(function(){
  function addAdminAccess(){
    if(document.getElementById('mediousaoAdminAccess'))return;
    const header=document.querySelector('header'); if(!header)return;
    const btn=document.createElement('button'); btn.id='mediousaoAdminAccess'; btn.className='btn';
    btn.style.cssText='margin-top:10px;width:100%;font-size:13px'; btn.textContent='🔐 Administración';
    btn.onclick=function(){if(typeof window.show==='function')window.show('adminLogin')}; header.appendChild(btn);
  }

  function forceUpcomingButtons(){
    const box=document.getElementById('upcomingGrid'); if(!box)return;
    box.querySelectorAll('.card').forEach(card=>{
      const info=card.querySelector('.info'); if(!info)return;
      if(info.querySelector('[data-mediousao-upcoming-action]'))return;
      const oldButtons=Array.from(info.querySelectorAll('button')).filter(b=>{
        const t=(b.textContent||'').toLowerCase();
        return t.includes('reservar')||t.includes('recoger');
      });
      if(!oldButtons.length)return;
      let id=null;
      for(const b of oldButtons){
        const m=String(b.getAttribute('onclick')||'').match(/reserveUpcoming\(['\"]([^'\"]+)['\"]/);
        if(m){id=m[1];break;}
      }
      if(!id){
        const name=card.querySelector('.name');
        const p=(window.upcomingProducts||[]).find(x=>name&&name.textContent.trim()===String(x.name).trim());
        if(p)id=p.id;
      }
      if(!id)return;
      oldButtons.forEach(b=>b.remove());
      const action=document.createElement('button');
      action.className='btn primary full';
      action.setAttribute('data-mediousao-upcoming-action','1');
      action.textContent='Reservar ahora';
      action.onclick=function(){window.reserveUpcoming(id)};
      info.appendChild(action);
    });
  }

  const oldLoadUpcoming=window.loadUpcoming;
  if(typeof oldLoadUpcoming==='function'){
    window.loadUpcoming=async function(){
      const result=await oldLoadUpcoming.apply(this,arguments);
      setTimeout(forceUpcomingButtons,0);
      setTimeout(forceUpcomingButtons,100);
      setTimeout(forceUpcomingButtons,500);
      return result;
    };
  }

  window.reserveUpcoming=function(id){
    const list=window.upcomingProducts||[];
    window.selectedProduct=list.find(p=>p.id===id);
    window.reserveMode='upcoming';
    if(!window.selectedProduct)return;
    document.getElementById('reserveProduct').innerHTML='<b>'+esc(selectedProduct.name)+'</b> · '+money(selectedProduct.price)+'<br><span class="muted">⏳ Próximamente · Te notificaremos cuando esté disponible.</span>';
    document.getElementById('deliveryFields').style.display='none';
    document.getElementById('pickupFields').style.display='none';
    document.getElementById('reserveBtn').textContent='Reservar ahora';
    show('reserve');
  };

  window.submitReservation=async function(){
    if(!window.selectedProduct)return;
    const name=document.getElementById('rName').value.trim();
    const phone=document.getElementById('rPhone').value.trim();
    if(!name||!phone){alert('Completa nombre y teléfono.');return;}
    if(window.reserveMode!=='upcoming')return;
    const {data,error}=await client.rpc('reserve_product',{
      p_product_id:selectedProduct.id,p_customer_name:name,p_customer_phone:phone,
      p_fulfillment_method:'pickup',p_delivery_address:null,p_delivery_date:null,p_delivery_time:null,
      p_delivery_sector:null,p_city:SERVICE_CITY
    });
    if(error){alert('No se pudo guardar la reserva. Inténtalo de nuevo.');console.error(error);return;}
    const row=data&&data[0];
    if(row&&row.order_number){
      localStorage.setItem('mediousao_last_reservation',JSON.stringify({order_id:row.order_id,order_number:row.order_number,phone}));
      localStorage.setItem('mediousao_order_id',row.order_id);
    }
    alert('💚 ¡Reserva realizada! Te notificaremos cuando tu producto esté disponible.');
    show('home');
    setTimeout(forceUpcomingButtons,0);
  };

  const observer=new MutationObserver(function(){forceUpcomingButtons()});
  function start(){
    addAdminAccess();
    const box=document.getElementById('upcomingGrid');
    if(box)observer.observe(box,{childList:true,subtree:true});
    forceUpcomingButtons();
    let n=0;
    const timer=setInterval(function(){forceUpcomingButtons();if(++n>20)clearInterval(timer)},250);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();