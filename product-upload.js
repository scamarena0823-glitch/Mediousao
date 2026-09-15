/* MEDIOUSAO - carga directa de varias imágenes para Productos */
(function(){
  window.mediousaoProductImages=window.mediousaoProductImages||[];
  function customizeDescription(){const field=document.getElementById('pCondition');if(!field)return;field.placeholder='Descripción';field.setAttribute('aria-label','Descripción');}
  function syncMainImage(){const image=document.getElementById('pImage');if(image)image.value=(window.mediousaoProductImages||[])[0]||'';}
  function renderPreview(){
    const preview=document.getElementById('productUploadPreview'),clear=document.getElementById('productUploadClear'),msg=document.getElementById('productUploadMsg');if(!preview)return;
    const images=window.mediousaoProductImages||[];
    preview.innerHTML=images.map((url,i)=>`<div style="position:relative;flex:0 0 78px;padding-top:3px"><img src="${url}" alt="Foto ${i+1}" style="width:78px;height:78px;object-fit:cover;border-radius:10px;border:1px solid #ddd"><button type="button" data-remove-image="${i}" aria-label="Eliminar foto ${i+1}" style="position:absolute;right:-2px;top:0;width:25px;height:25px;border:0;border-radius:50%;background:#111;color:#fff;font-size:16px;font-weight:900;line-height:25px;padding:0">×</button><span style="position:absolute;right:4px;bottom:4px;background:rgba(0,0,0,.65);color:#fff;border-radius:999px;padding:2px 6px;font-size:11px">${i+1}</span></div>`).join('');
    preview.querySelectorAll('[data-remove-image]').forEach(b=>b.onclick=function(){const i=Number(this.dataset.removeImage);window.mediousaoProductImages.splice(i,1);syncMainImage();renderPreview();if(msg)msg.textContent=window.mediousaoProductImages.length?`${window.mediousaoProductImages.length} imagen(es) seleccionada(s).`:'No hay imágenes seleccionadas.';});
    if(clear)clear.style.display=images.length?'block':'none';
  }
  function inject(){
    customizeDescription();const image=document.getElementById('pImage'),name=document.getElementById('pName');if(!image||!name||document.getElementById('productUploadBtn'))return;
    const box=document.createElement('div');box.style.margin='0 0 8px';
    box.innerHTML='<input id="productUploadFile" type="file" accept="image/*" multiple style="display:none"><button id="productUploadBtn" type="button" class="btn full">📷 Subir imágenes</button><div id="productUploadMsg" class="muted" style="margin-top:6px"></div><div id="productUploadPreview" style="display:flex;gap:9px;overflow-x:auto;margin-top:8px;padding:3px 3px 5px"></div><button id="productUploadClear" type="button" class="btn danger full" style="display:none;margin-top:8px">Eliminar todas las imágenes</button>';
    name.insertAdjacentElement('beforebegin',box);document.getElementById('productUploadBtn').onclick=()=>document.getElementById('productUploadFile').click();document.getElementById('productUploadFile').onchange=upload;document.getElementById('productUploadClear').onclick=function(){window.mediousaoProductImages=[];syncMainImage();renderPreview();document.getElementById('productUploadMsg').textContent='No hay imágenes seleccionadas.';};renderPreview();
  }
  async function upload(e){
    const files=[...(e.target.files||[])];if(!files.length)return;const btn=document.getElementById('productUploadBtn'),msg=document.getElementById('productUploadMsg');if(files.some(f=>!f.type.startsWith('image/'))){msg.textContent='Selecciona solamente imágenes válidas.';return;}
    try{btn.disabled=true;window.mediousaoProductImages=[];for(let i=0;i<files.length;i++){const file=files[i];msg.textContent=`Subiendo ${i+1} de ${files.length}…`;const ext=(file.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'')||'jpg';const path=`products/${Date.now()}-${i}-${Math.random().toString(36).slice(2,8)}.${ext}`;const {error}=await client.storage.from('mediousao-media').upload(path,file,{cacheControl:'3600',upsert:false,contentType:file.type});if(error)throw error;const {data}=client.storage.from('mediousao-media').getPublicUrl(path);window.mediousaoProductImages.push(data.publicUrl);syncMainImage();renderPreview();}msg.textContent=`${window.mediousaoProductImages.length} imagen(es) subida(s). ✅`;if(typeof adminMessage==='function')adminMessage('Imágenes del producto subidas. ✅');}
    catch(err){console.error(err);msg.textContent='No se pudieron subir todas las imágenes.';if(typeof adminMessage==='function')adminMessage('No se pudieron subir las imágenes del producto.',true);}finally{btn.disabled=false;e.target.value='';}
  }
  window.getMediousaoProductImages=()=>[...(window.mediousaoProductImages||[])];window.clearMediousaoProductImages=function(){window.mediousaoProductImages=[];syncMainImage();renderPreview();};
  function init(){inject();setTimeout(inject,500);setTimeout(customizeDescription,1200);}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
