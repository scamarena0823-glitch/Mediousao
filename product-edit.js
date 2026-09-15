/* MEDIOUSAO - edición completa de productos publicados */
(function(){
 const NO_NAME='__MEDIOUSAO_SIN_NOMBRE__';
 const val=(v,d='')=>v==null?d:String(v);
 async function edit(id){
  const {data:p,error}=await client.from('products').select('id,name,category,subcategory,size,condition,price,stock,item_type,audience,image_url,images').eq('id',id).single();
  if(error||!p)return adminMessage('No se pudo cargar el producto.',true);
  let name=prompt('Nombre (puede quedar vacío):',p.name===NO_NAME?'':val(p.name));if(name===null)return;
  let state=prompt('Estado: new = Nuevo, used = Usado',val(p.item_type,'used'));if(state===null)return;state=state.trim().toLowerCase();if(!['new','used'].includes(state))return adminMessage('Estado no válido. Usa new o used.',true);
  let audience=prompt('Público: public, men, women, kids o unisex',val(p.audience,'public'));if(audience===null)return;audience=audience.trim().toLowerCase();if(!['public','men','women','kids','unisex'].includes(audience))return adminMessage('Público no válido.',true);
  let size=prompt('Talla:',val(p.size));if(size===null)return;if(!size.trim())return adminMessage('La talla no puede quedar vacía.',true);
  let description=prompt('Descripción:',val(p.condition));if(description===null)return;if(!description.trim())return adminMessage('La descripción no puede quedar vacía.',true);
  let price=prompt('Precio RD$:',val(p.price));if(price===null)return;price=Number(price);if(!price||price<0)return adminMessage('Precio no válido.',true);
  let stock=prompt('Cantidad:',val(p.stock,1));if(stock===null)return;stock=Number(stock);if(!Number.isFinite(stock)||stock<0)return adminMessage('Cantidad no válida.',true);
  const payload={name:name.trim()||NO_NAME,item_type:state,audience,size:size.trim(),condition:description.trim(),price,stock};
  const {error:u}=await client.from('products').update(payload).eq('id',id);if(u)return adminMessage('No se pudo actualizar: '+(u.message||'error de base de datos'),true);
  adminMessage('Producto actualizado correctamente. ✅');await loadAdminProducts();await loadProducts();
 }
 window.editProductAdminFull=edit;
 function decorate(){
  const box=document.getElementById('adminProducts');if(!box)return;
  const rows=[...box.querySelectorAll('.admin-item')];if(!rows.length)return;
  client.from('products').select('id').order('created_at',{ascending:false}).then(({data})=>{rows.forEach((row,i)=>{if(!data?.[i]||row.querySelector('.product-edit-full'))return;const actions=row.querySelector('.admin-actions');if(!actions)return;const b=document.createElement('button');b.type='button';b.className='btn product-edit-full';b.textContent='Editar producto';b.onclick=()=>edit(data[i].id);actions.insertBefore(b,actions.firstChild);});});
 }
 function init(){decorate();const box=document.getElementById('adminProducts');if(box&&!window.__mediousaoProductEditObserver){new MutationObserver(()=>setTimeout(decorate,80)).observe(box,{childList:true,subtree:true});window.__mediousaoProductEditObserver=true;}setTimeout(decorate,800);}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();