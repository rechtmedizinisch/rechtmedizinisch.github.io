export function accountTools(auth,onDeleted,user){
 const box=document.createElement('section');box.className='card';
 const heading=document.createElement('h2');heading.textContent='Kontodaten verwalten';
 const details=document.createElement('details');const summary=document.createElement('summary');summary.textContent='Konto dauerhaft löschen';
 const warning=document.createElement('p');warning.className='notice disclaimer';
 warning.textContent='Ihr gemeinsames Konto für App und Website, der Web-Lernstand und die zugeordneten Freischaltungen werden dauerhaft gelöscht. Ein verbrauchter Code wird nicht wieder frei. Kündigen Sie ein aktives Web-Abonnement zuerst über „Web-Abonnement verwalten“. Kontolöschung ist keine Abokündigung. Apple-Käufe und der lokale oder iCloud-Lernstand der App bleiben bestehen.';
 const usesApple=user?.identities?.some(identity=>identity.provider==='apple');
 const label=document.createElement('label');label.textContent='Zur Bestätigung KONTO LÖSCHEN eingeben';label.htmlFor='delete-confirmation';
 const input=document.createElement('input');input.id='delete-confirmation';input.autocomplete='off';
 const button=document.createElement('button');button.type='button';button.className='danger';button.textContent=usesApple?'Löschung mit Apple bestätigen':'Konto endgültig löschen';button.disabled=true;
 const status=document.createElement('p');status.role='status';let request,busy=false;
 const update=()=>{button.disabled=busy||input.value!=='KONTO LÖSCHEN'||(usesApple&&!request);};
 const prepare=async()=>{try{request=await auth.prepareAppleLogin();update();}catch{status.textContent='Apple-Bestätigung derzeit nicht verfügbar. Bitte versuchen Sie es später erneut.';}};
 if(usesApple){const hint=document.createElement('p');hint.textContent='Apple bestätigt Ihre Identität noch einmal. Erst danach wird das Konto gelöscht.';details.append(summary,warning,hint);}else details.append(summary,warning);
 details.addEventListener('toggle',()=>{if(details.open&&usesApple&&!request&&!busy)prepare();});
 input.addEventListener('input',update);
 button.addEventListener('click',async()=>{busy=true;update();status.textContent=usesApple?'Bitte bestätigen Sie die Löschung im Apple-Fenster.':'Konto wird gelöscht …';try{await auth.deleteAccount(input.value,request);onDeleted();}catch(error){status.textContent=auth.isAppleCancellation(error)?'Löschung abgebrochen. Ihr Konto bleibt bestehen.':'Die Löschung konnte nicht bestätigt werden. Prüfen Sie gegebenenfalls Ihr Web-Abonnement oder kontaktieren Sie rechtmedizinisch@gmail.com.';request=undefined;busy=false;if(usesApple)await prepare();update();}});
 details.append(label,input,button,status);box.append(heading,details);return box;
}
