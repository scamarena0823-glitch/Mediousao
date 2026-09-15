/* MEDIOUSAO - foto principal única por pedido */
(function(){
 const cache=new Map();
 function isAdmin(){return location.search.includes('admin=1')}
 function num(t){const m=String(t||'').match(/\b(?:MED|FNY)-\d+\b/i);return m&&m[0]}
 async function imageFor(n){
  if(cache.has(n))return cache.get(n);
  try{
   const q=await client.from('orders').select('id').eq('order_number',n).maybeSingle();
   if(!q.data)return '';
   const items=await client.from('order_items').select('product_id').eq('order_id',q.data.id).limit(1);
   const pid=items.data&&items.data[0]&&items.data[0].product_id;if(!pid)return '';
   const p=await client.from('products').select('image_url,images').eq('id',pid).maybeSingle();
   const d=p.data||{},src=(Array.isArray(d.images)&&d.images[0])||d.image_url||'';
   cache.set(n,src);return src;
  }catch(e){return ''}
 }
 function fixTitle(){
  [...document.querySelectorAll('h1,h2,h3')].forEach(h=>{
   if((h.textContent||'').replace(/\s+/g,' ').trim()==='Pedidos / Reservas')h.textContent='Pedidos';
  });
 }
 function orderBlocks(){
  const all=[...document.querySelectorAll('div')].filter(e=>num(e.textContent));
  return all.filter(e=>{
   const n=num(e.textContent); if(!n)return false;
   return ![...e.children].some(c=>num(c.textContent)===n);
  });
 }
 async function decorate(){
  if(!isAdmin())return;fixTitle();
  for(const block of orderBlocks()){
   if(block.querySelector(':scope > .mediousao-order-main-image'))continue;
   const n=num(block.textContent),src=await imageFor(n);if(!src)continue;
   const pic=document.createElement('img');pic.className='mediousao-order-main-image';pic.src=src;pic.alt='Producto';
   pic.style.cssText='width:78px;height:78px;object-fit:cover;border-radius:12px;display:block;margin:0 0 12px;border:1px solid #ddd;background:#f3f3f4';
   block.prepend(pic);
  }
 }
 const mo=new MutationObserver(()=>{clearTimeout(window.__medOrderImg2);window.__medOrderImg2=setTimeout(decorate,200)});
 function boot(){decorate();mo.observe(document.body,{childList:true,subtree:true});setInterval(decorate,2000)}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();