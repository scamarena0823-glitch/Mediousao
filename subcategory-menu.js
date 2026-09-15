/* MEDIOUSAO - subcategorías administrables por categoría */
(function(){
  let selectedSubcategory='';
  const slugify=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  function msg(t,bad){if(typeof adminMessage==='function')adminMessage(t,bad);else alert(t);}
  async function rows(parent){const {data,error}=await client.from('subcategories').select('*').eq('category_slug',parent).order('sort_order',{ascending:true});if(error)throw error;return data||[];}
  async function active(parent){return (await rows(parent)).filter(x=>x.active!==false);}
  function categoryName(slug){return (window.appCategories||[]).find(x=>x.slug===slug)?.name||slug;}

  async function openCategoryMenu(slug){selectedCategory=slug;selectedSubcategory='';show('catalog');const bar=document.getElementById('categoryBar'),hint=document.getElementById('catalogHint');try{const list=await active(slug);if(!list.length){if(typeof render==='function')render();return;}if(bar)bar.innerHTML=`<button class="category-chip" onclick="window.backSubcategoryMenu()">← Categorías</button>`+list.map(x=>`<button class="category-chip" onclick="window.chooseSubcategory('${esc(x.slug)}')">${esc(x.name)}</button>`).join('');if(hint)hint.textContent=`Elige qué buscas en ${categoryName(slug)}.`;const grid=document.getElementById('grid');if(grid)grid.innerHTML='';}catch(e){console.error(e);if(typeof render==='function')render();}}
  window.backSubcategoryMenu=function(){selectedSubcategory='';selectedCategory='';if(typeof renderCategoryBar==='function')renderCategoryBar();if(typeof render==='function')render();};
  window.chooseSubcategory=function(slug){selectedSubcategory=slug;renderSubcategoryProducts();};
  function renderSubcategoryProducts(){const grid=document.getElementById('grid');if(!grid)return;const q=(document.getElementById('search')?.value||'').toLowerCase();const list=(products||[]).filter(p=>(!selectedCategory||p.category===selectedCategory)&&(!selectedSubcategory||p.subcategory===selectedSubcategory)&&(!q||JSON.stringify(p).toLowerCase().includes(q)));grid.innerHTML=list.map(p=>card(p)).join('')||'<div class="notice" style="grid-column:1/-1">No hay productos en esta opción todavía.</div>';}
  window.openMediousaoCategory=openCategoryMenu;
  function patchCategoryClicks(){if(window.__subcatCategoryPatch)return;document.addEventListener('click',e=>{const b=e.target.closest('#categoryBar button');if(!b)return;const txt=(b.textContent||'').trim();const c=(window.appCategories||[]).find(x=>txt.includes(x.name));if(c){e.preventDefault();e.stopImmediatePropagation();openCategoryMenu(c.slug);}},true);window.__subcatCategoryPatch=true;}

  async function loadAdmin(){const box=document.getElementById('adminSubcategories');if(!box)return;try{const {data,error}=await client.from('subcategories').select('*').order('category_slug').order('sort_order');if(error)throw error;box.innerHTML=(data||[]).map(x=>`<div class="admin-item"><b>${esc(x.name)}</b><div class="muted">${esc(categoryName(x.category_slug))}${x.active===false?' · Oculta':''}</div><div class="admin-actions"><button class="btn" onclick="editSubcategory('${x.id}','${esc(x.name)}')">Editar</button><button class="btn" onclick="toggleSubcategory('${x.id}',${x.active===false?'true':'false'})">${x.active===false?'Mostrar':'Ocultar'}</button><button class="btn danger" onclick="deleteSubcategory('${x.id}')">Eliminar</button></div></div>`).join('')||'<div class="notice">Aún no hay opciones.</div>';}catch(e){box.innerHTML='<div class="error">No se pudieron cargar las opciones.</div>';}}
  window.loadAdminSubcategories=loadAdmin;
  window.addSubcategory=async function(){const cat=document.getElementById('subcatCategory')?.value,name=document.getElementById('subcatName')?.value.trim();if(!cat||!name)return msg('Selecciona categoría y escribe el nombre.',true);try{const list=await rows(cat);const {error}=await client.from('subcategories').insert({category_slug:cat,name,slug:slugify(name),active:true,sort_order:list.length+1});if(error)throw error;document.getElementById('subcatName').value='';msg('Opción agregada. ✅');loadAdmin();window.refreshIntegratedCategory?.();}catch(e){console.error(e);msg('No se pudo agregar.',true);}};
  window.editSubcategory=async function(id,old){const name=prompt('Nuevo nombre',old);if(!name||name===old)return;const {error}=await client.from('subcategories').update({name,slug:slugify(name)}).eq('id',id);if(error)return msg('No se pudo editar.',true);loadAdmin();window.refreshIntegratedCategory?.();};
  window.toggleSubcategory=async function(id,val){const {error}=await client.from('subcategories').update({active:val}).eq('id',id);if(error)return msg('No se pudo cambiar.',true);loadAdmin();window.refreshIntegratedCategory?.();};
  window.deleteSubcategory=async function(id){if(!confirm('¿Eliminar esta opción del menú?'))return;const {error}=await client.from('subcategories').delete().eq('id',id);if(error)return msg('No se pudo eliminar.',true);loadAdmin();window.refreshIntegratedCategory?.();};
  function installAdmin(){const panel=document.getElementById('adminPanelCategories');if(!panel||document.getElementById('adminSubcategories'))return;const cats=(window.appCategories||[]).map(c=>`<option value="${esc(c.slug)}">${esc(c.name)}</option>`).join('');panel.insertAdjacentHTML('beforeend',`<div class="box" style="padding:16px;margin-top:14px"><h2>Opciones del menú</h2><p class="muted">Crea opciones dentro de Calzado, Ropa o Accesorios.</p><select id="subcatCategory" class="search" style="margin-bottom:8px">${cats}</select><input id="subcatName" placeholder="Ej. Tenis, Sandalias, Tacones" style="margin-bottom:8px"><button class="btn primary full" onclick="addSubcategory()">Agregar opción</button><div class="row" style="margin-top:14px"><h3>Opciones</h3><button class="btn" onclick="loadAdminSubcategories()">Actualizar</button></div><div id="adminSubcategories"></div></div>`);loadAdmin();}

  function installIntegratedProductCategory(){
    const hidden=document.getElementById('pCategory');if(!hidden)return;
    const oldType=document.getElementById('pSubcategory');if(oldType)oldType.style.display='none';
    async function rebuild(){
      const select=document.getElementById('productCategorySelect');if(!select)return;
      const categories=window.appCategories||[];const currentCat=hidden.value||'';const currentSub=select.dataset.subcategory||'';
      let html='<option value="">Categoría</option>';
      for(const c of categories){
        html+=`<option value="cat:${esc(c.slug)}">${esc(c.name)}</option>`;
        try{const list=await active(c.slug);list.forEach(x=>{html+=`<option value="sub:${esc(c.slug)}:${esc(x.slug)}">↳ ${esc(x.name)}</option>`;});}catch(e){}
      }
      select.innerHTML=html;
      if(currentCat&&currentSub&&[...select.options].some(o=>o.value===`sub:${currentCat}:${currentSub}`))select.value=`sub:${currentCat}:${currentSub}`;
      else if(currentCat&&[...select.options].some(o=>o.value===`cat:${currentCat}`))select.value=`cat:${currentCat}`;
    }
    if(!selectBound()){const select=document.getElementById('productCategorySelect');if(select){select.addEventListener('change',function(e){const v=e.target.value||'';if(v.startsWith('sub:')){const parts=v.split(':');hidden.value=parts[1];e.target.dataset.subcategory=parts.slice(2).join(':');}else if(v.startsWith('cat:')){hidden.value=v.slice(4);e.target.dataset.subcategory='';}const old=document.getElementById('pSubcategory');if(old)old.value=e.target.dataset.subcategory||'';document.getElementById('pCategories')?.querySelectorAll('.p-cat').forEach(x=>x.checked=x.dataset.slug===hidden.value);},true);select.dataset.integratedBound='1';}}
    window.refreshIntegratedCategory=rebuild;setTimeout(rebuild,200);setTimeout(rebuild,1000);
  }
  function selectBound(){return document.getElementById('productCategorySelect')?.dataset.integratedBound==='1';}
  function install(){patchCategoryClicks();installAdmin();installIntegratedProductCategory();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,1000));else setTimeout(install,1000);
  setTimeout(install,2200);
})();
