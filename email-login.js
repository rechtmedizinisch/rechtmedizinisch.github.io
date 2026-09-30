const el=(tag,text)=>{const n=document.createElement(tag);if(text!=null)n.textContent=text;return n;};
export function loginPanel(auth,config){
 const box=el('section');box.className='card';box.append(el('h2','1. Anmelden oder kostenlos registrieren'),el('p','Ihr Konto bleibt bestehen. Zum erneuten Anmelden brauchen Sie kein Passwort: Nutzen Sie den E-Mail-Link oder den Anmeldecode aus derselben E-Mail.'));
 const message=el('p');message.role='status';
 if(config.googleEnabled){const google=el('button','Mit Google fortfahren');google.type='button';google.onclick=async()=>{google.disabled=true;try{await auth.googleLogin();}catch{message.textContent='Google-Anmeldung derzeit nicht möglich. Bitte nutzen Sie E-Mail.';google.disabled=false;}};box.append(google);}
 const form=el('form'),label=el('label','Ihre E-Mail-Adresse'),email=el('input');email.type='email';email.id='login-email';email.required=true;email.autocomplete='email';label.htmlFor=email.id;
 try{email.value=sessionStorage.getItem('rm-pending-email')??'';}catch{}
 const send=el('button','Anmeldemail senden');send.type='submit';send.disabled=!auth||!config.emailEnabled;
 form.append(label,email,send);form.onsubmit=async event=>{event.preventDefault();send.disabled=true;message.textContent='Anmeldemail wird angefordert …';try{await auth.emailLogin(email.value.trim());try{sessionStorage.setItem('rm-pending-email',email.value.trim());}catch{}message.textContent='Prüfen Sie Ihr Postfach und gegebenenfalls den Spamordner. Geben Sie den Anmeldecode hier ein oder öffnen Sie den Link im selben Browser.';token.focus();}catch{message.textContent='Die E-Mail konnte nicht angefordert werden. Bitte warten Sie kurz und versuchen Sie es erneut.';}finally{send.disabled=false;}};
 const confirm=el('form'),tokenLabel=el('label','Anmeldecode aus der E-Mail'),token=el('input');token.id='email-token';token.inputMode='numeric';token.autocomplete='one-time-code';token.pattern='[0-9]{6,10}';token.maxLength=10;token.required=true;tokenLabel.htmlFor=token.id;
 const verify=el('button','Anmeldung bestätigen');verify.type='submit';verify.disabled=!auth;
 confirm.append(tokenLabel,token,verify);confirm.onsubmit=async event=>{event.preventDefault();if(!email.reportValidity())return;verify.disabled=true;try{await auth.verifyEmailCode(email.value.trim(),token.value.trim());try{sessionStorage.removeItem('rm-pending-email');}catch{}message.textContent='Angemeldet. Der Bereich für Ihren Freischaltcode wird geöffnet …';}catch{message.textContent='Der Anmeldecode ist ungültig oder abgelaufen. Prüfen Sie E-Mail-Adresse und Code oder fordern Sie eine neue Anmeldemail an.';verify.disabled=false;}};
 box.append(form,confirm,message,el('h3','2. Inhalte mit Freischaltcode öffnen'),el('p','Nach der Anmeldung erscheint hier das separate Feld für Ihren Kurs- oder Premium-Freischaltcode. Dieser ist nicht mit dem Anmeldecode aus der E-Mail identisch.'));
 return box;
}
