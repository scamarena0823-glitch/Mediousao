/* MEDIOUSAO - controles de tamaño para banners */
(function(){
  const clamp=(n,min,max,def)=>{n=parseInt(n,10);return Number.isFinite(n)?Math.max(min,Math.min(max,n)):def};
  function injectFields(){
    const action=document.getElementById('bannerActionValue');
    if(!action||document.getElementById('bannerWidth'))return;
    const wrap=document.createElement('div');wrap.className='mini-grid';wrap.style.marginBottom='8px';
    wrap.innerHTML='<div><label>Ancho (%)</label><input id="bannerWidth" type="number" min="30" max="100" value="100" style="margin-top:6px"></div><div><label>Alto (px)</label><input id="bannerHeight" type="number" min="80" max="600" value="210" style="margin-top:6px"></div>';
    action.insertAdjacentElement('afterend',wrap);
  }
  function dims(){return {width_percent:clamp(document.getElementById('bannerWidth')?.value,30,100,100),height_px:clamp(document.getElementById('bannerHeight')?.value,80,600,210)}}
  function applyBannerSizes(){
    document.querySelectorAll('#homeBanners .hero[data-banner-id],#exploreBanners .hero[data-banner-id]').forEach(()=>{});
  }
  function renderSized(list,placement){
    return (list||[]).filter(b=>b.placement===placement||b.placement==='both').map(b=>{
      const w=clamp(b.width_percent,30,100,100),h=clamp(b.height_px,80,600,210);
      const click=`bannerAction(${JSON.stringify(b).replace(/"/g,'&quot;')})`;
      return `<div class="hero" style="padding:0;overflow:hidden;margin:0 auto 12px;width:${w}%;height:${h}px;position:relative" onclick="${click}">${b.image_url?`<img src="${esc(b.image_url)}" alt="" style="width:100%;height:100%;object-fit:cover;display:block">`:''}<div style="position:absolute;left:0;right:0;bottom:0;padding:14px;background:linear-gradient(transparent,rgba(0,0,0,.72));color:#fff"><b>${esc(b.title||'')}</b>${b.text?`<div style="font-size:13px;margin-top:3px">${esc(b.text)}</div>`:''}</div></div>`;
    }).join('');
  }
  async function sizedLoadBanners(){
    const home=document.getElementById('homeBanners'),explore=document.getElementById('exploreBanners');
    try{const {data,error}=await client.from('banners').select('*').eq('active',true).order('sort_order',{ascending:true});if(error)throw error;if(home)home.innerHTML=renderSized(data,'home');if(explore)explore.innerHTML=renderSized(data,'explore');}catch(e){if(home)home.innerHTML='';if(explore)explore.innerHTML='';}
  }
  async function sizedAdd(){
    const title=document.getElementById('bannerTitle').value.trim(),text=document.getElementById('bannerText').value.trim(),image_url=document.getElementById('bannerImage').value.trim();
    if(!title||!image_url)return adminMessage('Completa título e imagen del banner.',true);
    const d=dims();const {data:last}=await client.from('banners').select('sort_order').order('sort_order',{ascending:false}).limit(1);
    const {error}=await client.from('banners').insert({title,text,image_url,placement:document.getElementById('bannerPlacement').value,action_type:document.getElementById('bannerActionType').value,action_value:document.getElementById('bannerActionValue').value.trim()||null,active:true,sort_order:(last?.[0]?.sort_order||0)+1,...d});
    if(error)return adminMessage('No se pudo agregar el banner.',true);
    adminMessage('Banner agregado. ✅');['bannerTitle','bannerText','bannerImage','bannerActionValue'].forEach(id=>document.getElementById(id).value='');document.getElementById('bannerWidth').value=100;document.getElementById('bannerHeight').value=210;await loadAdminBanners();await sizedLoadBanners();
  }
  async function sizedEdit(id){
    const {data}=await client.from('banners').select('*').eq('id',id).single();if(!data)return adminMessage('No se encontró el banner.',true);
    const title=prompt('Título:',data.title||'');if(title===null)return;const text=prompt('Texto:',data.text||'');if(text===null)return;const image=prompt('URL de imagen:',data.image_url||'');if(image===null)return;
    const placement=prompt('Ubicación: home = Inicio, explore = Explorar, both = ambos',data.placement||'home');if(placement===null||!['home','explore','both'].includes(placement.trim()))return adminMessage('Ubicación no válida.',true);
    const action_type=prompt('Acción: none, category, product o url',data.action_type||'none');if(action_type===null||!['none','category','product','url'].includes(action_type.trim()))return adminMessage('Acción no válida.',true);
    const action_value=prompt('Valor de acción (opcional):',data.action_value||'');if(action_value===null)return;
    let width=prompt('Ancho del banner en % (30 a 100):',data.width_percent||100);if(width===null)return;width=clamp(width,30,100,100);
    let height=prompt('Alto del banner en px (80 a 600):',data.height_px||210);if(height===null)return;height=clamp(height,80,600,210);
    const {error}=await client.from('banners').update({title:title.trim(),text:text.trim(),image_url:image.trim(),placement:placement.trim(),action_type:action_type.trim(),action_value:action_value.trim()||null,width_percent:width,height_px:height}).eq('id',id);
    if(error)return adminMessage('No se pudo editar el banner.',true);adminMessage('Banner actualizado. ✅');await loadAdminBanners();await sizedLoadBanners();
  }
  function enhanceList(){const box=document.getElementById('adminBanners');if(!box)return;client.from('banners').select('id,width_percent,height_px').order('sort_order',{ascending:true}).then(({data})=>{(data||[]).forEach((b,i)=>{const item=box.querySelectorAll('.admin-item')[i];if(item&&!item.querySelector('.banner-size-info')){const x=document.createElement('div');x.className='muted banner-size-info';x.style.marginTop='4px';x.textContent=`Tamaño: ${b.width_percent||100}% × ${b.height_px||210}px`;item.querySelector('.admin-actions')?.insertAdjacentElement('beforebegin',x)}})});}
  function install(){injectFields();window.loadBanners=sizedLoadBanners;window.addBannerAdmin=sizedAdd;window.editBanner=sizedEdit;const oldAdmin=window.loadAdminBanners;if(oldAdmin&&!window.__bannerSizeAdmin){window.loadAdminBanners=async function(){let r=await oldAdmin.apply(this,arguments);enhanceList();return r};window.__bannerSizeAdmin=1}setTimeout(sizedLoadBanners,0)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();
