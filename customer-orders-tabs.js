/* MEDIOUSAO - Mis pedidos estable: En proceso / Entregado / Cancelado */
(function(){
 const HIDDEN='mediousao_hidden_customer_orders';
 const hidden=()=>{try{return JSON.parse(localStorage.getItem(HIDDEN)||'[]')}catch(e){return[]}};
 const saveHidden=id=>{let a=hidden();if(!a.includes(id)){a.push(id);localStorage.setItem(HIDDEN,JSON.stringify(a))}};
 const orderNo=c=>((c.textContent||'').match(/(?:MED|FNY)-\d+/i)||[])[0]||'';
 const state=c=>{let t=(c.textContent||'').toLowerCase();return t.includes('cancelado')?'cancelled':t.includes('entregado')?'delivered':'process'};
 function install(){
  const box=document.getElementById('profileOrders');
  if(!box||box.querySelector('#mediousaoOrderTabs'))return;
  if((box.textContent||'').toLowerCase().includes('cargando pedidos')){setTimeout(install,250);return}
  const cards=[...box.children].filter(c=>orderNo(c));
  const gone=hidden();cards.forEach(c=>{if(gone.includes(orderNo(c)))c.remove()});
  const live=cards.filter(c=>c.isConnected);
  const originalEmpty=[...box.children].filter(c=>!orderNo(c));originalEmpty.forEach(c=>c.style.display='none');
  const nav=document.createElement('div');nav.id='mediousaoOrderTabs';nav.style.cssText='display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px;margin:14px 0 12px';
  nav.innerHTML='<button type="button" data-tab="process">En proceso</button><button type="button" data-tab="delivered">Entregado</button><button type="button" data-tab="cancelled">Cancelado</button>';
  nav.querySelectorAll('button').forEach(b=>b.style.cssText='border:0;border-radius:10px;padding:10px 3px;font:inherit;font-size:13px;font-weight:700;background:#f0f0f2;color:#111');
  const empty=document.createElement('div');empty.id='mediousaoOrdersEmpty';empty.className='profile-empty';
  box.insertBefore(nav,box.firstChild);box.appendChild(empty);
  function show(tab){let count=0;live.forEach(c=>{let on=c.isConnected&&state(c)===tab;c.style.display=on?'':'none';if(on)count++});nav.querySelectorAll('button').forEach(b=>{let on=b.dataset.tab===tab;b.style.background=on?'#111':'#f0f0f2';b.style.color=on?'#fff':'#111'});if(count){empty.style.display='none'}else{empty.style.display='';empty.innerHTML='<div style="font-size:42px">📦</div><h3 style="margin:8px 0">No hay pedidos aquí</h3>'}}
  live.forEach(c=>{let st=state(c),id=orderNo(c);if((st==='delivered'||st==='cancelled')&&!c.querySelector('[data-hide-order]')){let b=document.createElement('button');b.type='button';b.dataset.hideOrder=id;b.textContent='Quitar de mi historial';b.style.cssText='width:100%;margin-top:10px;border:1px solid #ddd;border-radius:10px;padding:10px;background:#fff;font:inherit;font-weight:700';b.onclick=()=>{saveHidden(id);c.remove();show(st)};c.appendChild(b)}});
  nav.querySelectorAll('button').forEach(b=>b.onclick=()=>show(b.dataset.tab));show('process');
 }
 document.addEventListener('click',e=>{if(e.target.closest('[data-go="orders"]'))setTimeout(install,450)},true);
})();