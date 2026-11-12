// One semantic feature owns its title, explanation and icon; no parallel position lists.
export const learningUpdate = Object.freeze({
 "id": "2026.11.11-guided-learning",
 "title": "Neu für Sie",
 "subtitle": "Mehr verstehen. Einfacher weiterlernen.",
 "footer": "Ihr Lernstand und Ihre Freischaltungen bleiben erhalten.",
 "features": Object.freeze([
  {
   "id": "shared-progress",
   "icon": "sync",
   "title": "Ein Lernstand für App & Web",
   "detail": "Mit demselben Konto weiterlernen – auf iPhone, Android und im Browser. Auch offline."
  },
  {
   "id": "casefiles",
   "icon": "casefile",
   "title": "Drei Strafakten · neun Varianten",
   "detail": "Selbst ermitteln, Beweise vergleichen und das Verfahren Schritt für Schritt führen."
  },
  {
   "id": "casework",
   "icon": "casework",
   "title": "95 Fälle zum Mitdenken",
   "detail": "In der Fallwerkstatt: Sachverhalt lesen, eigene Überlegungen anstellen und die Entscheidung nachvollziehen."
  },
  {
   "id": "rescue",
   "icon": "rescue",
   "title": "Rettungsmedizin vertieft",
   "detail": "Patientenverfügungen im Einsatz: Streitfrage und Gründe des Wissenschaftlichen Dienstes verständlich erklärt."
  },
  {
   "id": "reference",
   "icon": "search",
   "title": "Wissen schneller finden",
   "detail": "Themenwege nach Rechtsgebieten. Begriffe, Normen und Entscheidungen direkt am Lernort nachschlagen."
  },
  {
   "id": "practice-progress",
   "icon": "progress",
   "title": "Übungserfolge im Blick",
   "detail": "Eigener Fortschritt für Fallwerkstatt und Strafakte. Ihr bisheriger Kursabschluss bleibt erhalten."
  }
 ].map(feature=>Object.freeze(feature)))
});
export function updateAcknowledgements(storage){
 const seen=new Set(),key=owner=>'rm.learningUpdate.seen.v1:'+owner;
 return {
  has(owner){if(!owner)return true;if(seen.has(owner))return true;try{return storage?.getItem(key(owner))===learningUpdate.id;}catch{return false;}},
  mark(owner){if(!owner)return;seen.add(owner);try{storage?.setItem(key(owner),learningUpdate.id);}catch{/* The in-memory marker prevents repetition in this visit. */}}
 };
}
const updateIconPaths={
 sync:'M20 7a8 8 0 0 0-14-2L3 8 M3 3v5h5 M4 17a8 8 0 0 0 14 2l3-3 M21 21v-5h-5',
 casefile:'M3 5h7l2 3h9v12H3V5z M7 12h10 M7 16h6',
 casework:'M12 5C8 2 4 3 2 4v15c3-2 6-2 10 0 4-2 7-2 10 0V4c-3-1-6-2-10 1v14',
 rescue:'M20 4c-3-2-6 0-8 2-2-2-5-4-8-2-6 4 1 11 8 16 7-5 14-12 8-16 M3 11h5l2-4 3 8 2-4h6',
 search:'M15 15l6 6 M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0',
 progress:'M3 3v18h18 M7 16v-4 M12 16V7 M17 16V9'
};
function updateIcon(doc,kind){
 const svg=doc.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');
 const path=doc.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',updateIconPaths[kind]);path.setAttribute('fill','none');path.setAttribute('stroke','currentColor');path.setAttribute('stroke-width','1.8');path.setAttribute('stroke-linecap','round');path.setAttribute('stroke-linejoin','round');svg.append(path);return svg;
}
export function createLearningUpdateNotice({document:doc=globalThis.document,storage}={}){
 if(storage===undefined){try{storage=globalThis.localStorage;}catch{storage=null;}}
 const acknowledgements=updateAcknowledgements(storage);let owner=null,current=null;
 const el=(tag,text,cls)=>{const node=doc.createElement(tag);if(text)node.textContent=text;if(cls)node.className=cls;return node;};
 return {
  setUser(nextOwner){
   if(nextOwner!==owner){current?.finish(false);owner=nextOwner;}
   if(!owner||current||acknowledgements.has(owner)||doc.querySelector('dialog[open]'))return false;
   const forOwner=owner,previousFocus=doc.activeElement,dialog=el('dialog',null,'learning-update-dialog');
   dialog.setAttribute('aria-labelledby','learning-update-title');dialog.setAttribute('aria-describedby','learning-update-intro');
   const panel=el('div',null,'learning-update-panel'),header=el('div',null,'learning-update-heading'),titles=el('div');
   const logo=el('img');logo.src='assets/header-brand-mark.png';logo.alt='';logo.width=48;logo.height=48;
   const title=el('h2',learningUpdate.title);title.id='learning-update-title';title.tabIndex=-1;title.setAttribute('autofocus','');
   const intro=el('p',learningUpdate.subtitle,'learning-update-intro');intro.id='learning-update-intro';titles.append(title,intro);header.append(logo,titles);
   const scroll=el('div',null,'learning-update-scroll');scroll.tabIndex=0;scroll.setAttribute('aria-label','Verbesserungen in dieser Version');
   const list=el('ul');for(const item of learningUpdate.features){
    const row=el('li');row.setAttribute('data-feature',item.id);
    const icon=el('span',null,'learning-update-icon');icon.append(updateIcon(doc,item.icon));
    const copy=el('div');copy.append(el('h3',item.title),el('p',item.detail));row.append(icon,copy);list.append(row);
   }
   const note=el('p',learningUpdate.footer,'learning-update-preserved');scroll.append(list,note);
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
