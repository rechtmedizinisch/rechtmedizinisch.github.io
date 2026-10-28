import {notify} from './feedback.mjs';
const el=(tag,text)=>{const n=document.createElement(tag);if(text!=null)n.textContent=text;return n;};
export function loginPanel(auth,config,onSignedIn=async()=>{}){
 const box=el('section');box.className='card login-panel';box.append(el('h2','Anmelden'),el('p','Mit Ihrem bestehenden Konto für App und Website.'));
 const message=el('p');message.role='status';message.className='auth-feedback';
 const show=(text,kind='')=>{message.textContent=text;message.className='auth-feedback'+(kind?' notice '+kind:'');};
 const report=(title,text,kind='error')=>{show(text,kind);if(box.isConnected)notify({kind,title,text});};
 if(!auth)show('Anmeldung wird vorbereitet …');
 if(config.appleEnabled){
  const apple=el('button'),image=el('img');apple.type='button';apple.className='auth-provider apple-sign-in';apple.setAttribute('aria-label','Mit Apple anmelden');apple.disabled=true;
  image.src='./assets/apple-sign-in-de.png';image.alt='';image.width=320;image.height=50;apple.append(image);box.append(apple);
  let request;
  const prepare=async()=>{try{request=await auth.prepareAppleLogin();apple.disabled=false;}catch{show('Apple-Anmeldung derzeit nicht verfügbar. Bitte nutzen Sie Google oder E-Mail.','error');}};
  if(auth)prepare();
  apple.onclick=async()=>{
   apple.disabled=true;show('Bestätigen Sie die Anmeldung im Apple-Fenster.');let signedIn=false;
   try{await auth.appleLogin(request);signedIn=true;show('Erfolgreich angemeldet. Ihr Zugang wird geladen …','success');await onSignedIn();}
   catch(error){if(auth.isAppleCancellation(error))report('Anmeldung abgebrochen','Sie können sich jederzeit erneut anmelden.','info');else report('Apple-Anmeldung nicht abgeschlossen','Die Apple-Anmeldung wurde nicht abgeschlossen. Bitte versuchen Sie es erneut oder nutzen Sie Google oder E-Mail.');}
   finally{if(!signedIn&&apple.isConnected)await prepare();}
  };
 }
 if(config.googleEnabled){const google=el('button','Mit Google fortfahren');google.type='button';google.disabled=!auth;google.onclick=async()=>{google.disabled=true;try{await auth.googleLogin();}catch{report('Google-Anmeldung nicht möglich','Google-Anmeldung derzeit nicht möglich. Bitte nutzen Sie E-Mail.');google.disabled=false;}};box.append(google);}
 const passwordForm=el('form'),label=el('label','Ihre E-Mail-Adresse'),email=el('input');passwordForm.className='password-login-form';email.type='email';email.id='login-email';email.name='username';email.required=true;email.autocomplete='username';email.autocapitalize='none';email.spellcheck=false;label.htmlFor=email.id;
 try{email.value=sessionStorage.getItem('rm-pending-email')??'';}catch{}
 const passwordHeading=el('h3','Mit E-Mail und Passwort'),passwordLabel=el('label','Ihr Passwort'),password=el('input');password.type='password';password.id='login-password';password.name='password';password.autocomplete='current-password';password.required=true;passwordLabel.htmlFor=password.id;
 const passwordSubmit=el('button','Mit Passwort anmelden');passwordSubmit.type='submit';passwordSubmit.disabled=!auth;
 passwordForm.append(passwordHeading,label,email,passwordLabel,password,passwordSubmit);
 passwordForm.onsubmit=async event=>{
  event.preventDefault();passwordSubmit.disabled=true;show('Anmeldung wird geprüft …');
  try{await auth.passwordLogin(email.value.trim(),password.value);password.value='';try{sessionStorage.removeItem('rm-pending-email');}catch{}show('Erfolgreich angemeldet. Ihr Zugang wird geladen …','success');await onSignedIn();}
  catch(error){report('Anmeldung nicht möglich',error?.code==='invalid_credentials'?'E-Mail-Adresse oder Passwort stimmen nicht überein. Sie können sich alternativ per E-Mail-Code anmelden.':error?.status===429?'Zu viele Anmeldeversuche. Bitte warten Sie kurz.':'Die Anmeldung konnte gerade nicht geprüft werden. Bitte versuchen Sie es erneut.');passwordSubmit.disabled=false;}
 };
 const emailBox=el('details'),emailTitle=el('summary','Erster Zugang oder Passwort vergessen?');emailBox.className='email-code-alternative';
 const emailHint=el('p','Melden Sie sich per E-Mail-Code an. Danach können Sie unter „Mein Zugang → Passwort“ ein Passwort festlegen.');
 const send=el('button','Anmeldecode per E-Mail senden');send.type='button';send.className='secondary';send.disabled=!auth||!config.emailEnabled;
 send.onclick=async()=>{
  if(!email.reportValidity())return;send.disabled=true;show('Anmeldemail wird angefordert …');
  try{await auth.emailLogin(email.value.trim());try{sessionStorage.setItem('rm-pending-email',email.value.trim());}catch{}show('Prüfen Sie Ihr Postfach und gegebenenfalls den Spamordner. Geben Sie den Anmeldecode hier ein oder öffnen Sie den Link im selben Browser.','success');if(box.isConnected)notify({kind:'success',title:'Anmeldemail gesendet',text:'Prüfen Sie Ihr Postfach und gegebenenfalls den Spamordner.'});token.focus();}
  catch{report('Anmeldemail nicht gesendet','Die E-Mail konnte nicht angefordert werden. Bitte warten Sie kurz und versuchen Sie es erneut.');}
  finally{send.disabled=false;}
 };
 const confirm=el('form'),tokenLabel=el('label','Anmeldecode aus der E-Mail'),token=el('input');token.id='email-token';token.inputMode='numeric';token.autocomplete='one-time-code';token.pattern='[0-9]{6,10}';token.maxLength=10;token.required=true;tokenLabel.htmlFor=token.id;
 const verify=el('button','Anmeldung bestätigen');verify.type='submit';verify.disabled=!auth;
 confirm.append(tokenLabel,token,verify);confirm.onsubmit=async event=>{
  event.preventDefault();if(!email.reportValidity())return;verify.disabled=true;
  try{await auth.verifyEmailCode(email.value.trim(),token.value.trim());try{sessionStorage.removeItem('rm-pending-email');}catch{}show('Erfolgreich angemeldet. Ihr Zugang wird geladen …','success');await onSignedIn();}
  catch{report('Anmeldecode nicht bestätigt','Der Anmeldecode ist ungültig oder abgelaufen. Prüfen Sie E-Mail-Adresse und Code oder fordern Sie eine neue Anmeldemail an.');verify.disabled=false;}
 };
 emailBox.append(emailTitle,emailHint,send,confirm);
 box.append(passwordForm,emailBox,message);
 return box;
}
