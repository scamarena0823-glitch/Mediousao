/* MEDIOUSAO - selector compacto de categorías para Productos */
(function(){
  function selectedLabels(list){
    return [...list.querySelectorAll('.p-cat:checked')].map(x=>{
      const row=x.closest('label,div');
      return (row?.textContent||'').replace(/\s+/g,' ').trim();
    }).filter(Boolean);
  }
  function update(btn,list){
    const names=selectedLabels(list);
    btn.textContent=names.length ? `Categoría: ${names.join(', ')}` : 'Seleccionar categoría';
  }
  function inject(){
    const list=document.getElementById('productCategoryChoices');
    if(!list||document.getElementById('productCategorySelectBtn'))return;
    const btn=document.createElement('button');
    btn.id='productCategorySelectBtn';
    btn.type='button';
    btn.className='btn full';
    btn.textContent='Seleccionar categoría';
    btn.style.marginBottom='8px';
    list.insertAdjacentElement('beforebegin',btn);
    list.style.display='none';
    btn.onclick=()=>{list.style.display=list.style.display==='none'?'block':'none';};
    list.addEventListener('change',()=>update(btn,list));
    new MutationObserver(()=>update(btn,list)).observe(list,{childList:true,subtree:true});
    update(btn,list);
  }
  function init(){inject();setTimeout(inject,500);setTimeout(inject,1500);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
