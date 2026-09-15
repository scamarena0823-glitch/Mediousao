/* MEDIOUSAO - subcategorías administrables por categoría */
(function(){
  let selectedSubcategory='';
  const slugify=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  function msg(t,bad){if(typeof adminMessage==='function')adminMessage(t,bad);else alert(t);}
  async function rows(parent){const {data,error}=await client.from('subcategories').select('*').eq('category_slug',parent).order('sort_order',{ascending:true});if(error)throw error;return data||[];}
  async function active(parent){return (await rows(parent)).filter(x=>x.active!==false);}
  function categoryName(slug){return (window.appCategories||[]).find(x=>x.slug===slug)?.name||slug;}
  async function openCategoryMenu(slug){selectedCategory=slug;selectedSubcategory='';show('catalog');const bar=document.getElementById('categoryBar'),hint=document.getElementById('catalogHint');try{const list=await active(slug);if(!list.length){if(typeof render==='function')render();return;}if(bar)bar.innerHTML=`<button class="category-chip" onclick="window.backSubcategoryMenu()">← Categorías</button>`+list.map(x=>`<button class="category-chip" onclick="window.chooseSubcategory('${esc(x.slug)}')">${esc(x.name)}</button>`).join('');if(hint)hint.textContent=`Elige qué buscas en ${categoryName(slug)}.`;const grid=document.getElementById('grid');if(grid)grid.innerHTML='';}catch(e){console.error(e);if(typeof render==='function')render();}}
  window.backSubcategoryMenu=function(){selectedSubcategory='';selectedCategory='';if(typeof renderCategoryBar==='function')renderCategoryBar();if(typeof render==='function')render();};window.chooseSubcategory=function(slug){selectedSubcategory=slug;renderSubcategoryProducts();};
  function renderSubcategoryProducts(){const grid=document.getElementById('grid');if(!grid)return;const q=(document.getElementById('search')?.value||'').toLowerCase();const list=(products||[]).filter(p=>(!selectedCategory||p.category===selectedCategory)&&(!selectedSubcategory||p.subcategory===selectedSubcategory)&&(!q||JSON.stringify(p).toLowerCase().includes(q)));grid.innerHTML=list.map(p=>card(p)).join('')||'<div class="notice" style="grid-column:1/-1">No hay productos en esta opción todavía.</div>';}
  window.openMediousaoCategory=openCategoryMenu;
  function patchCategoryClicks(){if(window.__subcatCategoryPatch)return;document.addEventListener('click',e=>{const b=e.target.closest('#categoryBar button');if(!b)return;const txt=(b.textContent||'').trim();const c=(window.appCategories||[]).find(x=>txt.includes(x.name));if(c){e.preventDefault();e.stopImmediatePropagation();openCategoryMenu(c.slug);}},true);window.__subcatCategoryPatch=true;}
  async function loadAdmin(){const box=document.getElementById('adminSubcategories');if(!box)return;try{const {data,error}=await client.from('subcategories').select('*').order('category_slug').order('sort_order');if(error)throw error;box.innerHTML=(data||[]).map(x=>`<div class="admin-item"><b>${esc(x.name)}</b><div class="muted">${esc(categoryName(x.category_slug))}${x.active===false?' · Oculta':''}</div><div class="admin-actions"><button class="btn" onclick="editSubcategory('${x.id}','${esc(x.name)}')">Editar</button><button class="btn" onclick="toggleSubcategory('${x.id}',${x.active===false?'true':'false'})">${x.active===false?'Mostrar':'Ocultar'}</button><button class="btn danger" onclick="deleteSubcategory('${x.id}')">Eliminar</button></div></div>`).join('')||'<div class="notice">Aún no hay opciones.</div>';}catch(e){box.innerHTML='<div class="error">No se pudieron cargar las opciones.</div>';}}
  window.loadAdminSubcategories=loadAdmin;window.addSubcategory=async function(){const cat=document.getElementById('subcatCategory')?.value,name=document.getElementById('subcatName')?.value.trim();if(!cat||!name)return msg('Selecciona categoría y escribe el nombre.',true);try{const list=await rows(cat);const {error}=await client.from('subcategories').insert({category_slug:cat,name,slug:slugify(name),active:true,sort_order:list.length+1});if(error)throw error;document.getElementById('subcatName').value='';msg('Opción agregada. ✅');loadAdmin();}catch(e){msg('No se pudo agregar.',true);}};
  window.editSubcategory=async function(id,old){const name=prompt('Nuevo nombre',old);if(!name||name===old)return;const {error}=await client.from('subcategories').update({name,slug:slugify(name)}).eq('id',id);if(error)return msg('No se pudo editar.',true);loadAdmin();};window.toggleSubcategory=async function(id,val){const {error}=await client.from('subcategories').update({active:val}).eq('id',id);if(error)return msg('No se pudo cambiar.',true);loadAdmin();};window.deleteSubcategory=async function(id){if(!confirm('¿Eliminar esta opción del menú?'))return;const {error}=await client.from('subcategories').delete().eq('id',id);if(error)return msg('No se pudo eliminar.',true);loadAdmin();};
  function installAdmin(){const panel=document.getElementById('adminPanelCategories');if(!panel||document.getElementById('adminSubcategories'))return;const cats=(window.appCategories||[]).map(c=>`<option value="${esc(c.slug)}">${esc(c.name)}</option>`).join('');panel.insertAdjacentHTML('beforeend',`<div class="box" style="padding:16px;margin-top:14px"><h2>Opciones del menú</h2><p class="muted">Crea opciones dentro de Calzado, Ropa o Accesorios.</p><select id="subcatCategory" class="search" style="margin-bottom:8px">${cats}</select><input id="subcatName" placeholder="Ej. Tenis, Sandalias, Tacones" style="margin-bottom:8px"><button class="btn primary full" onclick="addSubcategory()">Agregar opción</button><div class="row" style="margin-top:14px"><h3>Opciones</h3><button class="btn" onclick="loadAdminSubcategories()">Actualizar</button></div><div id="adminSubcategories"></div></div>`);loadAdmin();}

  function installDrilldownProductCategory(){
    const hidden=document.getElementById('pCategory'),select=document.getElementById('productCategorySelect');if(!hidden||!select)return;
    if(document.getElementById('mediousaoCategoryButton')){select.style.display='none';return;}
    const oldType=document.getElementById('pSubcategory');if(oldType)oldType.style.display='none';
    select.dataset.integratedBound='1';select.style.display='none';
    const btn=document.createElement('button');btn.type='button';btn.id='mediousaoCategoryButton';btn.className='search';btn.textContent='Categoría';btn.style.cssText='width:100%;text-align:left;margin-bottom:8px;background:#fff;color:inherit;cursor:pointer;';select.insertAdjacentElement('afterend',btn);
    const overlay=document.createElement('div');overlay.id='mediousaoCategoryOverlay';overlay.style.cssText='display:none;position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.28);align-items:center;justify-content:center;padding:22px;';
    const menu=document.createElement('div');menu.style.cssText='width:min(360px,100%);max-height:70vh;overflow:auto;background:#fff;border-radius:14px;box-shadow:0 14px 40px rgba(0,0,0,.25);padding:6px;color:#111;';overlay.appendChild(menu);document.body.appendChild(overlay);
    const cats=()=>window.appCategories||[];
    function item(label,fn,muted){const b=document.createElement('button');b.type='button';b.textContent=label;b.style.cssText='display:block;width:100%;border:0;border-bottom:1px solid #e5e5e5;background:#fff;padding:15px 14px;text-align:left;font:inherit;color:'+(muted?'#666':'#111')+';';b.onclick=fn;return b;}
    function close(){overlay.style.display='none';}
    function showMain(){menu.innerHTML='';cats().forEach(c=>menu.appendChild(item(c.name,()=>chooseCategory(c))));menu.appendChild(item('Cancelar',close,true));overlay.style.display='flex';}
    async function chooseCategory(c){
      hidden.value=c.slug;btn.dataset.category=c.slug;btn.dataset.subcategory='';document.getElementById('pCategories')?.querySelectorAll('.p-cat').forEach(x=>x.checked=x.dataset.slug===c.slug);
      try{
        const list=await active(c.slug);
        if(!list.length){btn.textContent=c.name;close();return;}
        menu.innerHTML='';
        list.forEach(x=>menu.appendChild(item(x.name,()=>{btn.textContent=x.name;btn.dataset.subcategory=x.slug;select.dataset.subcategory=x.slug;const old=document.getElementById('pSubcategory');if(old)old.value=x.slug;close();})));
        menu.appendChild(item('← Volver',showMain,true));
      }catch(e){btn.textContent=c.name;close();}
    }
    btn.onclick=showMain;overlay.addEventListener('click',e=>{if(e.target===overlay)close();});
    window.refreshIntegratedCategory=function(){btn.textContent='Categoría';btn.dataset.category='';btn.dataset.subcategory='';select.dataset.subcategory='';};
  }
  function install(){patchCategoryClicks();installAdmin();installDrilldownProductCategory();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,1200));else setTimeout(install,1200);setTimeout(install,2400);
})();
