/* MEDIOUSAO - protege publicación y añade eliminación segura de productos */
(function(){
  let publishing=false, decorating=false;
  const NO_NAME_MARK='__MEDIOUSAO_SIN_NOMBRE__';

  function prepareTypeSelector(){
    const s=document.getElementById('pType');
    if(!s||s.dataset.requiredType==='1')return;
    s.innerHTML='<option value="" selected disabled>Estado</option><option value="new">Nuevo</option><option value="used">Usado</option>';
    s.value='';
    s.dataset.requiredType='1';
  }

  function prepareOptionalName(){
    const name=document.getElementById('pName');
    if(name)name.placeholder='Nombre (opcional)';
  }

  function cleanParts(parts){return parts.filter(x=>String(x||'').trim()).map(x=>String(x).trim());}
  function productMeta(p){return cleanParts([typeof labelType==='function'?labelType(p):'',typeof labelAudience==='function'?labelAudience(p):'']).join(' · ');}
  function productDescription(p){
    const parts=[];
    if(p.size)parts.push('Talla '+p.size);
    if(p.condition)parts.push(p.condition);
    return cleanParts(parts).join(' · ');
  }
  function displayName(p){return p&&p.name!==NO_NAME_MARK?p.name:'';}

  function installCatalogPresentation(){
    if(window.__mediousaoCatalogPresentation)return;
    if(typeof window.card==='function'){
      window.card=function(p){
        const title=displayName(p);
        const photo=p.image_url?`<img src="${esc(p.image_url)}" alt="${esc(title||'Producto')}" loading="lazy">`:icon(p);
        const meta=productMeta(p),desc=productDescription(p);
        return `<div class="card"><div class="photo" onclick="detail('${p.id}')">${photo}</div><div class="info">${title?`<div class="name">${esc(title)}</div>`:''}${meta?`<div class="tag">${esc(meta)}</div>`:''}${desc?`<div class="tag">${esc(desc)}</div>`:''}<div class="price">${money(p.price)}</div><button class="btn primary full" onclick="add('${p.id}')">Agregar</button></div></div>`;
      };
    }
    if(typeof window.detail==='function'){
      window.detail=function(id){
        const p=products.find(x=>x.id===id);if(!p)return;selectedProduct=p;
        const title=displayName(p),meta=productMeta(p),desc=productDescription(p);
        const detailPhoto=p.image_url?`<img src="${esc(p.image_url)}" alt="${esc(title||'Producto')}">`:icon(p);
        document.getElementById('detailContent').innerHTML=`<div class="detailphoto">${detailPhoto}</div>${title?`<h1>${esc(title)}</h1>`:''}${meta?`<p class="muted">${esc(meta)}</p>`:''}${desc?`<p class="muted">${esc(desc)}</p>`:''}<h2>${money(p.price)}</h2><div class="notice">Disponible · ${Number(p.stock)} unidad(es)<br><span class="muted">Puedes reservarlo por 24 horas para que nadie más lo compre.</span></div><button class="btn dark full" onclick="openReserve('${p.id}','delivery')">🛵 Reservar para delivery</button><button class="btn primary full" style="margin-top:8px" onclick="openReserve('${p.id}','pickup')">🏪 Reservar para recoger</button><button class="btn full" style="margin-top:8px" onclick="add('${p.id}')">Agregar al carrito</button>`;
        show('detail');
      };
    }
    window.__mediousaoCatalogPresentation=true;
    if(typeof render==='function')render();
  }

  function installPublishGuard(){
    if(typeof window.addProductAdmin!=='function'||window.__productPublishGuard)return;
    const original=window.addProductAdmin;
    window.addProductAdmin=async function(){
      const type=document.getElementById('pType');
      if(!type?.value){
        if(typeof adminMessage==='function')adminMessage('Selecciona si el producto es Nuevo o Usado.',true);
        else alert('Selecciona si el producto es Nuevo o Usado.');
        type?.focus();return;
      }
      const name=document.getElementById('pName');let automaticName=false;
      if(name&&!name.value.trim()){name.value=NO_NAME_MARK;automaticName=true;}
      if(publishing)return;
      publishing=true;
      const btn=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Publicar producto');
      const oldText=btn?.textContent;if(btn){btn.disabled=true;btn.textContent='Publicando…';}
      try{await original.apply(this,arguments);}finally{
        if(automaticName&&name)name.value='';
        setTimeout(()=>{publishing=false;if(btn){btn.disabled=false;btn.textContent=oldText||'Publicar producto';}},1200);
      }
    };
    window.__productPublishGuard=true;
  }

  window.deleteProductAdminSafe=async function(id,name){
    const shown=name===NO_NAME_MARK?'este producto':(name||'este producto');
    if(!confirm(`¿Eliminar ${shown}? Esta acción no se puede deshacer.`))return;
    try{
      const rel=await client.from('product_categories').delete().eq('product_id',id);if(rel.error)console.warn(rel.error);
      const {error}=await client.from('products').delete().eq('id',id);if(error)throw error;
      if(typeof adminMessage==='function')adminMessage('Producto eliminado. ✅');await loadAdminProducts();await loadProducts();
    }catch(e){console.error(e);if(typeof adminMessage==='function')adminMessage('No se pudo eliminar el producto. Revisa los permisos del administrador.',true);}
  };

  async function addDeleteButtons(){
    if(decorating)return;const box=document.getElementById('adminProducts');if(!box)return;
    const items=[...box.querySelectorAll('.admin-item')];if(!items.length||items.every(x=>x.querySelector('.product-delete-btn')))return;
    decorating=true;
    try{
      const {data,error}=await client.from('products').select('id,name').order('created_at',{ascending:false});if(error)throw error;
      items.forEach((item,i)=>{if(item.querySelector('.product-delete-btn')||!data?.[i])return;let actions=item.querySelector('.admin-actions');if(!actions){actions=document.createElement('div');actions.className='admin-actions';item.appendChild(actions);}const b=document.createElement('button');b.type='button';b.className='btn danger product-delete-btn';b.textContent='Eliminar';b.onclick=()=>window.deleteProductAdminSafe(data[i].id,data[i].name);actions.appendChild(b);});
    }catch(e){console.error(e);}finally{decorating=false;}
  }

  function install(){prepareTypeSelector();prepareOptionalName();installCatalogPresentation();installPublishGuard();addDeleteButtons();const box=document.getElementById('adminProducts');if(box&&!window.__productDeleteObserver){new MutationObserver(()=>setTimeout(addDeleteButtons,50)).observe(box,{childList:true,subtree:true});window.__productDeleteObserver=true;}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,0));else setTimeout(install,0);
  setTimeout(install,700);
})();
