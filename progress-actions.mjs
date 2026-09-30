const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!=null)n.textContent=text;if(cls)n.className=cls;return n;};
export function progressActions(store,guestStore,isSignedIn,onRefresh){
  const panel=el('section',null,'card'),heading=el('h2','⚙ Lernstand verwalten');panel.append(heading);
  function confirmation(title,description,actionLabel,perform){
    const details=el('details',null,'learning-material'),summary=el('summary',title),body=el('div'),button=el('button',actionLabel,'secondary'),cancel=el('button','Abbrechen','secondary'),error=el('p');
    button.type=cancel.type='button';error.role='status';
    button.onclick=()=>{perform();if(store.error){error.textContent=store.error;return;}onRefresh();};
    cancel.onclick=()=>{details.open=false;};body.append(el('p',description,'notice'),button,cancel,error);details.append(summary,body);panel.append(details);
  }
  const guest=guestStore?.snapshot;
  if(isSignedIn&&(Object.keys(guest?.courses??{}).length||guest?.certificateName||guest?.completedCareerTopics?.length)){
    confirmation('📥 Gastlernstand in mein Konto übernehmen',
      'Der Gastlernstand dieses Browsers ersetzt den Kursfortschritt, Gelesen-Markierungen und Zertifikatsnamen Ihres Web-Kontos. Die Änderung wird synchronisiert. Ihr bisheriger Kontolernstand wird dabei ersetzt; die Gastkopie bleibt erhalten. Freischaltungen und Käufe ändern sich nicht.',
      'Ja, Kontolernstand durch Gastlernstand ersetzen',()=>store.replaceLearning(guestStore.snapshot));
  }
  confirmation(isSignedIn?'Lernstand meines Web-Kontos zurücksetzen':'Lokalen Gastlernstand zurücksetzen',
    isSignedIn?'Alle Kursantworten, Lernschritte, Gelesen-Markierungen und der Zertifikatsname Ihres Web-Kontos werden zurückgesetzt und die Änderung wird synchronisiert. Der Gastlernstand, Ihre Freischaltungen und die separate Fehlerliste aus Übungsrunden bleiben erhalten.':'Alle Kursantworten, Lernschritte, Gelesen-Markierungen und der Zertifikatsname im Gastbereich dieses Browsers werden zurückgesetzt. Lernstände angemeldeter Konten bleiben erhalten.',
    'Ja, diesen Lernstand zurücksetzen',()=>store.resetLearning());
  return panel;
}
