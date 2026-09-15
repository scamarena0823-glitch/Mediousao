/* MEDIOUSAO - una foto principal por pedido en ADM */
(function(){
 const cache=new Map();
 async function getImage(orderNumber){
  if(cache.has(orderNumber)) return cache.get(orderNumber);
  try{
   const o=await client.from('orders').select('id').eq('order_number',orderNumber).maybeSingle();
   if(!o.data){cache.set(orderNumber,'');return ''}
   const it=await client.from('order_items').select('product_id').eq('order_id',o.data.id).limit(1).maybeSingle();
   if(!it.data||!it.data.product_id){cache.set(orderNumber,'');return ''}
   const p=await client.from('products').select('image_url,images').eq('id',it.data.product_id).maybeSingle();
   const img=p.data&&(p.data.image_url||((p.data.images||[])[0]))||'';
   cache.set(orderNumber,img);return img;
  }catch(e){return ''}
 }
 function orderNumber(text){const m=String(text||'').match(/\b(?:MED|FNY)-\d+\b/i);return m&&m[0]}
 async function decorate(){
  if(!location.search.includes('admin=1'))return;
  const roots=[...document.querySelectorAll('.admin-item,.card')];
  for(const root of roots){
   if(root.dataset.medOrderImage==='1')continue;
   const num=orderNumber(root.textContent); if(!num)continue;
   root.dataset.medOrderImage='1';
   const img=await getImage(num); if(!img)continue;
   const pic=document.createElement('img');
   pic.src=img;pic.alt='Foto principal del producto';pic.className='mediousao-order-main-image';
   pic.style.cssText='width:72px;height:72px;object-fit:cover;border-radius:12px;display:block;margin:0 0 10px 0;border:1px solid #e4e4e7;background:#f2f3f5';
   const target=root.querySelector('b,strong,h3,h4')||root.firstElementChild;
   if(target) target.insertAdjacentElement('beforebegin',pic); else root.prepend(pic);
  }
 }
 const mo=new MutationObserver(()=>{clearTimeout(window.__medOrderImgT);window.__medOrderImgT=setTimeout(decorate,180)});
 function boot(){decorate();mo.observe(document.body,{childList:true,subtree:true});setInterval(decorate,2500)}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();