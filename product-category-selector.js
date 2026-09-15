/* MEDIOUSAO - selector simple de categoría para Productos */
(function(){
  function cleanName(text){
    return (text||'').replace(/[\p{Extended_Pictographic}\uFE0F]/gu,'').replace(/\s+/g,' ').trim();
  }
  function build(){
    const box=document.getElementById('pCategories');
    const hidden=document.getElementById('pCategory');
    if(!box||!hidden)return;
    let select=document.getElementById('productCategorySelect');
    if(!select){
      const old=document.getElementById('productCategorySelectBtn');if(old)old.remove();
      select=document.createElement('select');
      select.id='productCategorySelect';
      select.className='search';
      select.style.marginBottom='8px';
      select.innerHTML='<option value="">Categoría</option>';
      box.insertAdjacentElement('beforebegin',select);
      select.addEventListener('change',function(){
        const slug=this.value;
        hidden.value=slug||'';
        box.querySelectorAll('.p-cat').forEach(x=>{x.checked=(x.dataset.slug===slug||x.value===slug);});
      });
    }
    const current=select.value;
    const rows=[...box.querySelectorAll('.p-cat')];
    const seen=new Set();
    const options=['<option value="">Categoría</option>'];
    rows.forEach(x=>{
      const slug=x.dataset.slug||x.value||'';
      if(!slug||seen.has(slug))return;
      seen.add(slug);
      const row=x.closest('label')||x.parentElement;
      const name=cleanName(row?.textContent)||slug;
      options.push(`<option value="${String(slug).replace(/"/g,'&quot;')}">${name}</option>`);
    });
    select.innerHTML=options.join('');
    if(current&&seen.has(current))select.value=current;
    else if(hidden.value&&seen.has(hidden.value))select.value=hidden.value;
    box.style.setProperty('display','none','important');
  }
  function init(){
    build();
    const box=document.getElementById('pCategories');
    if(box)new MutationObserver(()=>setTimeout(build,0)).observe(box,{childList:true,subtree:true});
    setTimeout(build,300);setTimeout(build,800);setTimeout(build,1500);setTimeout(build,3000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
