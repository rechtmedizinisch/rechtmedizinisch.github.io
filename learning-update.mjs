// One semantic feature owns its title, explanation and icon; no parallel position lists.
export const learningUpdate = Object.freeze({
 "id": "2026.11.26-parcours-certificate",
 "title": "Neu für Sie",
 "subtitle": "Mehr verstehen. Einfacher weiterlernen.",
 "footer": "Ihr Lernstand und Ihre Freischaltungen bleiben erhalten.",
 "features": Object.freeze([
  {
    "id": "parcours",
    "icon": "casework",
    "title": "Parcours für Recht und Ethik",
    "detail": "Etappen und Stand öffnen sich im Vordergrund. Pflichtnormen sind einzeln verlinkt. Nach 41 Aufgaben können Sie direkt ein PDF-Zertifikat speichern. Einstieg über das MTR-Special, Grundlagen unter Gesundheitsberufe."
  },
  {
    "id": "casefile",
    "icon": "casefile",
    "title": "Strafakte in Hoch- und Querformat",
    "detail": "Gleichmäßig angeordnete Bereiche machen Aktenlage, Ermittlungen und Verlauf leichter erreichbar."
  },
  {
    "id": "episode",
    "icon": "podcast",
    "title": "Folge 8 auf der Lernen-Startseite",
    "detail": "Suizidassistenz: Wann ist ein Sterbewunsch frei? Direkt zu den Höranbietern."
  },
  {
    "id": "access",
    "icon": "sync",
    "title": "Zugang bei kurzen Netzproblemen",
    "detail": "Die Apps behalten einen kürzlich bestätigten Zugang bei einem vorübergehenden Verbindungsfehler zunächst bei."
  }
].map(feature=>Object.freeze(feature)))
});
export const webLearningUpdate=Object.freeze({
 id:'2026.11.26-web-strafakte-und-parcours',
 title:'Neu auf der Lernplattform',
 subtitle:'Strafakte, Parcours und Lernansicht im Überblick.',
 footer:'Ihr Lernstand und Ihre Freischaltungen bleiben erhalten.',
 features:Object.freeze([
  {id:'casefile',icon:'casefile',title:'Interaktive Strafakte',detail:'Strafanzeigen im Dokumentenlayout mit Eingangsstempel. Rückläufe sind direkt in der Aktennavigation erreichbar. In der Gerichtsperspektive prüfen Sie Unterlagen, Beweise und die nächsten Verfahrensschritte.'},
  {id:'parcours',icon:'radiology',title:'Parcours für Recht und Ethik',detail:'Grundlagen für alle Gesundheitsberufe und Vertiefungen für MTR. Mit Premium erhalten Sie nach 41 Aufgaben Ihr kontogebundenes PDF-Zertifikat.'},
  {id:'reading',icon:'search',title:'Vollbild und Üben',detail:'Ein Klick auf die ganze Übungskarte genügt. Mit Vollbild nutzen Sie mehr Platz zum Lesen und Üben. Über Navigation oder Escape gelangen Sie jederzeit zurück.'},
  {id:'episode',icon:'podcast',title:'Folge 8 · Suizidassistenz',detail:'Direkt von der Lernen-Startseite zu den Höranbietern und zur fachlichen Vertiefung.'}
 ].map(Object.freeze))
});
export function updateAcknowledgements(storage,revision=learningUpdate.id){
 const seen=new Set(),key=owner=>'rm.learningUpdate.seen.v1:'+owner;
 return {
  has(owner){if(!owner)return true;if(seen.has(owner))return true;try{return storage?.getItem(key(owner))===revision;}catch{return false;}},
  mark(owner){if(!owner)return;seen.add(owner);try{storage?.setItem(key(owner),revision);}catch{/* The in-memory marker prevents repetition in this visit. */}}
 };
}
const updateIconPaths={
 sync:'M20 7a8 8 0 0 0-14-2L3 8 M3 3v5h5 M4 17a8 8 0 0 0 14 2l3-3 M21 21v-5h-5',
 casefile:'M3 5h7l2 3h9v12H3V5z M7 12h10 M7 16h6',
 casework:'M12 5C8 2 4 3 2 4v15c3-2 6-2 10 0 4-2 7-2 10 0V4c-3-1-6-2-10 1v14',
 rescue:'M20 4c-3-2-6 0-8 2-2-2-5-4-8-2-6 4 1 11 8 16 7-5 14-12 8-16 M3 11h5l2-4 3 8 2-4h6',
 search:'M15 15l6 6 M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0',
 progress:'M3 3v18h18 M7 16v-4 M12 16V7 M17 16V9',
 radiology:'M7 19H5Q3 19 3 17V6Q3 3 6 3H18Q21 3 21 6V17Q21 19 19 19H17 M7.5 12Q7.5 7.5 12 7.5Q16.5 7.5 16.5 12 M8.5 15H15.5L18 21H6Z',
 podcast:'M3 12h2l2-4 3 9 3-12 3 13 2-6h3'
};
function updateIcon(doc,kind){
 const svg=doc.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');
 const path=doc.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',updateIconPaths[kind]);path.setAttribute('fill','none');path.setAttribute('stroke','currentColor');path.setAttribute('stroke-width','1.8');path.setAttribute('stroke-linecap','round');path.setAttribute('stroke-linejoin','round');svg.append(path);return svg;
}
export function createLearningUpdateNotice({document:doc=globalThis.document,storage,model=learningUpdate}={}){
 if(storage===undefined){try{storage=globalThis.localStorage;}catch{storage=null;}}
 const acknowledgements=updateAcknowledgements(storage,model.id);let owner=null,current=null;
 const el=(tag,text,cls)=>{const node=doc.createElement(tag);if(text)node.textContent=text;if(cls)node.className=cls;return node;};
 return {
  setUser(nextOwner){
   if(nextOwner!==owner){current?.finish(false);owner=nextOwner;}
   if(!owner||current||acknowledgements.has(owner)||doc.querySelector('dialog[open]'))return false;
   const forOwner=owner,previousFocus=doc.activeElement,dialog=el('dialog',null,'learning-update-dialog');
   dialog.setAttribute('aria-labelledby','learning-update-title');dialog.setAttribute('aria-describedby','learning-update-intro');
   const panel=el('div',null,'learning-update-panel'),header=el('div',null,'learning-update-heading'),titles=el('div');
   const logo=el('img');logo.src='assets/header-brand-mark.png';logo.alt='';logo.width=48;logo.height=48;
   const title=el('h2',model.title);title.id='learning-update-title';title.tabIndex=-1;title.setAttribute('autofocus','');
   const intro=el('p',model.subtitle,'learning-update-intro');intro.id='learning-update-intro';titles.append(title,intro);header.append(logo,titles);
   const scroll=el('div',null,'learning-update-scroll');scroll.tabIndex=0;scroll.setAttribute('aria-label','Verbesserungen in dieser Version');
   const list=el('ul');for(const item of model.features){
    const row=el('li');row.setAttribute('data-feature',item.id);
    const icon=el('span',null,'learning-update-icon');icon.append(updateIcon(doc,item.icon));
    const copy=el('div');copy.append(el('h3',item.title),el('p',item.detail));row.append(icon,copy);list.append(row);
   }
   const note=el('p',model.footer,'learning-update-preserved');scroll.append(list,note);
   const actions=el('div',null,'learning-update-actions'),button=el('button','Weiterlernen');button.type='button';actions.append(button);
   panel.append(header,scroll,actions);dialog.append(panel);doc.body.append(dialog);
   let closed=false;
   const finish=acknowledge=>{
    if(closed)return;closed=true;
    if(acknowledge)acknowledgements.mark(forOwner);
    if(current?.dialog===dialog)current=null;
    if(dialog.open)dialog.close();dialog.remove();
    if(owner===forOwner&&previousFocus?.isConnected)previousFocus.focus();
   };
   current={dialog,finish};button.addEventListener('click',()=>finish(true));
   dialog.addEventListener('cancel',event=>{event.preventDefault();finish(true);});dialog.addEventListener('close',()=>finish(true));
   dialog.showModal();title.focus({preventScroll:true});scroll.scrollTop=0;return true;
  }
 };
}
