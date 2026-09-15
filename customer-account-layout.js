/* MEDIOUSAO - Ajustes de Mi cuenta: nombre completo, teléfono y guardar al final */
(function(){
  function formatPhone(value){
    const d=String(value||'').replace(/\D/g,'').slice(0,10);
    if(!d) return '';
    if(d.length<=3) return '('+d;
    if(d.length<=6) return '('+d.slice(0,3)+') '+d.slice(3);
    return '('+d.slice(0,3)+') '+d.slice(3,6)+'-'+d.slice(6);
  }

  function apply(){
    const body=document.getElementById('mediousaoProfileBody');
    if(!body) return;
    const first=body.querySelector('#mpFirst');
    const last=body.querySelector('#mpLast');
    const phone=body.querySelector('#mpPhone');
    const save=body.querySelector('#mpSaveProfile');
    const addressForm=body.querySelector('#mpAddressForm');
    if(!first||!last||!save||!addressForm) return;

    if(!first.dataset.fullNameReady){
      first.dataset.fullNameReady='1';
      const firstField=first.closest('.mp-field');
      const lastField=last.closest('.mp-field');
      const label=firstField&&firstField.querySelector('label');
      if(label) label.textContent='Nombre y apellido';
      first.value=[first.value,last.value].filter(Boolean).join(' ').trim();
      if(lastField) lastField.style.display='none';
      first.setAttribute('autocomplete','name');

      save.addEventListener('click',function(){
        const full=first.value.trim().replace(/\s+/g,' ');
        const parts=full.split(' ').filter(Boolean);
        first.value=parts.shift()||'';
        last.value=parts.join(' ');
        setTimeout(function(){first.value=full;},0);
      },true);
    }

    if(phone&&!phone.dataset.phoneFormatReady){
      phone.dataset.phoneFormatReady='1';
      phone.setAttribute('inputmode','numeric');
      phone.setAttribute('maxlength','14');
      phone.setAttribute('placeholder','(809) 345-5432');
      phone.value=formatPhone(phone.value);
      phone.addEventListener('input',function(){
        this.value=formatPhone(this.value);
      });
    }

    if(save.dataset.atBottom!=='1'){
      save.dataset.atBottom='1';
      const msg=body.querySelector('#mpProfileMsg');
      addressForm.insertAdjacentElement('afterend',save);
      if(msg) save.insertAdjacentElement('afterend',msg);
      save.style.marginTop='16px';
    }
  }

  const observer=new MutationObserver(apply);
  function boot(){
    apply();
    observer.observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot);
  else boot();
})();
