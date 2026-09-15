/* MEDIOUSAO - selector desplegable de categorías para Productos */
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
    btn.innerHTML=`<span>${names.length ? names.join(', ') : 'Seleccionar categoría'}</span><span style="font-size:22px">⌄</span>`;
  }
  function styleMenu(){
    const box=document.getElementById('pCategories');
    if(!box)return;
    box.classList.remove('notice');
    box.style.background='#fff';
    box.style.border='1px solid #ddd';
    box.style.borderRadius='18px';
    box.style.padding='10px 14px';
    box.style.margin='-2px 0 8px';
    box.style.boxShadow='0 8px 22px rgba(0,0,0,.08)';
    box.querySelectorAll('label').forEach(label=>{
      label.style.display='flex';
      label.style.alignItems='center';
      label.style.gap='10px';
      label.style.padding='10px 4px';
      label.style.fontSize='18px';
      label.style.borderBottom='0';
      const check=label.querySelector('.p-cat');
      if(check){check.style.width='22px';check.style.height='22px';}
    });
  }
  function applyVisibility(){
    const box=document.getElementById('pCategories');
    if(!box)return;
    box.style.setProperty('display',open?'block':'none','important');
    if(open)styleMenu();
  }
  function inject(){
    const box=document.getElementById('pCategories');
    if(!box)return;
    let btn=document.getElementById('productCategorySelectBtn');
    if(!btn){
      btn=document.createElement('button');
      btn.id='productCategorySelectBtn';
      btn.type='button';
      btn.className='search';
      btn.style.width='100%';
      btn.style.marginBottom='8px';
      btn.style.display='flex';
      btn.style.alignItems='center';
      btn.style.justifyContent='space-between';
      btn.style.textAlign='left';
      btn.style.fontWeight='600';
      btn.style.cursor='pointer';
      box.insertAdjacentElement('beforebegin',btn);
      btn.onclick=function(){open=!open;applyVisibility();update();};
      box.addEventListener('change',function(){update();});
      new MutationObserver(function(){applyVisibility();update();}).observe(box,{childList:true,subtree:true});
    }
    applyVisibility();update();
  }
  function init(){inject();setTimeout(inject,300);setTimeout(inject,1000);setTimeout(inject,2000);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
