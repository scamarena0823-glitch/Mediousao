(function(){
  function errorBox(message){
    let box=document.getElementById('mediousaoCheckoutError');
    if(!box){
      box=document.createElement('div');box.id='mediousaoCheckoutError';box.className='error';box.style.margin='12px 0';
      const btn=[...document.querySelectorAll('button')].find(b=>/Confirmar pedido/i.test(b.textContent||''));
      (btn?.parentElement||document.getElementById('checkout')||document.body).insertBefore(box,btn||null);
    } box.textContent=message;
  }
  function clearError(){document.getElementById('mediousaoCheckoutError')?.remove()}
  function paymentValue(){const v=document.getElementById('checkoutPaymentMethod')?.value||'cash';return v==='cash'?'cod':v}
  function rememberOrder(order){
    try{
      let list=JSON.parse(localStorage.getItem('mediousao_customer_orders')||'[]');
      list=list.filter(x=>x&&x.id!==order.id);list.unshift(order);list=list.slice(0,50);
      localStorage.setItem('mediousao_customer_orders',JSON.stringify(list));
      localStorage.setItem('mediousao_customer_name',order.name||'');
      localStorage.setItem('mediousao_customer_phone',order.phone||'');
    }catch(e){console.warn('No se pudo recordar el pedido',e)}
  }
  async function fixedPlaceOrder(){
    clearError();
    if(!Array.isArray(cart)||!cart.length){errorBox('Tu carrito está vacío.');return}
    const name=document.getElementById('name')?.value.trim()||'',phone=document.getElementById('phone')?.value.trim()||'';
    const address=fulfillment==='delivery'?(document.getElementById('address')?.value.trim()||''):'Recoger en punto de entrega';
    if(!name||!phone||(fulfillment==='delivery'&&!address)){errorBox('Completa tus datos.');return}

    /* Construir y validar los artículos ANTES de crear el pedido. */
    const rows=[];
    for(const x of cart){
      const p=(products||[]).find(p=>String(p.id)===String(x.id));
      const qty=Math.max(1,Number(x.qty||1));
      if(!p?.id){errorBox('Uno de los productos del carrito ya no está disponible. Actualiza el carrito e inténtalo de nuevo.');return}
      rows.push({product_id:p.id,product_name:p.name||'Producto',quantity:qty,price:Number(p.price||0)});
    }
    if(!rows.length){errorBox('No se pudieron preparar los productos del pedido.');return}

    const amounts=checkoutAmounts(),orderNumber='MED-'+Math.floor(100000+Math.random()*900000),orderId=crypto.randomUUID(),accessToken=crypto.randomUUID();
    const payload={id:orderId,order_number:orderNumber,customer_name:name,customer_phone:phone,customer_access_token:accessToken,delivery_address:address,payment_method:paymentValue(),status:'confirmed',total:amounts.total,delivery_fee:amounts.fee,fulfillment_method:fulfillment,delivery_date:fulfillment==='delivery'?document.getElementById('deliveryDate')?.value||null:null,delivery_time:fulfillment==='delivery'?document.getElementById('deliveryTime')?.value||null:null};

    const first=await client.from('orders').insert(payload);
    if(first.error){console.error('MEDIOUSAO orders error',first.error);errorBox('No se pudo guardar el pedido: '+(first.error.message||'error de base de datos')+(first.error.code?' ('+first.error.code+')':''));return}

    rows.forEach(r=>r.order_id=orderId);
    const second=await client.from('order_items').insert(rows);
    if(second.error){
      console.error('MEDIOUSAO order_items error',second.error);
      /* No dejar un pedido administrativo sin artículos si falla el detalle. */
      const cleanup=await client.from('orders').delete().eq('id',orderId).eq('customer_access_token',accessToken);
      if(cleanup.error)console.error('MEDIOUSAO cleanup incomplete order',cleanup.error);
      errorBox('No se pudo completar el pedido porque sus productos no pudieron guardarse. Inténtalo nuevamente.');
      return;
    }

    rememberOrder({id:orderId,number:orderNumber,token:accessToken,name,phone,createdAt:new Date().toISOString()});
    if(typeof window.mediousaoProfileRefresh==='function')window.mediousaoProfileRefresh();
    document.getElementById('orderNo').textContent=orderNumber;cart=[];saveCart();show('done');if(typeof loadProducts==='function')loadProducts();
  }
  window.placeOrder=fixedPlaceOrder;
})();
