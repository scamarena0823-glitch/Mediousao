/* MEDIOUSAO - Registro simple: nombre, correo y contraseña */
(function(){
  function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function simplify(){
    const first=document.getElementById('mpAuthFirst');
    const submit=document.getElementById('mpAuthSubmit');
    if(!first||!submit||submit.dataset.simpleSignup==='1')return;
    const last=document.getElementById('mpAuthLast');
    const phone=document.getElementById('mpAuthPhone');
    last?.closest('.mp-field')?.remove();
    phone?.closest('.mp-field')?.remove();
    submit.dataset.simpleSignup='1';
    submit.onclick=async()=>{
      const b=document.getElementById('mediousaoProfileBody');
      const name=b?.querySelector('#mpAuthFirst')?.value.trim()||'';
      const email=b?.querySelector('#mpAuthEmail')?.value.trim()||'';
      const password=b?.querySelector('#mpAuthPassword')?.value||'';
      const msg=b?.querySelector('#mpAuthMsg');
      if(!name||!email||!password){if(msg)msg.innerHTML='<div class="error" style="margin-top:10px">Completa nombre, correo y contraseña.</div>';return;}
      if(msg)msg.innerHTML='<div class="notice" style="margin-top:10px">Creando cuenta…</div>';
      try{
        const {data,error}=await client.auth.signUp({email,password,options:{data:{first_name:name,last_name:'',full_name:name,phone:''}}});
        if(error)throw error;
        localStorage.setItem('mediousao_customer_name',name);
        localStorage.setItem('mediousao_customer_phone','');
        if(data?.session){
          if(typeof window.mediousaoOpenProfile==='function')window.mediousaoOpenProfile();
        }else if(msg){
          msg.innerHTML='<div class="notice" style="margin-top:10px">Cuenta creada. Revisa tu correo para confirmar tu cuenta y luego inicia sesión.</div>';
        }
      }catch(e){if(msg)msg.innerHTML='<div class="error" style="margin-top:10px">'+esc(e.message||'No se pudo crear la cuenta.')+'</div>';}
    };
  }
  const obs=new MutationObserver(simplify);
  function boot(){obs.observe(document.body,{childList:true,subtree:true});simplify();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
