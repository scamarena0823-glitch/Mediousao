/* MEDIOUSAO - Mis pedidos: En proceso / Entregado / Cancelado */
(function(){
 const HIDDEN='mediousao_hidden_customer_orders';
 const hidden=()=>{try{return JSON.parse(localStorage.getItem(HIDDEN)||'[]')}catch(e){return[]}};
 const hide=id=>{const a=hidden();if(!a.includes(id)){a.push(id);localStorage.setItem(HIDDEN,JSON.stringify(a))}};
 function state(card){const t=(card.textContent||'').toLowerCase();if(t.includes('cancelado'))return'cancelled';if(t.includes('entregado'))return'delivered';return'process'}
 function enhance(){
  const box=document.getElementById('profileOrders');if(!box||box.dataset.medTabs==='1')return;
  const cards=[...box.children].filter(x=>/MED-|FNY-/i.test(x.textContent||''));if(!cards.length)return;
  box.dataset.medTabs='1';
  const old=hidden();cards.forEach(c=>{const m=(c.textContent||'').match(/(?:MED|FNY)-\d+/i);if(m&&old.includes(m[0]))c.remove()});
  const live=[...box.children].filter(x=>/MED-|FNY-/i.test(x.textContent||''));
  const nav=document.createElement('div');nav.style.cssText='display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:14px 0';
  nav.innerHTML='<button class="btn medOrderTab" data-s="process">En proceso</button><button class="btn medOrderTab" data-s="delivered">Entregado</button><button class="btn medOrderTab" data-s="cancelled">Cancelado</button>';
  box.prepend(nav);
  function show(s){live.forEach(c=>c.style.display=state(c)===s?'':'none');nav.querySelectorAll('button').forEach(b=>{b.style.background=b.dataset.s===s?'#111':'#ededf0';b.style.color=b.dataset.s===s?'#fff':'#111'});}
  nav.querySelectorAll('button').forEach(b=>b.onclick=()=>show(b.dataset.s));
  live.forEach(c=>{const st=state(c);if(st==='delivered'||st==='cancelled'){const m=(c.textContent||'').match(/(?:MED|FNY)-\d+/i);if(!m)return;const b=document.createElement('button');b.className='btn';b.textContent='Quitar de mi historial';b.style.cssText='margin-top:10px;width:100%';b.onclick=()=>{hide(m[0]);c.remove()};c.appendChild(b)}});
  show('process');
 }
 const mo=new MutationObserver(()=>setTimeout(enhance,120));
 function boot(){enhance();mo.observe(document.body,{childList:true,subtree:true})}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();