/* MEDIOUSAO UI v2026-09-13-21 */
(function(){
  function hideBonaoEverywhere(){
    document.querySelectorAll('body *').forEach(el=>{
      if(el.id==='homeGrid' || el.closest('#homeGrid'))return;
      const t=(el.textContent||'').replace(/\s+/g,' ').trim();
      if(!/bonao/i.test(t))return;
      if(t.length<220){el.style.setProperty('display','none','important');}
    });
  }
  function hideHomeExtras(){
    const home=document.getElementById('home');
    const homeActive=!!(home&&home.classList.contains('active'));
    if(homeActive){
      document.querySelectorAll('body *').forEach(el=>{
        if(el.id==='homeGrid' || el.closest('#homeGrid'))return;
        const t=(el.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
        if(t && t.length<120 && t.includes('bonao') && t.includes('disponible'))el.style.setProperty('display','none','important');
      });
    }
    const globalBonao=document.querySelector('.app > .notice');
    if(globalBonao) globalBonao.style.setProperty('display','none','important');
    if(!home)return;
    ['#connection','.notice','.location-notice','.bonao-notice'].forEach(sel=>{
      home.querySelectorAll(sel).forEach(el=>el.style.setProperty('display','none','important'));
    });
    home.querySelectorAll('p,div,span,small,label,h2,h3').forEach(el=>{
      if(el.closest('#homeGrid'))return;
      const t=(el.textContent||'').trim().toLowerCase();
      if(!t)return;
      if(t.includes('catálogo conectado a mediousao') || t.includes('catalogo conectado a mediousao') || t.includes('solo disponible en bonao') || t.includes('disponible en bonao') || (t.includes('bonao') && (t.includes('servicio disponible') || t.includes('solo procesa') || t.includes('funcionando') || t.includes('exclusivamente en bonao'))))el.style.setProperty('display','none','important');
    });
    document.querySelectorAll('body:has(#home.active) input[type="search"],body:has(#home.active) input[placeholder*="buscar" i],body:has(#home.active) input[placeholder*="tenis" i]').forEach(el=>{
      (el.closest('form,.search,.search-box,.searchbar,.toolbar')||el).style.setProperty('display','none','important');
    });
    hideBonaoEverywhere();
  }
  function inject(){
    if(document.getElementById('mediousao-ui-v21'))return;
    const style=document.createElement('style');style.id='mediousao-ui-v21';style.textContent=`
      header{position:sticky!important;top:0!important;padding:18px 18px 14px!important;text-align:center!important;z-index:10!important}
      header .logo{font-size:32px!important;font-weight:950!important;letter-spacing:-1.8px!important;text-align:center!important}
      header .sub,header .brandline{display:none!important}
      #mediousaoTopCart{position:absolute;right:17px;top:17px;width:42px;height:42px;border:0;background:transparent;display:flex;align-items:center;justify-content:center;font-size:25px;z-index:20}
      #mediousaoTopCart svg{width:28px;height:28px;stroke:#111;fill:none;stroke-width:2}
      #mediousaoTopCart .cart-badge{position:absolute;right:-1px;top:-1px;min-width:17px;height:17px;border-radius:99px;background:#e50914;color:#fff;font-size:10px;font-weight:900;display:none;align-items:center;justify-content:center;padding:0 4px}
      #mediousaoBottomNav{position:fixed;left:50%;bottom:0;transform:translateX(-50%);width:min(480px,100%);height:70px;padding:7px 8px calc(7px + env(safe-area-inset-bottom));background:rgba(255,255,255,.98);border-top:1px solid #e7e7e9;display:grid;grid-template-columns:repeat(4,1fr);z-index:50;backdrop-filter:blur(14px)}
      #mediousaoBottomNav button{border:0;background:transparent;color:#777;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font-size:11px;font-weight:750;padding:2px 1px}
      #mediousaoBottomNav button.active{color:#111}
      #mediousaoBottomNav svg{width:23px;height:23px;stroke:currentColor;fill:none;stroke-width:2}
      #mediousaoBottomNav .home-icon{fill:currentColor;stroke:currentColor}
      #mediousaoBottomNav .nav-label{line-height:1.05}
      main{padding-bottom:88px!important}
      nav{display:none!important}
      #home .hero{display:none!important}
      #home>.section{display:none!important}
      #home>section:has(#upcomingGrid){display:none!important}
      #home #connection,#home .notice,#home .location-notice,#home .bonao-notice{display:none!important}
      #homeGrid{margin-top:8px!important}
      #homeGrid .card{overflow:hidden!important}
      #homeGrid .card img{display:block!important;width:100%!important;aspect-ratio:1/1!important;object-fit:cover!important}
      #homeGrid .card .card-body,#homeGrid .card .info,#homeGrid .card .details{padding-top:9px!important}
      #homeGrid .card button,#homeGrid .card a{display:none!important}
      body:has(#home.active) input[type="search"],body:has(#home.active) input[placeholder*="Buscar" i],body:has(#home.active) input[placeholder*="buscar" i],body:has(#home.active) input[placeholder*="Tenis" i],body:has(#home.active) .search,body:has(#home.active) .search-box,body:has(#home.active) .searchbar,body:has(#home.active) form:has(input[type="search"]){display:none!important}
      #home input[type="search"],#home input[placeholder*="Buscar" i],#home input[placeholder*="buscar" i],#home input[placeholder*="Tenis" i],#home .search,#home .search-box,#home .searchbar{display:none!important}
      #home [id*="connection" i],#home [class*="connection" i]{display:none!important}
      .app > .notice,.app .location-notice,.app .bonao-notice,[class*="bonao" i],[id*="bonao" i]{display:none!important}
    `;document.head.appendChild(style);
    const obs=new MutationObserver(()=>{hideHomeExtras();hideBonaoEverywhere()});obs.observe(document.body,{childList:true,subtree:true});
    hideHomeExtras();hideBonaoEverywhere();
    const header=document.querySelector('header');
    if(header&&!document.getElementById('mediousaoTopCart')){const cart=document.createElement('button');cart.id='mediousaoTopCart';cart.setAttribute('aria-label','Carrito');cart.innerHTML='<svg viewBox="0 0 24 24"><path d="M3 4h2l2.1 10.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 1.9-1.4L20 8H6"/><circle cx="10" cy="20" r="1.2"/><circle cx="18" cy="20" r="1.2"/></svg><span class="cart-badge"></span>';cart.onclick=function(){if(typeof window.show==='function')window.show('cart')};header.appendChild(cart)}
    let bottom=document.getElementById('mediousaoBottomNav');
    if(!bottom){bottom=document.createElement('div');bottom.id='mediousaoBottomNav';bottom.innerHTML='<button data-go="home" class="active"><svg class="home-icon" viewBox="0 0 24 24"><path d="M3 10.8 12 3l9 7.8v9.2a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg><span class="nav-label">Casa</span></button><button data-go="upcoming"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg><span class="nav-label">Próximamente</span></button><button data-go="reserve"><svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="16" rx="2"/><path d="M7 3v4M17 3v4M3.5 9h17M8 13h2M14 13h2M8 17h2M14 17h2"/></svg><span class="nav-label">Reserva</span></button><button data-go="profile"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/></svg><span class="nav-label">Perfil</span></button>';document.body.appendChild(bottom)}
    bottom.querySelectorAll('button').forEach(btn=>{if(btn.dataset.bound==='1')return;btn.dataset.bound='1';btn.addEventListener('click',function(){const go=this.dataset.go;bottom.querySelectorAll('button').forEach(x=>x.classList.remove('active'));this.classList.add('active');if(go==='home'){if(typeof window.show==='function')window.show('home');window.scrollTo(0,0);setTimeout(hideHomeExtras,100)}else if(go==='upcoming'){if(typeof window.show==='function')window.show('home');setTimeout(()=>{const el=document.getElementById('upcomingGrid');if(el)el.scrollIntoView({behavior:'smooth',block:'start'})},60)}else if(go==='reserve'){if(typeof window.show==='function')window.show('reserve')}else if(go==='profile'){let p=document.getElementById('mediousaoProfileScreen');if(!p){p=document.createElement('section');p.id='mediousaoProfileScreen';p.className='screen';p.innerHTML='<div class="hero"><h1>Perfil</h1><p class="muted">Puedes comprar en MEDIOUSAO sin crear una cuenta.</p><button class="btn primary full" onclick="show(\'home\')">Volver a Casa</button></div>';document.querySelector('.app').appendChild(p)}if(typeof window.show==='function')window.show('mediousaoProfileScreen')}})});updateCartBadge();
  }
  function updateCartBadge(){const badge=document.querySelector('#mediousaoTopCart .cart-badge');if(!badge)return;let count=0;try{if(Array.isArray(window.cart))count=window.cart.reduce((n,x)=>n+Number(x.quantity||1),0);else if(Array.isArray(window.cartItems))count=window.cartItems.reduce((n,x)=>n+Number(x.quantity||1),0)}catch(e){}if(count>0){badge.textContent=count>99?'99+':String(count);badge.style.display='flex'}else badge.style.display='none'}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',inject);else inject();
  setTimeout(inject,300);setTimeout(hideHomeExtras,700);setInterval(()=>{hideHomeExtras();hideBonaoEverywhere()},900);setTimeout(updateCartBadge,900);
})();