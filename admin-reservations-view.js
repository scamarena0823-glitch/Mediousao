/* MEDIOUSAO - Reservas separadas en ADM */
(function(){
 function statusText(el){return String((el&&el.value)||(el&&el.textContent)||'').trim().toLowerCase();}
 function refresh(){
  if(!location.search.includes('admin=1'))return;
  var nodes=[].slice.call(document.querySelectorAll('select'));
  var reserved=[];
  nodes.forEach(function(s){if(statusText(s)==='reservado'){var c=s.closest('.card')||s.parentElement&&s.parentElement.parentElement;if(c&&reserved.indexOf(c)<0)reserved.push(c);}});
  var heading=[].slice.call(document.querySelectorAll('h1,h2,h3')).find(function(h){return /pedidos|reservas/i.test(h.textContent||'');});
  if(!heading)return;
  var id='mediousaoReservationsSummary',box=document.getElementById(id);
  if(!box){box=document.createElement('div');box.id=id;box.style.cssText='margin:12px 0;padding:14px;border:1px solid #333;border-radius:14px;background:#151515';heading.insertAdjacentElement('afterend',box);}
  box.innerHTML='<div style="font-weight:800;font-size:18px">Reservas ('+reserved.length+')</div><div style="font-size:12px;opacity:.7;margin-top:4px">Reservas activas separadas de los pedidos</div>';
  reserved.forEach(function(c){c.dataset.mediousaoReservation='1';});
 }
 var o=new MutationObserver(function(){clearTimeout(window.__medResT);window.__medResT=setTimeout(refresh,100)});
 function boot(){refresh();o.observe(document.body,{childList:true,subtree:true,characterData:true});}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();