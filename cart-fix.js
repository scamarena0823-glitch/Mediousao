/* MEDIOUSAO - carrito estable + botón COMPRAR */
(function(){
function cartArray(){
  try{if(Array.isArray(cart))return cart;}catch(e){}
  if(Array.isArray(window.cart))return window.cart;
  window.cart=[];return window.cart;
}
function productById(id){
  try{return (products||[]).find(p=>String(p.id)===String(id));}catch(e){return (window.products||[]).find(p=>String(p.id)===String(id));}
}
function refreshCart(){
  try{if(typeof renderCart==='function')renderCart();}catch(e){console.warn(e);}
  try{if(typeof updateCartCount==='function')updateCartCount();}catch(e){}
  const c=cartArray();
  const badge=document.getElementById('cartCount');if(badge){const n=c.reduce((s,x)=>s+Number(x.qty||1),0);badge.textContent=n;}
}
window.add=function(id){
  const p=productById(id);if(!p)return;
  const c=cartArray();const found=c.find(x=>String(x.id)===String(id));
  if(found)found.qty=Number(found.qty||1)+1;else c.push({id:p.id,qty:1});
  try{window.cart=c;}catch(e){}
  refreshCart();
  if(typeof show==='function')show('cart');
};
function relabel(){
  document.querySelectorAll('button').forEach(b=>{
    const t=(b.textContent||'').trim();
    if(t==='Agregar'||t==='Agregar al carrito')b.textContent='🛒 COMPRAR';
  });
}
function install(){relabel();new MutationObserver(relabel).observe(document.body,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();