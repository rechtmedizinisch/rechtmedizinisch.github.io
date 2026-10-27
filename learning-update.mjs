// Per-account UI preference only. Never changes grants, session or learning data.
export const learningUpdate = Object.freeze({
 id:'2026.10.27-lecture-update',
 title:'Neu für Sie',
 items:Object.freeze([
  'Neue Fälle: Geburt, Medikation und OP-Erweiterung',
  'Begriffe und Gesetzestexte direkt nachschlagen',
  'Folien und Zusatzmaterialien übersichtlicher durchsuchen',
  'Special Rettungsmedizin mit passenden Übungsfragen',
  'Podcast-Folge 7: Diagnose? Kaputt gespart'
 ])
});
export function updateAcknowledgements(storage){
 const seen=new Set(),key=owner=>'rm.learningUpdate.seen.v1:'+owner;
 return {
  has(owner){if(!owner)return true;if(seen.has(owner))return true;try{return storage?.getItem(key(owner))===learningUpdate.id;}catch{return false;}},
  mark(owner){if(!owner)return;seen.add(owner);try{storage?.setItem(key(owner),learningUpdate.id);}catch{/* The in-memory marker prevents repetition in this visit. */}}
 };
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
   dialog.setAttribute('aria-labelledby','learning-update-title');
   dialog.setAttribute('aria-describedby','learning-update-intro');
   const logo=el('img');logo.src='assets/header-brand-mark.png';logo.alt='';logo.width=64;logo.height=64;
   const title=el('h2',learningUpdate.title);title.id='learning-update-title';
   const intro=el('p','Mehr Inhalte. Schneller finden.','learning-update-intro');intro.id='learning-update-intro';
   const list=el('ul');for(const item of learningUpdate.items)list.append(el('li',item));
   const note=el('p','Ihr Lernstand und Ihre Freischaltungen bleiben erhalten.','subtle');
   const button=el('button','Weiterlernen');button.type='button';
   dialog.append(logo,title,intro,list,note,button);doc.body.append(dialog);
   let closed=false;
   const finish=acknowledge=>{
    if(closed)return;closed=true;
    if(acknowledge)acknowledgements.mark(forOwner);
    if(current?.dialog===dialog)current=null;
    if(dialog.open)dialog.close();dialog.remove();
    if(owner===forOwner&&previousFocus?.isConnected)previousFocus.focus();
   };
   current={dialog,finish};button.addEventListener('click',()=>finish(true));
   dialog.addEventListener('cancel',event=>{event.preventDefault();finish(true);});
   dialog.addEventListener('close',()=>finish(true));
   dialog.showModal();button.focus();return true;
  }
 };
}
