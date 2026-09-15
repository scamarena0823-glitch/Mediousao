/* MEDIOUSAO - cancelación del cliente solo mientras el pedido está Confirmado */
(function(){
const KEY='mediousao_last_order';
function saveLastOrder(id,number,phone){try{localStorage.setItem(KEY,JSON.stringify({id,number,phone}));}catch(e){}}
function getLastOrder(){try{return JSON.parse(localStorage.getItem(KEY)||'null');}catch(e){return null;}}
async function restoreProducts(orderId){
 const {data:items,error:e1}=await client.from('order_items').select('product_id').eq('order_id',orderId);if(e1)throw e1;
 const ids=[...new Set((items||[]).map(x=>x.product_id).filter(Boolean))];if(!ids.length)return;
 const {error}=await client.from('products').update({sold:false,sold_at:null,active:false,available:true,is_reserved:false,reserved_until:null}).in('id',ids);if(error)throw error;
}
async function cancelCustomerOrder(){
 const last=getLastOrder();const box=document.getElementById('customerOrderCancelBox');if(!last||!box)return;
 const btn=box.querySelector('button');if(btn){btn.disabled=true;btn.textContent='Cancelando…';}
 const {data:order,error}=await client.from('orders').select('id,status').eq('id',last.id).maybeSingle();
 if(error||!order){box.innerHTML='<div class="error">No se pudo verificar el pedido.</div>';return;}
 if(order.status!=='confirmed'){box.innerHTML='<div class="notice">Este pedido ya está en preparación o avanzó de estado y ya no puede cancelarse.</div>';return;}
 const {data:updated,error:updateError}=await client.from('orders').update({status:'cancelled'}).eq('id',last.id).eq('status','confirmed').select('id,status');
 if(updateError||!updated||!updated.length){box.innerHTML='<div class="notice">El pedido ya avanzó de estado y no puede cancelarse.</div>';return;}
 try{await restoreProducts(last.id);}catch(e){console.error(e);box.innerHTML='<div class="error">El pedido fue cancelado, pero necesitamos revisar la devolución del producto.</div>';return;}
 box.innerHTML='<div class="notice">Pedido cancelado correctamente. ✅</div>';
 try{localStorage.removeItem(KEY);}catch(e){}
 if(typeof loadProducts==='function')await loadProducts();
}
window.cancelCustomerOrder=cancelCustomerOrder;
function renderCancel(){
 const done=document.getElementById('done');if(!done)return;
 let box=document.getElementById('customerOrderCancelBox');if(!box){box=document.createElement('div');box.id='customerOrderCancelBox';box.className='box';box.style.cssText='padding:15px;margin-top:14px';done.appendChild(box);}
 const last=getLastOrder();if(!last){box.style.display='none';return;}box.style.display='block';
 box.innerHTML='<b>¿Necesitas cancelar?</b><p class="muted">Puedes cancelar mientras el pedido esté en Confirmado. Cuando pase a Preparando, la cancelación se bloqueará.</p><button class="btn danger full" onclick="cancelCustomerOrder()">Cancelar pedido</button>';
}
function install(){
 if(window.__mediousaoCustomerCancel)return;
 if(typeof window.placeOrder==='function'){
   const original=window.placeOrder;
   window.placeOrder=async function(){
     const phone=(document.getElementById('phone')?.value||'').trim();
     const result=await original.apply(this,arguments);
     try{
       if(phone){const {data}=await client.from('orders').select('id,order_number,status').eq('customer_phone',phone).eq('status','confirmed').order('created_at',{ascending:false}).limit(1);if(data&&data[0])saveLastOrder(data[0].id,data[0].order_number,phone);}
     }catch(e){console.error(e);}
     renderCancel();return result;
   };
 }
 const oldShow=window.show;if(typeof oldShow==='function')window.show=function(name){const r=oldShow.apply(this,arguments);if(name==='done')setTimeout(renderCancel,100);return r;};
 renderCancel();window.__mediousaoCustomerCancel=true;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,1600));else setTimeout(install,1600);
})();