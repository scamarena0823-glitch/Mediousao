/* MEDIOUSAO - protege publicación y añade eliminación segura de productos */
(function(){
  let publishing=false, decorating=false;

  function installPublishGuard(){
    if(typeof window.addProductAdmin!=='function'||window.__productPublishGuard)return;
    const original=window.addProductAdmin;
    window.addProductAdmin=async function(){
      if(publishing)return;
      publishing=true;
      const btn=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Publicar producto');
      const oldText=btn?.textContent;
      if(btn){btn.disabled=true;btn.textContent='Publicando…';}
      try{ await original.apply(this,arguments); }
      finally{
        setTimeout(()=>{
          publishing=false;
          if(btn){btn.disabled=false;btn.textContent=oldText||'Publicar producto';}
        },1200);
      }
    };
    window.__productPublishGuard=true;
  }

  window.deleteProductAdminSafe=async function(id,name){
    if(!confirm(`¿Eliminar ${name}? Esta acción no se puede deshacer.`))return;
    try{
      const rel=await client.from('product_categories').delete().eq('product_id',id);
      if(rel.error)console.warn(rel.error);
      const {error}=await client.from('products').delete().eq('id',id);
      if(error)throw error;
      if(typeof adminMessage==='function')adminMessage('Producto eliminado. ✅');
      await loadAdminProducts();
      await loadProducts();
    }catch(e){
      console.error(e);
      if(typeof adminMessage==='function')adminMessage('No se pudo eliminar el producto. Revisa los permisos del administrador.',true);
    }
  };

  async function addDeleteButtons(){
    if(decorating)return;
    const box=document.getElementById('adminProducts');
    if(!box)return;
    const items=[...box.querySelectorAll('.admin-item')];
    if(!items.length||items.every(x=>x.querySelector('.product-delete-btn')))return;
    decorating=true;
    try{
      const {data,error}=await client.from('products').select('id,name').order('created_at',{ascending:false});
      if(error)throw error;
      items.forEach((item,i)=>{
        if(item.querySelector('.product-delete-btn')||!data?.[i])return;
        let actions=item.querySelector('.admin-actions');
        if(!actions){actions=document.createElement('div');actions.className='admin-actions';item.appendChild(actions);}
        const b=document.createElement('button');
        b.type='button'; b.className='btn danger product-delete-btn'; b.textContent='Eliminar';
        b.onclick=()=>window.deleteProductAdminSafe(data[i].id,data[i].name||'este producto');
        actions.appendChild(b);
      });
    }catch(e){console.error(e);}finally{decorating=false;}
  }

  function install(){
    installPublishGuard();
    addDeleteButtons();
    const box=document.getElementById('adminProducts');
    if(box&&!window.__productDeleteObserver){
      new MutationObserver(()=>setTimeout(addDeleteButtons,50)).observe(box,{childList:true,subtree:true});
      window.__productDeleteObserver=true;
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,0));else setTimeout(install,0);
  setTimeout(install,700);
})();
