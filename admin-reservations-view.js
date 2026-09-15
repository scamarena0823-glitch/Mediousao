/* MEDIOUSAO - Botón independiente de Reservas en ADM */
(function(){
 const BTN_ID='mediousaoReservationsButton';
 const PANEL_ID='mediousaoReservationsPanel';
 function isAdmin(){return location.search.includes('admin=1')}
 function cards(){
   return [...document.querySelectorAll('select')].filter(s=>String(s.value||'').toLowerCase()==='reservado').map(s=>s.closest('.card')||s.closest('[class*="order"]')||s.parentElement).filter(Boolean);
 }
 function count(){return cards().length}
 function adminButtons(){
   return [...document.querySelectorAll('button')].filter(b=>/categorías|banners|apariencia|pedidos|clientes|notificaciones|pagos|config\.|botones/i.test(b.textContent||''));
 }
 function installButton(){
   if(!isAdmin()||document.getElementById(BTN_ID))return;
   const p=adminButtons().find(b=>/pedidos/i.test(b.textContent||''));
   if(!p)return;
   const b=document.createElement('button'); b.id=BTN_ID; b.type='button';
   b.style.cssText=p.style.cssText;
   b.className=p.className;
   b.innerHTML='⏱️ Reservas (<span id="mediousaoReservationsCount">'+count()+'</span>)';
   b.addEventListener('click',openReservations);
   p.parentNode.insertBefore(b,p.nextSibling);
 }
 function openReservations(){
   let panel=document.getElementById(PANEL_ID);
   if(!panel){
     panel=document.createElement('div'); panel.id=PANEL_ID;
     panel.style.cssText='position:fixed;inset:0;z-index:99999;background:#fff;overflow:auto;padding:22px 18px 110px;color:#111';
     document.body.appendChild(panel);
   }
   const rs=cards();
   panel.innerHTML='<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:22px"><h2 style="margin:0;font-size:30px">Reservas ('+rs.length+')</h2><button id="medResClose" style="border:0;border-radius:999px;padding:12px 18px;font-weight:800">Cerrar</button></div><div id="medResList"></div>';
   document.getElementById('medResClose').onclick=()=>panel.remove();
   const list=document.getElementById('medResList');
   if(!rs.length){list.innerHTML='<div style="padding:28px 4px;opacity:.65">No hay reservas activas.</div>';return;}
   rs.forEach(c=>{const clone=c.cloneNode(true); clone.style.marginBottom='14px'; list.appendChild(clone)});
 }
 function cleanupOld(){const x=document.getElementById('mediousaoReservationsSummary');if(x)x.remove()}
 function refresh(){cleanupOld();installButton();const n=document.getElementById('mediousaoReservationsCount');if(n)n.textContent=count()}
 const mo=new MutationObserver(()=>{clearTimeout(window.__medResTimer);window.__medResTimer=setTimeout(refresh,150)});
 function boot(){if(!isAdmin())return;refresh();mo.observe(document.body,{childList:true,subtree:true});setInterval(refresh,2500)}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();