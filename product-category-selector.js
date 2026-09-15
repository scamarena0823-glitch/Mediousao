/* MEDIOUSAO - selector simple de categoría para Productos */
(function(){
  function cleanName(text){return (text||'').replace(/[\p{Extended_Pictographic}\uFE0F]/gu,'').replace(/\s+/g,' ').trim();}
  function notifyCategory(slug){const hidden=document.getElementById('pCategory');if(hidden)hidden.value=slug||'';document.dispatchEvent(new CustomEvent('mediousao:product-category',{detail:{slug:slug||''}}));if(typeof window.refreshProductSubcategories==='function')window.refreshProductSubcategories();}
  function build(){
    const box=document.getElementById('pCategories'),hidden=document.getElementById('pCategory');if(!box||!hidden)return;
    let select=document.getElementById('productCategorySelect');
    if(!select){const old=document.getElementById('productCategorySelectBtn');if(old)old.remove();select=document.createElement('select');select.id='productCategorySelect';select.className='search';select.style.marginBottom='8px';box.insertAdjacentElement('beforebegin',select);select.addEventListener('change',function(){if(this.dataset.integratedBound==='1')return;const slug=this.value;hidden.value=slug||'';box.querySelectorAll('.p-cat').forEach(x=>x.checked=x.dataset.slug===slug);notifyCategory(slug);});}
    if(select.dataset.integratedBound==='1'){box.style.setProperty('display','none','important');return;}
    const rows=[...box.querySelectorAll('.p-cat')];if(!rows.length)return;const wanted=select.value||hidden.value||'',seen=new Set(),options=['<option value="">Categoría</option>'];
    rows.forEach(x=>{const slug=x.dataset.slug||'';if(!slug||seen.has(slug))return;seen.add(slug);const row=x.closest('label')||x.parentElement;const name=cleanName(row?.textContent)||slug;options.push(`<option value="${String(slug).replace(/"/g,'&quot;')}">${name}</option>`);});
    select.innerHTML=options.join('');if(wanted&&seen.has(wanted)){select.value=wanted;hidden.value=wanted;rows.forEach(x=>x.checked=x.dataset.slug===wanted);}else{select.value='';hidden.value='';rows.forEach(x=>x.checked=false);}box.style.setProperty('display','none','important');
  }
  function init(){build();const box=document.getElementById('pCategories');if(box)new MutationObserver(()=>setTimeout(build,20)).observe(box,{childList:true,subtree:true});[300,800,1500,3000,5000].forEach(t=>setTimeout(build,t));}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
