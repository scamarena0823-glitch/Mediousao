(function(){
  function errorBox(message){
    let box=document.getElementById('mediousaoCheckoutError');
    if(!box){
      box=document.createElement('div');
      box.id='mediousaoCheckoutError';
      box.className='error';
      box.style.margin='12px 0';
      const btn=[...document.querySelectorAll('button')].find(b=>/Confirmar pedido/i.test(b.textContent||''));
      (btn?.parentElement||document.getElementById('checkout')||document.body).insertBefore(box,btn||null);
    }
    box.textContent=message;
  }
  function clearError(){const b=document.getElementById('mediousaoCheckoutError');if(b)b.remove();}
  function paymentValue(){
    const v=document.getElementById('checkoutPaymentMethod')?.value||'cash';
    return v==='cash'?'cod':v;
  }
  async function fixedPlaceOrder(){
    clearError();
    if(!cart.length){errorBox('Tu carrito está vacío.');return;}
    const name=document.getElementById('name').value.trim();
    const phone=document.getElementById('phone').value.trim();
    const address=fulfillment==='delivery'?document.getElementById('address').value.trim():'Recoger en punto de entrega';
    if(!name||!phone||(fulfillment==='delivery'&&!address)){errorBox('Completa tus datos.');return;}
    const amounts=checkoutAmounts();
    const orderNumber='MED-'+Math.floor(100000+Math.random()*900000);
    const orderId=crypto.randomUUID();
    const payload={
      id:orderId,order_number:orderNumber,customer_name:name,customer_phone:phone,
      delivery_address:address,payment_method:paymentValue(),status:'confirmed',total:amounts.total,
      delivery_fee:amounts.fee,fulfillment_method:fulfillment,
      delivery_date:fulfillment==='delivery'?document.getElementById('deliveryDate').value:null,
      delivery_time:fulfillment==='delivery'?document.getElementById('deliveryTime').value:null
    };
    const first=await client.from('orders').insert(payload);
    if(first.error){
      console.error('MEDIOUSAO orders error',first.error);
      errorBox('No se pudo guardar el pedido: '+(first.error.message||'error de base de datos')+(first.error.code?' ('+first.error.code+')':''));
      return;
    }
    const rows=cart.map(x=>{const p=products.find(p=>p.id===x.id);return {order_id:orderId,product_id:p.id,product_name:p.name,quantity:x.qty,price:Number(p.price)}});
    const second=await client.from('order_items').insert(rows);
    if(second.error){
      console.error('MEDIOUSAO order_items error',second.error);
      errorBox('El pedido se creó, pero no se pudieron guardar sus productos: '+(second.error.message||'error de base de datos')+(second.error.code?' ('+second.error.code+')':''));
      return;
    }
    document.getElementById('orderNo').textContent=orderNumber;
    cart=[];saveCart();show('done');
    if(typeof loadProducts==='function')loadProducts();
  }
  window.placeOrder=fixedPlaceOrder;
})();
