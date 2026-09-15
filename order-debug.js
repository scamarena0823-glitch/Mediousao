/* MEDIOUSAO - diagnóstico temporal de errores al confirmar pedidos */
(function(){
function install(){
 if(window.__mediousaoOrderDebug||!window.client||typeof client.from!=='function')return;
 const originalFrom=client.from.bind(client);
 client.from=function(table){
   const builder=originalFrom(table);
   if(table!=='orders'&&table!=='order_items')return builder;
   const originalInsert=builder.insert?.bind(builder);
   if(originalInsert){builder.insert=function(){
     const result=originalInsert.apply(this,arguments);
     if(result&&typeof result.then==='function')return result.then(r=>{if(r?.error){const e=r.error;setTimeout(()=>alert('Error real de Supabase ('+table+'):\n'+(e.message||'')+'\nCódigo: '+(e.code||'')+'\n'+(e.details||'')+'\n'+(e.hint||'')),50);}return r;});
     return result;
   };}
   return builder;
 };
 window.__mediousaoOrderDebug=true;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,900));else setTimeout(install,900);
})();