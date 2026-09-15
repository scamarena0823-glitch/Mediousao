/* MEDIOUSAO - carga directa de imagen para Productos */
(function(){
  function inject(){
    const image=document.getElementById('pImage');
    const name=document.getElementById('pName');
    if(!image||!name||document.getElementById('productUploadBtn'))return;
    const box=document.createElement('div');
    box.style.margin='0 0 8px';
    box.innerHTML='<input id="productUploadFile" type="file" accept="image/*" style="display:none"><button id="productUploadBtn" type="button" class="btn full">📷 Subir imagen</button><div id="productUploadMsg" class="muted" style="margin-top:6px"></div>';
    name.insertAdjacentElement('afterend',box);
    document.getElementById('productUploadBtn').onclick=()=>document.getElementById('productUploadFile').click();
    document.getElementById('productUploadFile').onchange=upload;
  }
  async function upload(e){
    const file=e.target.files?.[0]; if(!file)return;
    const btn=document.getElementById('productUploadBtn');
    const msg=document.getElementById('productUploadMsg');
    if(!file.type.startsWith('image/')){msg.textContent='Selecciona una imagen válida.';return;}
    const ext=(file.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'')||'jpg';
    const path=`products/${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`;
    try{
      btn.disabled=true; msg.textContent='Subiendo imagen…';
      const {error}=await client.storage.from('mediousao-media').upload(path,file,{cacheControl:'3600',upsert:false,contentType:file.type});
      if(error)throw error;
      const {data}=client.storage.from('mediousao-media').getPublicUrl(path);
      document.getElementById('pImage').value=data.publicUrl;
      msg.textContent='Imagen subida. ✅';
      if(typeof adminMessage==='function')adminMessage('Imagen del producto subida. ✅');
    }catch(err){
      console.error(err); msg.textContent='No se pudo subir la imagen.';
      if(typeof adminMessage==='function')adminMessage('No se pudo subir la imagen del producto.',true);
    }finally{btn.disabled=false;e.target.value='';}
  }
  function init(){inject();setTimeout(inject,500);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
