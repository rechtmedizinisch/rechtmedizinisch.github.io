import {scopeLabel,accessDuration} from './policy.mjs?v=20261014-shared1';
import {notify} from './feedback.mjs';
export function codeFeedback(result){
 if(result?.ok)return {kind:result.already_redeemed?'info':'success',title:result.already_redeemed?'Code bereits eingelöst':'Code erfolgreich eingelöst',text:result.already_redeemed?'Dieser Code ist für Ihr Konto bereits eingelöst. Die Laufzeit steht bei Ihren Freischaltungen.':`Code erfolgreich eingelöst: ${scopeLabel(result.scope)} · ${accessDuration(result.expires_at)}.`};
 if(result?.reason==='try_later')return {kind:'error',title:'Bitte kurz warten',text:'Zu viele Versuche. Bitte warten Sie 15 Minuten.'};
 if(result?.reason==='sign_in_required')return {kind:'error',title:'Anmeldung erforderlich',text:'Bitte melden Sie sich erneut an, um den Code einzulösen.'};
 return {kind:'error',title:'Code nicht eingelöst',text:'Der Code ist nicht verfügbar, abgelaufen oder bereits vollständig eingelöst. Bitte prüfen Sie Ihre Eingabe.'};
}
export function codePanel(auth,{notice=null,onRedeemed=async()=>{}}={}){
 const form=document.createElement('form');form.className='card account-code';
 const el=(tag,text)=>{const n=document.createElement(tag);if(text)n.textContent=text;return n;};
 const label=el('label','Freischaltcode'),input=el('input');input.id='code';input.required=true;input.maxLength=128;input.autocomplete='off';input.autocapitalize='none';input.spellcheck=false;label.htmlFor=input.id;
 const submit=el('button','Code einlösen');submit.type='submit';
 const feedback=el('p');feedback.role='status';feedback.setAttribute('aria-live','polite');feedback.className='code-feedback';
 const show=value=>{feedback.textContent=value?.text??'';feedback.className='code-feedback'+(value?.kind?' notice '+value.kind:'');};show(notice);
 const report=value=>{show(value);if(form.isConnected)notify(value);};
 form.append(el('h2','🎟 Inhalte freischalten'),el('p','Hier gehört Ihr Kurs- oder Premium-Code hinein. Der Anmeldecode aus der E-Mail gehört zur Anmeldung.'),label,input,submit,feedback);
 let busy=false;
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(busy)return;const code=input.value.trim();if(!code){report({kind:'error',title:'Freischaltcode fehlt',text:'Bitte geben Sie einen Freischaltcode ein.'});input.focus();return;}
  busy=true;submit.disabled=true;submit.textContent='Code wird geprüft …';input.disabled=true;form.setAttribute('aria-busy','true');show({text:'Ihr Freischaltcode wird geprüft …'});
  try{
   const result=await auth.redeem(code),message=codeFeedback(result);report(message);
   if(result?.ok){input.value='';try{await onRedeemed(message);}catch{show({kind:'success',text:message.text+' Bitte aktualisieren Sie die Seite, falls der Zugang noch nicht angezeigt wird.'});}}
  }catch(error){report({kind:'error',title:'Code konnte nicht geprüft werden',text:error?.message==='request_timeout'?'Die Prüfung dauert zu lange. Bitte versuchen Sie es erneut. Bereits erfolgte Freischaltungen bleiben erhalten.':'Die Freischaltung konnte gerade nicht geprüft werden. Bitte versuchen Sie es erneut.'});}
  finally{busy=false;submit.disabled=false;submit.textContent='Code einlösen';input.disabled=false;form.removeAttribute('aria-busy');}
 });return form;
}
