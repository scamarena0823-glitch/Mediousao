/* MEDIOUSAO - selector de público para productos */
(function(){
  function apply(){
    const s=document.getElementById('pAudience');
    if(!s)return;
    const current=s.value;
    s.innerHTML='<option value="" disabled>Público</option><option value="none">No indicar</option><option value="men">Hombre</option><option value="women">Mujer</option><option value="kids">Niño</option><option value="unisex">Unisex</option>';
    if(current && [...s.options].some(o=>o.value===current)) s.value=current;
    else s.value='';
    s.addEventListener('change',function(){
      if(this.value==='none') this.dataset.noAudience='1';
      else delete this.dataset.noAudience;
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
  setTimeout(apply,500);
})();
