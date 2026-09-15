/* MEDIOUSAO - Registro simple: nombre y apellido, correo y crear contraseña */
(function(){
  function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function simplify(){
    const first=document.getElementById('mpAuthFirst');
    const submit=document.getElementById('mpAuthSubmit');
    if(!first||!submit||submit.dataset.simpleSignup==='1')return;
    const last=document.getElementById('mpAuthLast');
    const phone=document.getElementById('mpAuthPhone');
    phone?.closest('.mp-field')?.remove();
    const firstLabel=first.closest('.mp-field')?.querySelector('label');
    if(firstLabel)firstLabel.textContent='Nombre y apellido';
    first.setAttribute('autocomplete','name');
    if(last)last.closest('.mp-field')?.remove();
    const password=document.getElementById('mpAuthPassword');
    const passwordLabel=password?.closest('.mp-field')?.querySelector('label');
    if(passwordLabel)passwordLabel.textContent='Crear contraseña';
    submit.dataset.simpleSignup='1';
    submit.onclick=async()=>{
      const b=document.getElementById('mediousaoProfileBody');
      const fullName=b?.querySelector('#mpAuthFirst')?.value.trim()||'';
      const email=b?.querySelector('#mpAuthEmail')?.value.trim()||'';
      const password=b?.querySelector('#mpAuthPassword')?.value||'';
      const msg=b?.querySelector('#mpAuthMsg');
      if(!fullName||!email||!password){if(msg)msg.innerHTML='<div class="error" style="margin-top:10px">Completa nombre y apellido, correo y contraseña.</div>';return;}
      const parts=fullName.split(/\s+/).filter(Boolean);
      const firstName=parts.shift()||fullName;
      const lastName=parts.join(' ');
      if(msg)msg.innerHTML='<div class="notice" style="margin-top:10px">Creando cuenta…</div>';
      try{
        const {data,error}=await client.auth.signUp({email,password,options:{data:{first_name:firstName,last_name:lastName,full_name:fullName,phone:''}}});
        if(error)throw error;
        localStorage.setItem('mediousao_customer_name',fullName);
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
