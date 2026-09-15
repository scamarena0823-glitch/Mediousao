/* MEDIOUSAO - Pedido entregado -> productos a Vendidos */
(function(){
async function archiveOrderProducts(orderId){
  const {data:items,error:itemError}=await client.from('order_items').select('product_id').eq('order_id',orderId);
  if(itemError)throw itemError;
  const ids=[...new Set((items||[]).map(x=>x.product_id).filter(Boolean))];
  if(!ids.length)return 0;
  const {error}=await client.from('products').update({sold:true,sold_at:new Date().toISOString(),active:false,available:false,is_reserved:false,reserved_until:null}).in('id',ids);
  if(error)throw error;
  return ids.length;
}
function install(){
  if(window.__mediousaoOrderSoldSync||typeof window.updateOrderStatus!=='function')return;
  const original=window.updateOrderStatus;
  window.updateOrderStatus=async function(id,status,fulfillment){
    if(status!=='delivered')return original.apply(this,arguments);
    if(status==='on_the_way'&&fulfillment!=='delivery')return original.apply(this,arguments);
    const {error}=await client.from('orders').update({status}).eq('id',id);
    const msg=document.getElementById('adminMsg');
    if(error){if(msg){msg.className='error';msg.textContent='No se pudo actualizar el pedido. Revisa los permisos.';}console.error(error);return;}
    try{
      const count=await archiveOrderProducts(id);
      if(msg){msg.className='notice';msg.textContent=count?`Pedido entregado. ${count} producto(s) movido(s) a Vendidos. ✅`:'Pedido entregado. No había productos para archivar. ✅';}
      if(typeof loadAdminProducts==='function')await loadAdminProducts();
      if(typeof loadProducts==='function')await loadProducts();
    }catch(e){
      console.error(e);
      if(msg){msg.className='error';msg.textContent='El pedido quedó Entregado, pero no se pudieron mover sus productos a Vendidos.';}
    }
    if(typeof loadAdminOrders==='function')await loadAdminOrders();
  };
  window.__mediousaoOrderSoldSync=true;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,1200));else setTimeout(install,1200);
})();