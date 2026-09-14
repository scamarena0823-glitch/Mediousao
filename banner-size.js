/* MEDIOUSAO - controles de tamaño y carga directa para banners */
(function(){
  const clamp=(n,min,max,def)=>{n=parseInt(n,10);return Number.isFinite(n)?Math.max(min,Math.min(max,n)):def};
  function injectFields(){
    const action=document.getElementById('bannerActionValue');
    if(!action||document.getElementById('bannerWidth'))return;
    const wrap=document.createElement('div');wrap.className='mini-grid';wrap.style.marginBottom='8px';
    wrap.innerHTML='<div><label>Ancho (%)</label><input id="bannerWidth" type="number" min="30" max="100" value="100" style="margin-top:6px"></div><div><label>Alto (px)</label><input id="bannerHeight" type="number" min="80" max="600" value="210" style="margin-top:6px"></div>';
    action.insertAdjacentElement('afterend',wrap);
  }
  function injectUploader(){
    const image=document.getElementById('bannerImage');
    if(!image||document.getElementById('bannerUploadBtn'))return;
    const box=document.createElement('div');box.style.margin='-2px 0 8px';
    box.innerHTML='<input id="bannerUploadFile" type="file" accept="image/*" style="display:none"><button id="bannerUploadBtn" type="button" class="btn full">📷 Subir imagen desde el teléfono</button><div id="bannerUploadMsg" class="muted" style="margin-top:6px"></div>';
    image.insertAdjacentElement('afterend',box);
    document.getElementById('bannerUploadBtn').onclick=()=>document.getElementById('bannerUploadFile').click();
    document.getElementById('bannerUploadFile').onchange=uploadBannerImage;
  }
  async function uploadBannerImage(e){
    const file=e.target.files?.[0];if(!file)return;
    if(!file.type.startsWith('image/'))return adminMessage('Selecciona una imagen válida.',true);
    const msg=document.getElementById('bannerUploadMsg'),btn=document.getElementById('bannerUploadBtn');
    const ext=(file.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'')||'jpg';
    const path=`banners/${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`;
    try{
      btn.disabled=true;msg.textContent='Subiendo imagen…';
      const {error}=await client.storage.from('mediousao-media').upload(path,file,{cacheControl:'3600',upsert:false,contentType:file.type});
      if(error)throw error;
      const {data}=client.storage.from('mediousao-media').getPublicUrl(path);
      document.getElementById('bannerImage').value=data.publicUrl;
      msg.textContent='Imagen subida y URL colocada automáticamente. ✅';
      adminMessage('Imagen del banner subida. ✅');
    }catch(err){
      console.error(err);msg.textContent='No se pudo subir la imagen.';adminMessage('No se pudo subir la imagen. Verifica la sesión del administrador.',true);
    }finally{btn.disabled=false;e.target.value='';}
  }
  function dims(){return {width_percent:clamp(document.getElementById('bannerWidth')?.value,30,100,100),height_px:clamp(document.getElementById('bannerHeight')?.value,80,600,210)}}
  function renderSized(list,placement){
    return (list||[]).filter(b=>b.placement===placement||b.placement==='both').map(b=>{
      const w=clamp(b.width_percent,30,100,100),h=clamp(b.height_px,80,600,210);
      const click=`bannerAction(${JSON.stringify(b).replace(/"/g,'&quot;')})`;
      const title=(b.title||'').trim(),text=(b.text||'').trim();
      const overlay=(title||text)?`<div style="position:absolute;left:0;right:0;bottom:0;padding:14px;background:linear-gradient(transparent,rgba(0,0,0,.72));color:#fff">${title?`<b>${esc(title)}</b>`:''}${text?`<div style="font-size:13px;margin-top:3px">${esc(text)}</div>`:''}</div>`:'';
      return `<div class="hero" style="padding:0;overflow:hidden;margin:0 auto 12px;width:${w}%;height:${h}px;position:relative" onclick="${click}">${b.image_url?`<img src="${esc(b.image_url)}" alt="" style="width:100%;height:100%;object-fit:cover;display:block">`:''}${overlay}</div>`;
    }).join('');
  }
  async function sizedLoadBanners(){
    const home=document.getElementById('homeBanners'),explore=document.getElementById('exploreBanners');
    try{const {data,error}=await client.from('banners').select('*').eq('active',true).order('sort_order',{ascending:true});if(error)throw error;if(home)home.innerHTML=renderSized(data,'home');if(explore)explore.innerHTML=renderSized(data,'explore');}catch(e){if(home)home.innerHTML='';if(explore)explore.innerHTML='';}
  }
  async function sizedAdd(){
    const title=document.getElementById('bannerTitle').value.trim(),text=document.getElementById('bannerText').value.trim(),image_url=document.getElementById('bannerImage').value.trim();
    if(!image_url)return adminMessage('Completa la imagen del banner.',true);
    const d=dims();const {data:last}=await client.from('banners').select('sort_order').order('sort_order',{ascending:false}).limit(1);
    const {error}=await client.from('banners').insert({title,text,image_url,placement:document.getElementById('bannerPlacement').value,action_type:document.getElementById('bannerActionType').value,action_value:document.getElementById('bannerActionValue').value.trim()||null,active:true,sort_order:(last?.[0]?.sort_order||0)+1,...d});
    if(error)return adminMessage('No se pudo agregar el banner.',true);
    adminMessage('Banner agregado. ✅');['bannerTitle','bannerText','bannerImage','bannerActionValue'].forEach(id=>document.getElementById(id).value='');document.getElementById('bannerWidth').value=100;document.getElementById('bannerHeight').value=210;const m=document.getElementById('bannerUploadMsg');if(m)m.textContent='';await loadAdminBanners();await sizedLoadBanners();
  }
  async function sizedEdit(id){
    const {data}=await client.from('banners').select('*').eq('id',id).single();if(!data)return adminMessage('No se encontró el banner.',true);
    const title=prompt('Título (opcional):',data.title||'');if(title===null)return;const text=prompt('Texto (opcional):',data.text||'');if(text===null)return;const image=prompt('URL de imagen:',data.image_url||'');if(image===null)return;if(!image.trim())return adminMessage('La imagen del banner es obligatoria.',true);
    const placement=prompt('Ubicación: home = Inicio, explore = Explorar, both = ambos',data.placement||'home');if(placement===null||!['home','explore','both'].includes(placement.trim()))return adminMessage('Ubicación no válida.',true);
    const action_type=prompt('Acción: none, category, product o url',data.action_type||'none');if(action_type===null||!['none','category','product','url'].includes(action_type.trim()))return adminMessage('Acción no válida.',true);
    const action_value=prompt('Valor de acción (opcional):',data.action_value||'');if(action_value===null)return;
    let width=prompt('Ancho del banner en % (30 a 100):',data.width_percent||100);if(width===null)return;width=clamp(width,30,100,100);
    let height=prompt('Alto del banner en px (80 a 600):',data.height_px||210);if(height===null)return;height=clamp(height,80,600,210);
    const {error}=await client.from('banners').update({title:title.trim(),text:text.trim(),image_url:image.trim(),placement:placement.trim(),action_type:action_type.trim(),action_value:action_value.trim()||null,width_percent:width,height_px:height}).eq('id',id);
    if(error)return adminMessage('No se pudo editar el banner.',true);adminMessage('Banner actualizado. ✅');await loadAdminBanners();await sizedLoadBanners();
  }
  function enhanceList(){const box=document.getElementById('adminBanners');if(!box)return;client.from('banners').select('id,width_percent,height_px').order('sort_order',{ascending:true}).then(({data})=>{(data||[]).forEach((b,i)=>{const item=box.querySelectorAll('.admin-item')[i];if(item&&!item.querySelector('.banner-size-info')){const x=document.createElement('div');x.className='muted banner-size-info';x.style.marginTop='4px';x.textContent=`Tamaño: ${b.width_percent||100}% × ${b.height_px||210}px`;item.querySelector('.admin-actions')?.insertAdjacentElement('beforebegin',x)}})});}
  function install(){injectFields();injectUploader();window.loadBanners=sizedLoadBanners;window.addBannerAdmin=sizedAdd;window.editBanner=sizedEdit;const oldAdmin=window.loadAdminBanners;if(oldAdmin&&!window.__bannerSizeAdmin){window.loadAdminBanners=async function(){let r=await oldAdmin.apply(this,arguments);enhanceList();return r};window.__bannerSizeAdmin=1}setTimeout(sizedLoadBanners,0)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();
