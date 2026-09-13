/* MEDIOUSAO UI + CATALOGO FIX v2026-09-13 */
(function(){
  function removeSearch(){
    const header=document.querySelector('header');
    if(header) header.querySelectorAll('#search,.search,input[placeholder*="Buscar" i],input[placeholder*="Tenis" i]').forEach(e=>e.remove());
  }
  function addTopCart(){
    const header=document.querySelector('header');
    if(!header||document.getElementById('mediousaoTopCart'))return;
    const b=document.createElement('button'); b.id='mediousaoTopCart'; b.setAttribute('aria-label','Carrito'); b.innerHTML='🛒';
    b.style.cssText='position:absolute;right:14px;top:12px;border:0;background:transparent;font-size:27px;padding:8px;z-index:20';
    b.onclick=function(){if(typeof show==='function')show('cart')}; header.style.position='sticky'; header.appendChild(b);
  }
  function cardFixed(p){
    const photo=p.image_url?`<img src="${esc(p.image_url)}" alt="${esc(p.name)}" loading="lazy">`:icon(p);
    return `<div class="card"><div class="photo" onclick="detail('${p.id}')">${photo}</div><div class="info"><div class="name">${esc(p.name)}</div><div class="tag">${esc(labelType(p))} · ${esc(labelAudience(p))}</div><div class="tag">${esc(p.category)} · Talla ${esc(p.size)} · ${esc(p.condition)}</div><div class="price">${money(p.price)}</div><button class="btn primary full" onclick="add('${p.id}')">COMPRAR</button></div></div>`;
  }
  window.render=function(){
    const type=(document.getElementById('typeFilter')||{}).value||'';
    const aud=(document.getElementById('audienceFilter')||{}).value||'';
    const cat=(document.getElementById('categoryFilter')||{}).value||'';
    const arr=products.filter(p=>(!type||p.item_type===type)&&(!aud||p.audience===aud)&&(!cat||p.category===cat));
    const count=document.getElementById('countProducts'); if(count)count.textContent=products.length+' disponibles';
    const home=document.getElementById('homeGrid'); if(home)home.innerHTML=arr.slice(0,4).map(cardFixed).join('')||"<div class='notice'>No hay productos publicados todavía.</div>";
    const grid=document.getElementById('grid'); if(grid)grid.innerHTML=arr.map(cardFixed).join('')||"<div class='notice'>No encontramos productos.</div>";
    if(typeof renderCart==='function')renderCart(); if(typeof saveCart==='function')saveCart();
  };
  window.loadProducts=async function(){
    try{
      const {data,error}=await client.from('products').select('id,name,category,size,condition,price,stock,image_url,active,available,is_reserved,reserved_until,created_at,item_type,audience,city').eq('active',true).eq('city',SERVICE_CITY).gt('stock',0).order('created_at',{ascending:false});
      if(error)throw error;
      products=(data||[]).filter(p=>p.available!==false&&p.is_reserved!==true);
      const c=document.getElementById('connection'); if(c){c.textContent='Catálogo conectado a MEDIOUSAO ✅';c.className='notice';}
      render();
    }catch(e){
      console.error('MEDIOUSAO catálogo:',e); const c=document.getElementById('connection');
      if(c){c.className='error';c.textContent='No pudimos cargar el catálogo. Revisa la conexión con Supabase.';}
      products=[];render();
    }
  };
  function addBottomNav(){
    if(document.getElementById('mediousaoBottomNav'))return;
    const n=document.createElement('div'); n.id='mediousaoBottomNav';
    n.style.cssText='position:fixed;left:50%;bottom:0;transform:translateX(-50%);width:min(480px,100%);height:68px;padding:7px 8px;background:rgba(255,255,255,.98);border-top:1px solid #e5e5e7;display:grid;grid-template-columns:repeat(3,1fr);z-index:50';
    n.innerHTML='<button data-go="home">⌂<br><small>Inicio</small></button><button data-go="catalog">👟<br><small>Catálogo</small></button><button data-go="cart">🛒<br><small>Carrito</small></button>';
    n.querySelectorAll('button').forEach(b=>{b.style.cssText='border:0;background:transparent;font-weight:750;font-size:12px';b.onclick=()=>show(b.dataset.go)});
    document.body.appendChild(n); const old=document.querySelector('body>.app nav'); if(old)old.style.display='none';
  }
  function cleanHome(){
    removeSearch(); addTopCart(); addBottomNav();
    const h=document.querySelector('header'); if(h){h.querySelector('.sub')?.style.setProperty('display','none','important');h.querySelector('.brandline')?.style.setProperty('display','none','important');}
    const hero=document.querySelector('#home .hero'); if(hero)hero.style.display='none';
    const sec=document.querySelector('#home>.section'); if(sec)sec.style.display='none';
    const up=document.querySelector('#home>section:has(#upcomingGrid)'); if(up)up.style.display='none';
    const conn=document.getElementById('connection'); if(conn)conn.style.display='none';
    document.querySelectorAll('#homeGrid .card button').forEach(b=>b.style.display='block');
    document.querySelectorAll('.app>.notice').forEach(el=>{
      const t=(el.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
      if(t.includes('servicio disponible exclusivamente en bonao')) el.style.display='none';
    });
    document.querySelectorAll('#homeGrid,#grid').forEach(g=>{
      g.style.display='grid';
      g.style.gridTemplateColumns='repeat(2,minmax(0,1fr))';
      g.style.gap='13px';
      g.style.width='100%';
    });
  }
  function removeReserveFromBottom(){
    document.querySelectorAll('#mediousaoBottomNav button').forEach(b=>{
      const t=(b.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
      if(t.includes('reserva')) b.remove();
    });
    const n=document.getElementById('mediousaoBottomNav');
    if(n){n.style.gridTemplateColumns='repeat(3,1fr)';}
  }
  function start(){cleanHome();loadProducts();if(typeof loadUpcoming==='function')loadUpcoming();removeReserveFromBottom();setTimeout(cleanHome,300);setTimeout(cleanHome,1000);setTimeout(removeReserveFromBottom,300);setTimeout(removeReserveFromBottom,1000);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
