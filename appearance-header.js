/* MEDIOUSAO - controles extra de Apariencia */
(function(){
  function ensureFields(){
    const panel=document.querySelector('#adminPanelAppearance .box');
    if(!panel||document.getElementById('setHeaderSubtitle'))return;
    const save=panel.querySelector('button[onclick="saveAppearance()"]');
    if(!save)return;
    const wrap=document.createElement('div');
    wrap.id='appearanceHeaderControls';
    wrap.innerHTML=`
      <hr style="border:0;border-top:1px solid #eee;margin:16px 0">
      <h3 style="margin:0 0 10px">Encabezado</h3>
      <label>Subtítulo del encabezado</label>
      <input id="setHeaderSubtitle" placeholder="Estilo real. Precios reales." style="margin:6px 0 10px">
      <label>Texto del buscador</label>
      <input id="setSearchPlaceholder" placeholder="Buscar tenis, ropa, marcas..." style="margin:6px 0 10px">
      <div class="switch"><span>Mostrar buscador</span><input id="setSearchVisible" type="checkbox"></div>
      <label>Tamaño del nombre/logo</label>
      <input id="setLogoSize" type="number" min="18" max="60" step="1" style="margin:6px 0 10px">
    `;
    panel.insertBefore(wrap,save);
  }

  function applyHeader(x){
    if(!x)return;
    const sub=document.getElementById('appSubtitle');
    if(sub&&x.header_subtitle!=null)sub.textContent=x.header_subtitle;
    const search=document.getElementById('search');
    if(search){
      if(x.search_placeholder!=null)search.placeholder=x.search_placeholder;
      search.style.display=x.search_visible===false?'none':'';
    }
    const logo=document.getElementById('appLogo');
    if(logo&&x.logo_size){logo.style.fontSize=Math.max(18,Math.min(60,Number(x.logo_size)||29))+'px';}
  }

  function fillHeaderForm(x){
    ensureFields();
    x=x||window.appSettings||{};
    const a=document.getElementById('setHeaderSubtitle');if(a)a.value=x.header_subtitle??'Estilo real. Precios reales.';
    const b=document.getElementById('setSearchPlaceholder');if(b)b.value=x.search_placeholder??'Buscar tenis, ropa, marcas...';
    const c=document.getElementById('setSearchVisible');if(c)c.checked=x.search_visible!==false;
    const d=document.getElementById('setLogoSize');if(d)d.value=x.logo_size||29;
  }

  const oldApply=window.applyAppearance;
  if(typeof oldApply==='function')window.applyAppearance=function(x){oldApply(x);applyHeader(x);};

  const oldLoadForm=window.loadAppearanceForm;
  if(typeof oldLoadForm==='function')window.loadAppearanceForm=async function(){
    const r=await oldLoadForm();
    fillHeaderForm(window.appSettings);
    return r;
  };

  const oldSave=window.saveAppearance;
  if(typeof oldSave==='function')window.saveAppearance=async function(){
    ensureFields();
    const extra={
      header_subtitle:(document.getElementById('setHeaderSubtitle')?.value||'').trim(),
      search_placeholder:(document.getElementById('setSearchPlaceholder')?.value||'').trim(),
      search_visible:!!document.getElementById('setSearchVisible')?.checked,
      logo_size:Math.max(18,Math.min(60,Number(document.getElementById('setLogoSize')?.value)||29))
    };
    let id=window.appSettings?.id;
    let q=id?client.from('app_settings').update(extra).eq('id',id):client.from('app_settings').update(extra).neq('id','00000000-0000-0000-0000-000000000000');
    const {error}=await q;
    if(error){adminMessage('No se pudieron guardar los controles del encabezado.',true);return;}
    const r=await oldSave();
    window.appSettings={...(window.appSettings||{}),...extra};
    applyHeader(window.appSettings);
    return r;
  };

  function init(){ensureFields();applyHeader(window.appSettings||{});fillHeaderForm(window.appSettings||{});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
