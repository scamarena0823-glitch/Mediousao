/* MEDIOUSAO - Ver productos reales de un pedido en ADM */
(function(){
 const money=n=>'RD$'+Number(n||0).toLocaleString('es-DO');
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const orderNoFrom=el=>((el?.textContent||'').match(/\b(?:MED|FNY)-\d+\b/i)||[])[0]||'';
 function findOrderButton(target){const b=target.closest('button');if(!b||!/ver productos/i.test(b.textContent||''))return null;return b}
 function orderNoForButton(btn){let el=btn;for(let i=0;i<8&&el;i++,el=el.parentElement){const n=orderNoFrom(el);if(n)return n}return''}
 function close(){document.getElementById('mediousaoOrderProductsModal')?.remove()}
 function modal(title,body){close();const m=document.createElement('div');m.id='mediousaoOrderProductsModal';m.style.cssText='position:fixed;inset:0;z-index:10050;background:rgba(0,0,0,.45);display:flex;align-items:flex-end;justify-content:center;padding:12px';m.innerHTML='<div style="width:min(480px,100%);max-height:82vh;overflow:auto;background:#fff;border-radius:22px;padding:18px;box-shadow:0 10px 40px rgba(0,0,0,.2)"><div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:14px"><h2 style="margin:0">'+esc(title)+'</h2><button type="button" data-close-order-products style="border:0;border-radius:999px;width:42px;height:42px;font-size:22px;background:#f1f1f3">×</button></div><div id="mediousaoOrderProductsBody">'+body+'</div></div>';document.body.appendChild(m);m.querySelector('[data-close-order-products]').onclick=close;m.addEventListener('click',e=>{if(e.target===m)close()});return m}
 async function openProducts(orderNo){
  const m=modal('Productos · '+orderNo,'<div style="padding:18px 0;color:#777">Cargando productos…</div>');const body=m.querySelector('#mediousaoOrderProductsBody');
  try{
   const oq=await client.from('orders').select('id').eq('order_number',orderNo).maybeSingle();if(oq.error)throw oq.error;if(!oq.data?.id)throw new Error('Pedido no encontrado');
   const iq=await client.from('order_items').select('product_id,product_name,quantity,price').eq('order_id',oq.data.id);if(iq.error)throw iq.error;
   const items=iq.data||[];if(!items.length){body.innerHTML='<div style="padding:18px 0">No hay productos registrados en este pedido.</div>';return}
   const ids=[...new Set(items.map(x=>x.product_id).filter(Boolean))];let products={};
   if(ids.length){const pq=await client.from('products').select('id,name,image_url,images').in('id',ids);if(!pq.error)(pq.data||[]).forEach(p=>products[p.id]=p)}
   body.innerHTML=items.map((x,i)=>{const p=products[x.product_id]||{},imgs=Array.isArray(p.images)?p.images:[],src=imgs[0]||p.image_url||'',name=x.product_name||p.name||'Producto',qty=Math.max(1,Number(x.quantity||1)),price=Number(x.price||0);return '<div style="display:grid;grid-template-columns:76px 1fr;gap:13px;padding:13px 0;border-bottom:'+(i===items.length-1?'0':'1px solid #eee')+'">'+(src?'<img src="'+esc(src)+'" alt="" style="width:76px;height:76px;object-fit:cover;border-radius:12px;border:1px solid #ddd;background:#f4f4f5">':'<div style="width:76px;height:76px;border-radius:12px;background:#f4f4f5;display:flex;align-items:center;justify-content:center;font-size:30px">📦</div>')+'<div><div style="font-weight:800;font-size:17px">'+esc(name)+'</div><div style="margin-top:7px;color:#666">Cantidad: <b>'+qty+'</b></div><div style="margin-top:5px">Precio: <b>'+money(price)+'</b></div><div style="margin-top:5px">Subtotal: <b>'+money(price*qty)+'</b></div></div></div>'}).join('');
  }catch(e){body.innerHTML='<div style="padding:14px;border-radius:12px;background:#fff0f0;color:#a00000">No se pudieron cargar los productos del pedido.</div>'}
 }
 document.addEventListener('click',e=>{const b=findOrderButton(e.target);if(!b)return;const n=orderNoForButton(b);if(!n)return;e.preventDefault();e.stopImmediatePropagation();openProducts(n)},true);
})();