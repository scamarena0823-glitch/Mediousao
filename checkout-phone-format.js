/* MEDIOUSAO - formato automático teléfono RD en checkout */
(function(){
 function digits(v){return String(v||'').replace(/\D/g,'').replace(/^1(?=\d{10}$)/,'').slice(0,10)}
 function format(v){const d=digits(v);if(!d)return'';if(d.length<=3)return'('+d;if(d.length<=6)return'('+d.slice(0,3)+') '+d.slice(3);return'('+d.slice(0,3)+') '+d.slice(3,6)+' - '+d.slice(6)}
 function attach(){const p=document.getElementById('phone');if(!p||p.dataset.medPhone==='1')return;p.dataset.medPhone='1';p.type='tel';p.inputMode='numeric';p.autocomplete='tel-national';p.placeholder='(809) 453 - 2345';if(p.value)p.value=format(p.value);p.addEventListener('input',()=>{const end=p.selectionStart===p.value.length;p.value=format(p.value);if(end)try{p.setSelectionRange(p.value.length,p.value.length)}catch(e){}});p.addEventListener('blur',()=>{p.value=format(p.value)})}
 document.addEventListener('focusin',e=>{if(e.target?.id==='phone')attach()},true);
 document.addEventListener('click',()=>setTimeout(attach,80),true);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',attach);else attach();
})();