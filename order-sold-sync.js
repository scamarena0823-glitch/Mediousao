/* MEDIOUSAO - Pedido confirmado -> Vendidos; cancelado -> Borradores */
(function(){
async function orderProductIds(orderId){
  const {data,error}=await client.from('order_items').select('product_id').eq('order_id',orderId);
  if(error)throw error;
  return [...new Set((data||[]).map(x=>x.product_id).filter(Boolean))];
}
async function archiveOrderProducts(orderId){
  const ids=await orderProductIds(orderId); if(!ids.length)return 0;
  const {error}=await client.from('products').update({sold:true,sold_at:new Date().toISOString(),active:false,available:false,is_reserved:false,reserved_until:null}).in('id',ids);
  if(error)throw error; return ids.length;
}
async function restoreOrderProducts(orderId){
  const ids=await orderProductIds(orderId); if(!ids.length)return 0;
  const {error}=await client.from('products').update({sold:false,sold_at:null,active:false,available:true,is_reserved:false,reserved_until:null}).in('id',ids);
  if(error)throw error; return ids.length;
}
async function syncOrder(id,status){
  if(status==='confirmed')return archiveOrderProducts(id);
  if(status==='cancelled')return restoreOrderProducts(id);
  return 0;
}
function installStatusSync(){
  if(window.__mediousaoOrderSoldSync||typeof window.updateOrderStatus!=='function')return;
  const original=window.updateOrderStatus;
  window.updateOrderStatus=async function(id,status,fulfillment){
    await original.apply(this,arguments);
    if(status!=='confirmed'&&status!=='cancelled')return;
    const msg=document.getElementById('adminMsg');
    try{
      const count=await syncOrder(id,status);
      if(msg&&status==='confirmed')msg.textContent=`Pedido confirmado. ${count} producto(s) movido(s) a Vendidos. ✅`;
      if(msg&&status==='cancelled')msg.textContent=`Pedido cancelado. ${count} producto(s) devuelto(s) a Borradores. ✅`;
      if(typeof loadAdminProducts==='function')await loadAdminProducts();
      if(typeof loadProducts==='function')await loadProducts();
    }catch(e){console.error(e);if(msg){msg.className='error';msg.textContent='El pedido cambió de estado, pero no se pudo sincronizar el producto.';}}
  };
  window.__mediousaoOrderSoldSync=true;
}
function installCheckoutSync(){
  if(window.__mediousaoCheckoutSoldSync||typeof window.placeOrder!=='function')return;
  const original=window.placeOrder;
  window.placeOrder=async function(){
    const before=new Set((window.products||products||[]).filter(Boolean).map(p=>p.id));
    const result=await original.apply(this,arguments);
    /* placeOrder crea el pedido y sus order_items; localizamos el pedido confirmado más reciente del teléfono usado. */
    try{
      const phone=(document.getElementById('phone')?.value||'').trim();
      if(phone){
        const {data}=await client.from('orders').select('id,status').eq('customer_phone',phone).eq('status','confirmed').order('created_at',{ascending:false}).limit(1);
        if(data&&data[0])await archiveOrderProducts(data[0].id);
      }
      if(typeof loadProducts==='function')await loadProducts();
    }catch(e){console.error('MEDIOUSAO checkout sold sync:',e);}
    return result;
  };
  window.__mediousaoCheckoutSoldSync=true;
}
function install(){installStatusSync();installCheckoutSync();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,1200));else setTimeout(install,1200);
})();