import {config} from './config.js?v=20261027-google-choice55';

const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;};
export function renderCancellation(main){
 main.classList.add('narrow');
 main.append(node('h1','Verträge hier kündigen'),node('p','Für ein über diese Website abgeschlossenes Web-Abonnement. Eine Anmeldung ist nicht erforderlich. Apple-Abonnements verwalten Sie in Ihren Apple-Abonnementeinstellungen.'));
 const form=node('form',null,'card cancellation-form');
 form.append(node('h2','Ihre Kündigungserklärung'));
 const fields={};
 const field=(key,label,type='text',required=true)=>{
  const wrap=node('div',null,'cancellation-field'),caption=node('label',label),input=node(type==='textarea'?'textarea':'input');
  input.id='cancel-'+key;input.name=key;caption.htmlFor=input.id;
  if(type!=='textarea')input.type=type;input.required=required;input.maxLength=key==='reason'?2000:300;
  if(key==='email')input.autocomplete='email';if(key==='name')input.autocomplete='name';
  fields[key]=input;wrap.append(caption,input);form.append(wrap);return input;
 };
 field('name','Vor- und Nachname');field('email','E-Mail-Adresse für die Kündigungsbestätigung','email');
 field('contract','Vertrag (z. B. Premium monatlich/jährlich; falls bekannt Kauf- oder Abonnementnummer)');
 const kind=node('select');kind.id='cancel-kind';
 for(const [value,text] of [['ordinary','Ordentliche Kündigung'],['extraordinary','Außerordentliche Kündigung']]){const option=node('option',text);option.value=value;kind.append(option);}
 const kindLabel=node('label','Art der Kündigung');kindLabel.htmlFor=kind.id;form.append(kindLabel,kind);
 const reason=field('reason','Kündigungsgrund (bei außerordentlicher Kündigung erforderlich)','textarea',false);
 kind.addEventListener('change',()=>{reason.required=kind.value==='extraordinary';});
 field('requested_end','Gewünschter Beendigungszeitpunkt','date',false);
 form.append(node('p','Ohne Datum erklären Sie die Kündigung zum nächstmöglichen Zeitpunkt. Gesetzliche Rechte bleiben unberührt. Bitte geben Sie keine Gesundheits- oder Patientendaten an.','subtle'));
 const privacy=node('a','Datenschutz zur Bearbeitung Ihrer Kündigung →');privacy.href='#privacy';form.append(privacy);
 const submit=node('button','jetzt kündigen');submit.type='submit';
 const message=node('p',null,'notice');message.setAttribute('role','status');message.setAttribute('aria-live','polite');
 let requestId=crypto.randomUUID(),submitted=null,downloadURL;
 // Existing customers must still be able to cancel if new purchases are paused.
 if(!config.cancellationLiveEnabled){submit.disabled=true;message.textContent='Die Online-Kündigung ist noch nicht aktiviert. Kündigungserklärungen können Sie an rechtmedizinisch@gmail.com senden.';}
 form.append(submit,message);main.append(form);
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(submit.disabled)return;submit.disabled=true;
  const payload={request_id:requestId,name:fields.name.value.trim(),email:fields.email.value.trim(),contract:fields.contract.value.trim(),kind:kind.value,reason:reason.value.trim(),requested_end:fields.requested_end.value};
  // A retry of the same declaration keeps its identifier; an edited declaration
  // gets a new identifier rather than silently replacing the original.
  const fingerprint=JSON.stringify(payload);if(submitted&&submitted!==fingerprint){requestId=crypto.randomUUID();payload.request_id=requestId;}
  submitted=JSON.stringify(payload);
  try{
   const response=await fetch(config.url+'/functions/v1/web-cancellation',{method:'POST',headers:{'Content-Type':'application/json',apikey:config.key},body:JSON.stringify(payload)});
   const data=await response.json();
   if(!response.ok||!data.accepted){message.textContent=data.error==='try_later'?'Zu viele Anfragen. Bitte versuchen Sie es später erneut oder schreiben Sie an rechtmedizinisch@gmail.com.':'Die Kündigung wurde hier nicht bestätigt. Bitte versuchen Sie es erneut oder schreiben Sie an rechtmedizinisch@gmail.com.';submit.disabled=false;return;}
   message.textContent=data.email_sent?'Ihre Kündigungserklärung ist eingegangen. Die Bestätigung wurde per E-Mail versendet. Sie können sie außerdem unten speichern.':'Ihre Kündigungserklärung ist eingegangen. Die E-Mail konnte noch nicht versendet werden. Bitte speichern Sie die Bestätigung unten; bei Fragen nennen Sie deren Referenz.';
   const receipt=node('section',null,'card cancellation-receipt');receipt.append(node('h2','Kündigungserklärung eingegangen'),node('pre',data.confirmation));
   if(downloadURL)URL.revokeObjectURL(downloadURL);downloadURL=URL.createObjectURL(new Blob([data.confirmation],{type:'text/plain;charset=utf-8'}));
   const download=node('a','Bestätigung speichern ↓','button secondary');download.href=downloadURL;download.download='Recht-Medizinisch-Kuendigung-'+data.reference+'.txt';receipt.append(download);main.append(receipt);receipt.scrollIntoView({block:'start'});
   submit.textContent='Kündigung übermittelt';
  }catch{message.textContent='Die Verbindung wurde unterbrochen. Bitte versuchen Sie es erneut. Eine bereits eingegangene Erklärung wird dadurch nicht doppelt angelegt.';submit.disabled=false;}
 });
}
