/* MEDIOUSAO - carrito estable + COMPRAR + límite por inventario */
(function(){
function cartArray(){try{if(Array.isArray(cart))return cart;}catch(e){}if(Array.isArray(window.cart))return window.cart;window.cart=[];return window.cart;}
function productById(id){try{return (products||[]).find(p=>String(p.id)===String(id));}catch(e){return (window.products||[]).find(p=>String(p.id)===String(id));}}
function maxStock(id){const p=productById(id);return Math.max(0,Number(p?.stock||0));}
function clampCart(){cartArray().forEach(x=>{const max=maxStock(x.id);x.qty=Math.max(1,Math.min(Number(x.qty||1),max||1));});}
function refreshCart(){clampCart();try{if(typeof renderCart==='function')renderCart();}catch(e){console.warn(e);}try{if(typeof updateCartCount==='function')updateCartCount();}catch(e){}const c=cartArray();const badge=document.getElementById('cartCount');if(badge)badge.textContent=c.reduce((s,x)=>s+Number(x.qty||1),0);setTimeout(lockQtyButtons,0);}
window.add=function(id){const p=productById(id);if(!p)return;const max=maxStock(id);if(max<1)return;const c=cartArray(),found=c.find(x=>String(x.id)===String(id));if(found){if(Number(found.qty||1)<max)found.qty=Number(found.qty||1)+1;}else c.push({id:p.id,qty:1});try{window.cart=c;}catch(e){}refreshCart();if(typeof show==='function')show('cart');};
function lockQtyButtons(){
 const c=cartArray();
 document.querySelectorAll('#cartContent button').forEach(b=>{
   const txt=(b.textContent||'').trim();if(txt!=='+')return;
   const row=b.closest('.box,.card,.admin-item')||b.parentElement?.parentElement; if(!row)return;
   const item=c.find(x=>{const p=productById(x.id);return p&&row.textContent.includes(p.name||'__');});if(!item)return;
   const max=maxStock(item.id);b.disabled=Number(item.qty||1)>=max;b.style.opacity=b.disabled?'.35':'1';
   if(max<=1)b.style.display='none';
 });
 document.querySelectorAll('#cartContent button').forEach(b=>{if((b.textContent||'').trim()==='-'){const row=b.closest('.box,.card,.admin-item')||b.parentElement?.parentElement;if(row){const plus=[...row.querySelectorAll('button')].find(x=>(x.textContent||'').trim()==='+');if(plus&&plus.style.display==='none')b.style.display='none';}}});
}
function interceptQty(){document.addEventListener('click',function(e){const b=e.target.closest?.('#cartContent button');if(!b)return;const txt=(b.textContent||'').trim();if(txt!=='+')return;setTimeout(()=>{clampCart();refreshCart();},0);},true);}
function relabel(){document.querySelectorAll('button').forEach(b=>{const t=(b.textContent||'').trim();if(t==='Agregar'||t==='Agregar al carrito')b.textContent='🛒 COMPRAR';});lockQtyButtons();}
function install(){clampCart();relabel();interceptQty();new MutationObserver(relabel).observe(document.body,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();