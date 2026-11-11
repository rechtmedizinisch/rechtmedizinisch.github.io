const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!=null)n.textContent=text;if(cls)n.className=cls;return n;};
export function progressActions(store,guestStore,isSignedIn,onRefresh){
 const panel=el('section',null,'card progress-actions');panel.append(el('h2','⚙ Lernstand verwalten'));
 function confirmation(title,description,actionLabel,perform){
  const details=el('details',null,'progress-disclosure'),summary=el('summary',title),body=el('div'),button=el('button',actionLabel,'secondary'),cancel=el('button','Abbrechen','secondary'),error=el('p');
  let context;details.addEventListener('toggle',()=>{if(details.open){context=store.operationContext();error.textContent='';}});
  button.type=cancel.type='button';error.role='status';
  button.onclick=()=>{try{perform(context);if(store.error)throw Error(store.error);onRefresh();}catch(e){error.textContent=e.message;}};
  cancel.onclick=()=>{details.open=false;};body.append(el('p',description,'notice'),button,cancel,error);details.append(summary,body);panel.append(details);
 }
 const guest=guestStore?.snapshot;
 if(isSignedIn&&(Object.keys(guest?.courses??{}).length||guest?.certificateName||guest?.completedCareerTopics?.length||Object.keys(guest?.casework??{}).length||guest?.completedCasefileVariants?.length)){
  confirmation('📥 Gastlernstand in mein Konto übernehmen',
   'Der Gastlernstand dieses Browsers ersetzt Ihren Kontolernstand in App und Website. Die bisherige Fassung wird gesichert; die Gastkopie und Ihre Freischaltungen bleiben erhalten.',
   'Gastlernstand übernehmen',context=>store.replaceLearning(guestStore.snapshot,context));
 }
 confirmation(isSignedIn?'Kontolernstand zurücksetzen':'Lokalen Gastlernstand zurücksetzen',
  isSignedIn?'Kursantworten, Lernschritte, Übungsmarkierungen, Fehlerlisten und Zertifikatsname werden in Ihrem Konto zurückgesetzt. Die bisherige Fassung wird gesichert. Gastlernstand und Freischaltungen bleiben erhalten.':'Der Gastlernstand dieses Browsers wird zurückgesetzt. Eine Sicherung bleibt erhalten; angemeldete Konten ändern sich nicht.',
  'Diesen Lernstand zurücksetzen',context=>store.resetLearning(context));
 try{
  const saved=store.savedSnapshots();
  if(saved.length){const details=el('details',null,'progress-disclosure');details.append(el('summary',`Gesicherte Lernstände (${saved.length})`));
   for(const entry of saved){const row=el('div',null,'progress-saved-item');row.append(el('p',`${new Date(entry.createdAt).toLocaleString('de-DE')} · ${entry.reason}`));
    const download=el('button','Sicherung herunterladen','secondary');download.type='button';download.onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(entry.payload,null,2)],{type:'application/json'}));const a=el('a');a.href=url;a.download='recht-medizinisch-lernstand.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};row.append(download);
    const restore=el('details',null,'progress-disclosure'),summary=el('summary','Diese Sicherung wiederherstellen'),button=el('button','Lernstand durch diese Sicherung ersetzen','secondary'),error=el('p');error.role='status';button.type='button';let context;
    restore.addEventListener('toggle',()=>{if(restore.open){context=store.operationContext();error.textContent='';}});
    button.onclick=()=>{try{store.replaceLearning(entry.payload,context);if(store.error)throw Error(store.error);onRefresh();}catch(e){error.textContent=e.message;}};
    restore.append(summary,el('p','Die aktuelle Fassung wird zuvor gesichert. Freischaltungen bleiben erhalten.'),button,error);row.append(restore);details.append(row);
   }panel.append(details);
  }
 }catch{panel.append(el('p','Eine Sicherung konnte nicht gelesen werden. Sie bleibt gespeichert.','notice'));}
 return panel;
}
