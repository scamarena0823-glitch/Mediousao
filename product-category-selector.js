/* MEDIOUSAO - selector compacto de categorías para Productos */
(function(){
  let open=false;
  function selectedNames(box){
    return [...box.querySelectorAll('.p-cat:checked')].map(x=>{
      const row=x.closest('label')||x.parentElement;
      return (row?.textContent||'').replace(/\s+/g,' ').trim();
    }).filter(Boolean);
  }
  function update(){
    const box=document.getElementById('pCategories');
    const btn=document.getElementById('productCategorySelectBtn');
    if(!box||!btn)return;
    const names=selectedNames(box);
    btn.textContent=names.length ? `Categoría: ${names.join(', ')}` : 'Seleccionar categoría';
  }
  function applyVisibility(){
    const box=document.getElementById('pCategories');
    if(!box)return;
    box.style.setProperty('display',open?'block':'none','important');
  }
  function inject(){
    const box=document.getElementById('pCategories');
    if(!box)return;
    let btn=document.getElementById('productCategorySelectBtn');
    if(!btn){
      btn=document.createElement('button');
      btn.id='productCategorySelectBtn';
      btn.type='button';
      btn.className='btn full';
      btn.style.marginBottom='8px';
      box.insertAdjacentElement('beforebegin',btn);
      btn.onclick=function(){open=!open;applyVisibility();update();};
      box.addEventListener('change',function(){update();});
      new MutationObserver(function(){applyVisibility();update();}).observe(box,{childList:true,subtree:true});
    }
    applyVisibility();
    update();
  }
  function init(){inject();setTimeout(inject,300);setTimeout(inject,1000);setTimeout(inject,2000);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
