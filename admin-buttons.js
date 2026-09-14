/* MEDIOUSAO - Administrador de botones y navegación */
(function(){
  const escBtn=s=>String(s??'').replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));
  let appButtons=[];

  function ensureStyles(){
    if(document.getElementById('mediousaoButtonStyles'))return;
    const style=document.createElement('style');
    style.id='mediousaoButtonStyles';
    style.textContent=`
      #customHomeButtons{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 0 18px}
      #customHomeButtons .custom-app-btn{width:100%;min-height:52px;border:1px solid #ddd;border-radius:12px;background:#fff;font-weight:800;font-size:15px;padding:12px}
      #customHomeButtons .custom-app-btn.primary-style{background:var(--primary,#e50914);color:#fff;border-color:transparent}
      .button-preview{display:inline-flex;align-items:center;gap:8px;min-height:42px}
      #mediousaoBottomNav{overflow-x:auto;justify-content:flex-start;gap:8px}
      #mediousaoBottomNav button{min-width:88px;flex:1 0 auto}
    `;
    document.head.appendChild(style);
  }

  function ensurePublicArea(){
    if(document.getElementById('customHomeButtons'))return;
    const hero=document.getElementById('homeHero');
    if(!hero)return;
    const box=document.createElement('div');
    box.id='customHomeButtons';
    hero.insertAdjacentElement('afterend',box);
  }

  function ensureBottomNav(){
    const nav=document.querySelector('.app > nav');
    if(nav&&!nav.id)nav.id='mediousaoBottomNav';
    return nav;
  }

  function ensureAdminUI(){
    const tabs=document.querySelector('#admin .admin-tabs');
    if(!tabs)return;
    if(!document.getElementById('adminButtonsTab')){
      const btn=document.createElement('button');
      btn.id='adminButtonsTab';
      btn.className='admin-tab';
      btn.textContent='🔘 Botones';
      btn.onclick=function(){adminTab('buttons',this);};
      tabs.appendChild(btn);
    }
    if(document.getElementById('adminPanelButtons'))return;
    const panel=document.createElement('div');
    panel.id='adminPanelButtons';
    panel.className='admin-panel';
    panel.innerHTML=`
      <div class="box" style="padding:16px;margin-bottom:14px">
        <h2>Crear botón</h2>
        <p class="muted">Crea botones para Inicio o para la barra inferior sin tocar el código.</p>
        <input id="btnLabel" placeholder="Nombre del botón, ej. Ofertas" style="margin-bottom:8px">
        <input id="btnIcon" placeholder="Icono, ej. 🔥" style="margin-bottom:8px">
        <select id="btnPlacement" class="search" style="margin-bottom:8px">
          <option value="home">Pantalla de Inicio</option>
          <option value="nav">Barra inferior</option>
        </select>
        <select id="btnActionType" class="search" style="margin-bottom:8px">
          <option value="catalog">Abrir catálogo</option>
          <option value="category">Abrir categoría</option>
          <option value="product">Abrir producto</option>
          <option value="cart">Abrir carrito</option>
          <option value="home">Ir a Inicio</option>
          <option value="url">Abrir enlace</option>
          <option value="none">Sin acción / Próximamente</option>
        </select>
        <input id="btnActionValue" placeholder="Categoría, ID de producto o enlace (si aplica)" style="margin-bottom:8px">
        <select id="btnStyle" class="search" style="margin-bottom:8px">
          <option value="normal">Claro</option>
          <option value="primary">Color principal</option>
        </select>
        <button class="btn primary full" onclick="addAppButtonAdmin()">Crear botón</button>
      </div>
      <div class="box" style="padding:16px;margin-bottom:14px">
        <div class="row"><h2>Barra inferior</h2><button class="btn" onclick="loadAdminButtons()">Actualizar</button></div>
        <div class="notice">Puedes mover, editar u ocultar Inicio, Explorar, Carrito y cualquier botón nuevo de navegación.</div>
        <div id="adminNavButtonsList"></div>
      </div>
      <div class="box" style="padding:16px">
        <h2>Botones de Inicio</h2>
        <div id="adminButtonsList"></div>
      </div>`;
    document.querySelector('#admin').appendChild(panel);
  }

  function buttonAction(b){
    const value=b.action_value||'';
    if(b.action_type==='none')return;
    if(b.action_type==='home')show('home');
    else if(b.action_type==='catalog')showCatalog();
    else if(b.action_type==='cart')show('cart');
    else if(b.action_type==='category'){selectedCategory=value;show('catalog');}
    else if(b.action_type==='product')detail(value);
    else if(b.action_type==='url'&&value)window.open(value,'_blank','noopener,noreferrer');
  }

  async function loadPublicButtons(){
    ensurePublicArea();
    const box=document.getElementById('customHomeButtons');
    if(!box)return;
    try{
      const {data,error}=await client.from('app_buttons').select('*').eq('active',true).order('sort_order',{ascending:true});
      if(error)throw error;
      appButtons=data||[];
      const homeButtons=appButtons.filter(b=>(b.placement||'home')==='home');
      box.innerHTML=homeButtons.map(b=>`<button class="custom-app-btn ${b.style==='primary'?'primary-style':''}" onclick="runAppButton('${b.id}')">${escBtn(b.icon||'')} ${escBtn(b.label)}</button>`).join('');
      box.style.display=homeButtons.length?'grid':'none';
      renderBottomNav();
    }catch(e){
      box.style.display='none';
      console.warn('MEDIOUSAO botones:',e?.message||e);
    }
  }

  function renderBottomNav(){
    const nav=ensureBottomNav();
    if(!nav)return;
    const rows=appButtons.filter(b=>b.placement==='nav'&&b.active).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));
    if(!rows.length)return;
    nav.innerHTML=rows.map(b=>{
      const count=b.system_key==='cart'?` <span id="cartCount">${cart.reduce((a,x)=>a+x.qty,0)}</span>`:'';
      return `<button data-nav-key="${escBtn(b.system_key||'custom')}" onclick="runAppButton('${b.id}')">${escBtn(b.icon||'🔘')}<br>${escBtn(b.label)}${count}</button>`;
    }).join('');
    refreshBottomNavActive();
  }

  function refreshBottomNavActive(){
    const nav=ensureBottomNav();if(!nav)return;
    nav.querySelectorAll('button').forEach(x=>x.classList.remove('on'));
    const active=document.querySelector('.screen.active')?.id;
    const key=active==='home'?'home':active==='catalog'?'catalog':active==='cart'?'cart':'';
    if(key)nav.querySelector(`[data-nav-key="${key}"]`)?.classList.add('on');
  }

  window.runAppButton=function(id){
    const b=appButtons.find(x=>String(x.id)===String(id));
    if(!b)return;
    buttonAction(b);
    setTimeout(refreshBottomNavActive,0);
  };

  function adminRow(b,i,allowDelete=true){
    const locked=b.system_key&&['home','catalog','cart'].includes(b.system_key);
    return `<div class="admin-item"><div class="row"><div><b>${escBtn(b.icon||'')} ${escBtn(b.label)}</b><div class="muted">Orden ${i+1} · ${b.active?'Visible':'Oculto'} · ${escBtn(b.action_type)}${locked?' · Principal':''}</div></div><button class="btn" onclick="toggleAppButton('${b.id}',${!b.active})">${b.active?'Ocultar':'Mostrar'}</button></div><div class="muted" style="margin-top:6px">Destino: ${escBtn(b.action_value||'—')}</div><div class="admin-actions"><button class="btn" onclick="editAppButton('${b.id}')">Editar</button><button class="btn" onclick="moveAppButton('${b.id}',-1)">↑</button><button class="btn" onclick="moveAppButton('${b.id}',1)">↓</button>${allowDelete&&!locked?`<button class="btn danger" onclick="deleteAppButton('${b.id}')">Eliminar</button>`:''}</div></div>`;
  }

  window.loadAdminButtons=async function(){
    ensureAdminUI();
    const homeBox=document.getElementById('adminButtonsList');
    const navBox=document.getElementById('adminNavButtonsList');
    if(!homeBox||!navBox)return;
    homeBox.innerHTML=navBox.innerHTML='<div class="muted">Cargando…</div>';
    const {data,error}=await client.from('app_buttons').select('*').order('sort_order',{ascending:true});
    if(error){homeBox.innerHTML='<div class="error">No se pudieron cargar los botones.</div>';navBox.innerHTML='';return;}
    appButtons=data||[];
    const navRows=appButtons.filter(b=>b.placement==='nav');
    const homeRows=appButtons.filter(b=>(b.placement||'home')==='home');
    navBox.innerHTML=navRows.map((b,i)=>adminRow(b,i,false)).join('')||'<div class="muted">No hay botones de navegación todavía.</div>';
    homeBox.innerHTML=homeRows.map((b,i)=>adminRow(b,i,true)).join('')||'<div class="muted">No hay botones de Inicio todavía.</div>';
  };

  window.addAppButtonAdmin=async function(){
    const label=document.getElementById('btnLabel').value.trim();
    const icon=document.getElementById('btnIcon').value.trim();
    const placement=document.getElementById('btnPlacement').value;
    const action_type=document.getElementById('btnActionType').value;
    const action_value=document.getElementById('btnActionValue').value.trim()||null;
    const style=document.getElementById('btnStyle').value;
    if(!label)return adminMessage('Escribe el nombre del botón.',true);
    if(['category','product','url'].includes(action_type)&&!action_value)return adminMessage('Ese tipo de botón necesita un destino.',true);
    const {data:rows}=await client.from('app_buttons').select('sort_order').eq('placement',placement).order('sort_order',{ascending:false}).limit(1);
    const sort_order=(rows?.[0]?.sort_order||0)+1;
    const {error}=await client.from('app_buttons').insert({label,icon:icon||null,action_type,action_value,style,active:true,visible:true,placement,sort_order});
    if(error)return adminMessage('No se pudo crear el botón. Revisa la actualización de app_buttons en Supabase.',true);
    ['btnLabel','btnIcon','btnActionValue'].forEach(id=>document.getElementById(id).value='');
    adminMessage('Botón creado. ✅');
    await loadAdminButtons();await loadPublicButtons();
  };

  window.toggleAppButton=async function(id,active){const {error}=await client.from('app_buttons').update({active,visible:active}).eq('id',id);if(error)return adminMessage('No se pudo actualizar el botón.',true);await loadAdminButtons();await loadPublicButtons();adminMessage(active?'Botón visible. ✅':'Botón oculto. ✅');};

  window.editAppButton=async function(id){
    const {data,error}=await client.from('app_buttons').select('*').eq('id',id).single();
    if(error||!data)return adminMessage('No se encontró el botón.',true);
    const label=prompt('Nombre del botón:',data.label||'');if(label===null||!label.trim())return;
    const icon=prompt('Icono:',data.icon||'');if(icon===null)return;
    const type=prompt('Acción: catalog, category, product, cart, home, url o none',data.action_type||'catalog');if(type===null||!['catalog','category','product','cart','home','url','none'].includes(type.trim()))return adminMessage('Acción no válida.',true);
    const value=prompt('Destino (categoría, ID o enlace; puede quedar vacío):',data.action_value||'');if(value===null)return;
    const style=prompt('Estilo: normal o primary',data.style||'normal');if(style===null||!['normal','primary'].includes(style.trim()))return adminMessage('Estilo no válido.',true);
    const {error:updateError}=await client.from('app_buttons').update({label:label.trim(),icon:icon.trim()||null,action_type:type.trim(),action_value:value.trim()||null,style:style.trim()}).eq('id',id);
    if(updateError)return adminMessage('No se pudo editar el botón.',true);
    adminMessage('Botón actualizado. ✅');await loadAdminButtons();await loadPublicButtons();
  };

  window.deleteAppButton=async function(id){
    const {data}=await client.from('app_buttons').select('system_key').eq('id',id).single();
    if(data?.system_key)return adminMessage('Los botones principales no se eliminan; puedes ocultarlos o moverlos.',true);
    if(!confirm('¿Eliminar este botón?'))return;
    const {error}=await client.from('app_buttons').delete().eq('id',id);
    if(error)return adminMessage('No se pudo eliminar el botón.',true);
    adminMessage('Botón eliminado. ✅');await loadAdminButtons();await loadPublicButtons();
  };

  window.moveAppButton=async function(id,delta){
    const {data:current,error:currentError}=await client.from('app_buttons').select('id,placement,sort_order').eq('id',id).single();if(currentError||!current)return;
    const {data,error}=await client.from('app_buttons').select('id,sort_order').eq('placement',current.placement).order('sort_order',{ascending:true});if(error||!data)return;
    const i=data.findIndex(x=>String(x.id)===String(id)),j=i+delta;if(i<0||j<0||j>=data.length)return;
    const a=data[i],b=data[j];
    await client.from('app_buttons').update({sort_order:b.sort_order}).eq('id',a.id);
    await client.from('app_buttons').update({sort_order:a.sort_order}).eq('id',b.id);
    await loadAdminButtons();await loadPublicButtons();
  };

  function wrapAdminTab(){
    if(typeof adminTab!=='function'||window.__mediousaoButtonsWrapped)return;
    const original=adminTab;
    window.adminTab=adminTab=function(name,btn){original(name,btn);if(name==='buttons')loadAdminButtons();};
    window.__mediousaoButtonsWrapped=true;
  }

  function wrapShow(){
    if(typeof show!=='function'||window.__mediousaoShowWrapped)return;
    const original=show;
    window.show=show=function(id){const r=original(id);setTimeout(refreshBottomNavActive,0);return r;};
    window.__mediousaoShowWrapped=true;
  }

  function init(){ensureStyles();ensurePublicArea();ensureBottomNav();ensureAdminUI();wrapAdminTab();wrapShow();loadPublicButtons();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
