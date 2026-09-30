export function accountTools(auth,onDeleted){
 const box=document.createElement('section');box.className='card';
 const heading=document.createElement('h2');heading.textContent='Kontodaten verwalten';
 const details=document.createElement('details');const summary=document.createElement('summary');summary.textContent='Web-Konto dauerhaft löschen';
 const warning=document.createElement('p');warning.className='notice disclaimer';
 warning.textContent='Ihr Web-Konto, der synchronisierte Lernstand und die zugeordneten Code-Freischaltungen werden dauerhaft gelöscht. Ein bereits verbrauchter Code wird dadurch nicht wieder frei. Apple-Käufe und Ihr Lernstand in der iPhone-App werden weder gelöscht noch gekündigt.';
 const label=document.createElement('label');label.textContent='Zur Bestätigung KONTO LÖSCHEN eingeben';label.htmlFor='delete-confirmation';
 const input=document.createElement('input');input.id='delete-confirmation';input.autocomplete='off';
 const button=document.createElement('button');button.type='button';button.className='danger';button.textContent='Web-Konto endgültig löschen';button.disabled=true;
 const status=document.createElement('p');status.role='status';
 input.addEventListener('input',()=>button.disabled=input.value!=='KONTO LÖSCHEN');
 button.addEventListener('click',async()=>{button.disabled=true;status.textContent='Konto wird gelöscht …';try{await auth.deleteAccount(input.value);onDeleted();}catch{status.textContent='Die Löschung konnte nicht bestätigt werden. Bitte versuchen Sie es erneut oder kontaktieren Sie rechtmedizinisch@gmail.com.';button.disabled=input.value!=='KONTO LÖSCHEN';}});
 details.append(summary,warning,label,input,button,status);box.append(heading,details);return box;
}
