/* MEDIOUSAO - selector de público para productos */
(function(){
  function apply(){
    const s=document.getElementById('pAudience');
    if(!s)return;
    const current=s.value;
    s.innerHTML='<option value="public">Público</option><option value="men">Hombre</option><option value="women">Mujer</option><option value="kids">Niño</option><option value="unisex">Unisex</option>';
    if(current && current!=='none' && [...s.options].some(o=>o.value===current)) s.value=current;
    else s.value='public';
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
  setTimeout(apply,500);
})();
