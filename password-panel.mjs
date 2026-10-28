import {notify} from './feedback.mjs';
import {passwordError} from './password-account.mjs';
const el=(tag,text)=>{const node=document.createElement(tag);if(text!=null)node.textContent=text;return node;};
export function passwordPanel(auth,user){
 const owner=user?.id,box=el('section');box.className='card account-password';
 box.append(el('h2','Passwort'),el('p','Legen Sie ein Passwort für die Anmeldung mit Ihrer E-Mail-Adresse fest. Es gilt in App und Website.'));
 const details=el('details'),summary=el('summary','Passwort festlegen oder ändern'),form=el('form');form.className='password-settings-form';
 const username=el('input');username.type='hidden';username.name='username';username.autocomplete='username';username.value=user?.email??'';
 const label=el('label','Neues Passwort'),password=el('input');password.id='account-new-password';password.name='new-password';password.type='password';password.autocomplete='new-password';password.minLength=12;password.required=true;label.htmlFor=password.id;
 const hint=el('small','Mindestens 12 Zeichen.'),repeatLabel=el('label','Neues Passwort wiederholen'),repeat=el('input');repeat.id='account-repeat-password';repeat.name='repeat-password';repeat.type='password';repeat.autocomplete='new-password';repeat.minLength=12;repeat.required=true;repeatLabel.htmlFor=repeat.id;
 const previous=el('div');previous.hidden=true;const currentLabel=el('label','Bisheriges Passwort'),current=el('input');current.id='account-current-password';current.type='password';current.autocomplete='current-password';currentLabel.htmlFor=current.id;previous.append(currentLabel,current);
 const confirmation=el('div');confirmation.hidden=true;const codeLabel=el('label','Bestätigungscode aus der E-Mail'),code=el('input');code.id='password-confirmation';code.inputMode='numeric';code.autocomplete='one-time-code';code.pattern='[0-9]{6,10}';code.maxLength=10;codeLabel.htmlFor=code.id;
 const send=el('button','Bestätigungscode senden');send.type='button';send.className='secondary';confirmation.append(send,codeLabel,code);
 const save=el('button','Passwort speichern');save.type='submit';save.disabled=!owner;
 const message=el('p');message.role='status';message.className='auth-feedback';let busy=false;
 const show=(text,kind)=>{message.textContent=text;message.className='auth-feedback notice '+kind;};
 const enabled=()=>{save.disabled=busy||!owner;send.disabled=busy;};
 const report=(text,title='Passwort nicht gespeichert')=>{show(text,'error');if(box.isConnected)notify({kind:'error',title,text});};
 repeat.addEventListener('input',()=>repeat.setCustomValidity(''));password.addEventListener('input',()=>repeat.setCustomValidity(''));
 send.onclick=async()=>{
  if(busy||!box.isConnected)return;busy=true;enabled();
  try{await auth.requestPasswordConfirmation(owner);if(!box.isConnected)return;show('Der Bestätigungscode ist unterwegs. Prüfen Sie Ihr E-Mail-Postfach.','success');code.focus();}
  catch{if(box.isConnected)report('Der Bestätigungscode konnte nicht gesendet werden. Bitte versuchen Sie es später erneut.','Bestätigungscode nicht gesendet');}
  finally{busy=false;enabled();}
 };
 form.onsubmit=async event=>{
  event.preventDefault();if(busy||!box.isConnected)return;
  repeat.setCustomValidity(password.value===repeat.value?'':'Die Passwörter stimmen nicht überein.');if(!form.reportValidity())return;
  busy=true;enabled();show('Passwort wird gespeichert …','info');
  try{
   await auth.setPassword(owner,password.value,{nonce:code.value,currentPassword:current.value});
   password.value='';repeat.value='';code.value='';current.value='';
   if(!box.isConnected)return;confirmation.hidden=true;code.required=false;previous.hidden=true;current.required=false;details.open=false;
   const text='Passwort gespeichert. Bei Ihrer nächsten Anmeldung können Sie E-Mail und Passwort direkt verwenden – in App und Website.';
   show(text,'success');notify({kind:'success',title:'Passwort gespeichert',text});
  }catch(error){
   if(!box.isConnected)return;const result=passwordError(error);report(result.text);
   if(result.confirmation){confirmation.hidden=false;code.required=true;send.focus();}
   if(result.currentPassword){previous.hidden=false;current.required=true;current.focus();}
  }finally{busy=false;enabled();}
 };
 form.append(username,label,password,hint,repeatLabel,repeat,previous,confirmation,save);details.append(summary,form);box.append(details,message);return box;
}
