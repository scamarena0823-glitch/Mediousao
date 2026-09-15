/* MEDIOUSAO - evita publicaciones duplicadas por doble evento/toque */
(function(){
  let publishing=false;
  function install(){
    if(typeof window.addProductAdmin!=='function'||window.__productPublishGuard)return;
    const original=window.addProductAdmin;
    window.addProductAdmin=async function(){
      if(publishing)return;
      publishing=true;
      const btn=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Publicar producto');
      const oldText=btn?.textContent;
      if(btn){btn.disabled=true;btn.textContent='Publicando…';}
      try{
        await original.apply(this,arguments);
      }finally{
        setTimeout(()=>{
          publishing=false;
          if(btn){btn.disabled=false;btn.textContent=oldText||'Publicar producto';}
        },1200);
      }
    };
    window.__productPublishGuard=true;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,0));else setTimeout(install,0);
})();
