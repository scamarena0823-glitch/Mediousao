/* MEDIOUSAO - Mis pedidos persistente: En proceso / Entregado / Cancelado */
(function(){
 const HIDDEN='mediousao_hidden_customer_orders';
 const RESET='mediousao_orders_eliminar_reset_v1';
 /* Migración única: restaura pedidos ocultados durante las pruebas anteriores. */
 if(!localStorage.getItem(RESET)){localStorage.removeItem(HIDDEN);localStorage.setItem(RESET,'1')}
 const hidden=()=>{try{return JSON.parse(localStorage.getItem(HIDDEN)||'[]')}catch(e){return[]}};
 const saveHidden=id=>{let a=hidden();if(!a.includes(id)){a.push(id);localStorage.setItem(HIDDEN,JSON.stringify(a))}};
 const orderNo=c=>((c.textContent||'').match(/(?:MED|FNY)-\d+/i)||[])[0]||'';
 const state=c=>{let t=(c.textContent||'').toLowerCase();return t.includes('cancelado')?'cancelled':t.includes('entregado')?'delivered':'process'};
 let timer=null,lastSignature='';
 function install(){
  clearTimeout(timer);
  const box=document.getElementById('profileOrders');if(!box)return;
  const txt=(box.textContent||'').toLowerCase();if(txt.includes('cargando pedidos')){timer=setTimeout(install,220);return}
  const cards=[...box.children].filter(c=>orderNo(c));
  if(!cards.length&&!txt.includes('aún no tienes pedidos')&&!txt.includes('no tienes pedidos')){timer=setTimeout(install,220);return}
  const signature=cards.map(c=>orderNo(c)+':'+state(c)).join('|');
  if(box.querySelector('#mediousaoOrderTabs')&&signature===lastSignature)return;
  box.querySelector('#mediousaoOrderTabs')?.remove();box.querySelector('#mediousaoOrdersEmpty')?.remove();
  const gone=hidden();cards.forEach(c=>{if(gone.includes(orderNo(c)))c.remove()});
  const live=cards.filter(c=>c.isConnected&&!gone.includes(orderNo(c)));lastSignature=live.map(c=>orderNo(c)+':'+state(c)).join('|');
  [...box.children].filter(c=>!orderNo(c)).forEach(c=>c.style.display='none');
  const nav=document.createElement('div');nav.id='mediousaoOrderTabs';nav.style.cssText='display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px;margin:14px 0 12px';
  nav.innerHTML='<button type="button" data-tab="process">En proceso</button><button type="button" data-tab="delivered">Entregado</button><button type="button" data-tab="cancelled">Cancelado</button>';
  nav.querySelectorAll('button').forEach(b=>b.style.cssText='border:0;border-radius:10px;padding:10px 3px;font:inherit;font-size:13px;font-weight:700;background:#f0f0f2;color:#111');
  const empty=document.createElement('div');empty.id='mediousaoOrdersEmpty';empty.className='profile-empty';box.insertBefore(nav,box.firstChild);box.appendChild(empty);
  function show(tab){let n=0;live.forEach(c=>{let on=c.isConnected&&state(c)===tab;c.style.display=on?'':'none';if(on)n++});nav.querySelectorAll('button').forEach(b=>{let on=b.dataset.tab===tab;b.style.background=on?'#111':'#f0f0f2';b.style.color=on?'#fff':'#111'});empty.style.display=n?'none':'';if(!n)empty.innerHTML='<div style="font-size:42px">📦</div><h3 style="margin:8px 0">No hay pedidos aquí</h3>'}
  live.forEach(c=>{let st=state(c),id=orderNo(c);c.querySelector('[data-hide-order]')?.remove();if(st==='delivered'||st==='cancelled'){let b=document.createElement('button');b.type='button';b.dataset.hideOrder=id;b.textContent='ELIMINAR';b.style.cssText='width:100%;margin-top:10px;border:1px solid #ddd;border-radius:10px;padding:10px;background:#fff;font:inherit;font-weight:700';b.onclick=()=>{saveHidden(id);c.remove();show(st)};c.appendChild(b)}});
  nav.querySelectorAll('button').forEach(b=>b.onclick=()=>show(b.dataset.tab));show('process');
 }
 function schedule(delay=650){clearTimeout(timer);timer=setTimeout(install,delay)}
 document.addEventListener('click',e=>{if(e.target.closest('[data-go="orders"]'))schedule()},true);
 window.addEventListener('mediousao:orders-rendered',()=>schedule(300));
 const mo=new MutationObserver(()=>{const box=document.getElementById('profileOrders');if(!box)return;const txt=(box.textContent||'').toLowerCase();if(txt.includes('cargando pedidos'))return;const cards=[...box.children].filter(c=>orderNo(c));const sig=cards.map(c=>orderNo(c)+':'+state(c)).join('|');if(!box.querySelector('#mediousaoOrderTabs')||sig!==lastSignature)schedule(500)});
 function boot(){mo.observe(document.body,{childList:true,subtree:true,characterData:true});schedule(700)}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();