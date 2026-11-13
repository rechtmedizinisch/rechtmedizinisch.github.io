const el=(tag,text)=>{const n=document.createElement(tag);if(text!=null)n.textContent=text;return n;};
export const decisionFingerprint=v=>JSON.stringify([v.variant,v.branchId,v.phase,v.defenseOpportunity,v.documents.map(d=>[d.id,!!d.read,d.body])]);
export function decisionArguments(guide,v,basis,delict='223'){
 const read=new Set(v.documents.filter(d=>d.read).map(d=>d.id));
 return (guide.variants[v.variant]?.arguments??[]).filter(a=>a.refs.every(id=>read.has(id))&&(!a.grounds||a.grounds.includes(basis))&&(!(basis==='170I'&&a.delicts)||a.delicts.includes(delict))).map(a=>({...a,favor:typeof a.positions?.[basis]==='boolean'?a.positions[basis]:a.side==='context'?null:basis==='170I'?a.side==='charge':basis==='170II'?a.side==='noCharge':null}));
}
export function decisionAction(v,draft){
 const {basis,reason,counter,refs=[],act='',delict='223',confirmed}=draft;
 if(v.phase!=='investigation')throw Error('Die Entscheidung gehört in das Ermittlungsverfahren. Bitte öffnen Sie den aktuellen Verfahrensabschnitt.');
 if(!confirmed)throw Error('Bitte prüfen und bestätigen Sie die Zusammenfassung.');
 if(!['170I','170II','153','153a'].includes(basis))throw Error('Bitte wählen Sie eine Rechtsgrundlage.');
 if(v.structured&&['153','153a'].includes(basis))throw Error('Dieser Erledigungsweg wird in dieser Fallvariante erläutert, aber nicht als eigener Ablauf durchgeführt.');
 if(reason.trim().length<20||counter.trim().length<10)throw Error('Bitte begründen Sie Ihre Wahl und benennen Sie ein Gegenargument oder einen offenen Punkt.');
 if([reason,counter,act].some(x=>x.length>12000))throw Error('Bitte begrenzen Sie jedes Textfeld auf 12.000 Zeichen.');
 const read=new Set(v.documents.filter(d=>d.read).map(d=>d.id));
 if(!refs.length||refs.some(id=>!read.has(id)))throw Error('Bitte wählen Sie mindestens eine bereits gelesene Quelle.');
 if(!v.structured&&basis==='170I'&&act.trim().length<10)throw Error('Bitte benennen Sie den konkreten Tatvorwurf.');
 const combined=reason+'\n\nGegenargument / offener Punkt: '+counter+'\nQuellen: '+[...refs].sort().join(', ');
 if(v.structured&&new TextEncoder().encode(combined).length>12000)throw Error('Die gemeinsame Begründung ist zu lang. Bitte kürzen Sie Begründung oder Gegenargument; Ihre Eingaben bleiben erhalten.');
 // Existing callers/journals retain their payload. New forms preserve the actual selection.
 const review=draft.argumentIds===undefined?{}:{assessment:basis==='170I'?'charge':basis==='170II'?'noCharge':'discretion',argumentIds:[...draft.argumentIds]};
 if(v.structured)return {op:'decision',args:draft.argumentIds===undefined?{basis,reason:combined}:{basis,reason,counter,refs:[...refs].sort(),...review},kind:'command'};
 const args={reason,counter,refs:[...refs].sort(),...review};
 return basis==='170I'?{op:'indict',args:{...args,act,delict},kind:'command'}:{op:'decision',args:{...args,basis,uncertainty:counter},kind:'command'};
}
export function decisionInput(guide,value,{dialog,submit,isCurrent,currentValue,onInvestigate=()=>{},rich:richText=text=>el('p',text)}){
 if(!guide)return;
 const original=decisionFingerprint(value),draft={basis:'170I',reason:'',counter:'',act:'',delict:'223',refs:[],argumentIds:[],confirmed:false};
 let step=0,direction='charge',error='',sending=false,drawnStep=-1,rejected=false,stale=false;
 const modal=dialog(guide.title,target=>{
  target.classList.add('casefile-decision-dialog');
  const frame=el('div'),body=el('div');frame.className='casefile-decision';body.className='casefile-decision-content';frame.append(body);target.append(frame);
  const button=(text,fn)=>{const b=el('button',text);b.type='button';b.onclick=fn;return b;};
  const options=()=>decisionOptions(guide,value),selected=()=>options().find(g=>g.id===draft.basis);
  const lawLink=g=>{const a=el('a',g.law+' · Voraussetzungen nachlesen');a.href=g.url;a.target='_blank';a.rel='noopener noreferrer';return a;};
  function switchBasis(basis){
   if(['170I','170II'].includes(basis)&&['170I','170II'].includes(draft.basis)&&basis!==draft.basis)[draft.reason,draft.counter]=[draft.counter,draft.reason];
   draft.basis=basis;direction=basis==='170I'?'charge':'dismiss';draft.argumentIds=[];draft.confirmed=false;step=1;error='';rejected=false;draw();
  }
  function argumentCard(title,text,positive){const box=el('section');box.className='card decision-argument '+(positive?'supports':'opposes');box.append(el('h3',(positive?'+ ':'− ')+title),richText(text||'Noch kein Text eingetragen.'));return box;}
  function draw(){
   const scroll=body.scrollTop;frame.querySelector('.casefile-decision-footer')?.remove();body.replaceChildren();
   body.append(richText(`${step+1} von 4 · ${['Richtung','Rechtsgrundlage','Abwägung','Zusammenfassung'][step]}`));
   if(error){const alert=richText(error);alert.role='alert';alert.classList.add('decision-error');body.append(alert);}
   if(stale)body.append(button('Entwurf schließen und aktuelle Akte ansehen',()=>modal.close()));
   if(rejected&&!stale){for(const recovery of decisionRecovery(value,draft))body.append(button(recovery.label,()=>switchBasis(recovery.basis)));body.append(button('Weitere Ermittlungen ansehen',()=>{modal.close();onInvestigate();}));}
   if(step===0){
    body.append(richText(guide.threshold));
    for(const [id,title]of [['charge','Anklage vorbereiten'],['dismiss','Einstellung prüfen']])body.append(button(title,()=>switchBasis(id==='charge'?'170I':'170II')));
    body.append(button('Weiter ermitteln',()=>{modal.close();onInvestigate();}));
   }
   if(step===1){
    for(const g of options().filter(g=>direction==='charge'?g.id==='170I':g.id!=='170I')){
     const card=el('section');card.className='card';
     if(g.available){const pick=button((draft.basis===g.id?'✓ ':'')+g.title,()=>{draft.basis=g.id;draft.argumentIds=[];draft.confirmed=false;draw();});pick.setAttribute('aria-pressed',String(draft.basis===g.id));card.append(pick);}
     else card.append(el('h3',g.title+' · rechtlich einordnen'));
     card.append(richText(g.text),lawLink(g));if(!g.available)card.append(richText(g.reason));body.append(card);
    }
    if(['153','153a'].includes(draft.basis))body.append(richText(guide.discretionHint));
   }
   if(step===2){
    body.append(richText(guide.balanceHint),richText(guide.draftHint));
    const argumentsForCase=decisionArguments(guide,value,draft.basis,draft.delict);
    if(!argumentsForCase.length)body.append(richText(guide.readHint));
    for(const a of argumentsForCase){
     const box=el('section');box.className='card decision-argument '+(a.favor===null?'neutral':a.favor?'supports':'opposes');
     const label=a.favor===null?'Einordnung und Aussagekraft':a.favor?'+ Spricht dafür':'− Spricht dagegen';
     const picked=draft.argumentIds.includes(a.id),pick=button(picked?'✓ Im Entwurf berücksichtigt':'Baustein übernehmen',()=>{Object.assign(draft,decisionAddArgument(draft,a));draw();});pick.disabled=picked;
     box.append(el('h3',label),richText(a.text),richText('Quellen: '+a.refs.join(', ')),pick);body.append(box);
    }
    const editor=(key,label)=>{const wrap=el('label',label),field=el('textarea');wrap.className='decision-editor '+(key==='reason'?'supports':key==='counter'?'opposes':'');field.rows=4;field.value=draft[key];field.oninput=()=>{draft[key]=field.value;draft.confirmed=false;};wrap.append(field);body.append(wrap);};
    editor('reason','+ Ihre Begründung für diesen Weg');editor('counter','− Gegenargument oder offener Punkt');
    if(draft.basis==='170I'&&!value.structured){editor('act','Konkreter Tatvorwurf');const wrap=el('label','Rechtliche Einordnung'),select=el('select');for(const [id,title]of [['223','§ 223 StGB · vorsätzliche Körperverletzung'],['229','§ 229 StGB · fahrlässige Körperverletzung']]){const o=el('option',title);o.value=id;select.append(o);}select.value=draft.delict;select.onchange=()=>{draft.delict=select.value;draft.argumentIds=[];draft.confirmed=false;draw();};wrap.append(select);body.append(wrap);}
    const sources=el('fieldset');sources.append(el('legend','Bereits gelesene Quellen'));for(const doc of value.documents.filter(d=>d.read)){const label=el('label'),input=el('input');input.type='checkbox';input.checked=draft.refs.includes(doc.id);input.onchange=()=>{draft.refs=input.checked?[...new Set([...draft.refs,doc.id])]:draft.refs.filter(id=>id!==doc.id);draft.confirmed=false;};label.append(input,document.createTextNode(doc.id+' · '+doc.title));sources.append(label);}body.append(sources);
   }
   if(step===3){
    const g=selected();body.append(el('h3',g.title),lawLink(g),richText(g.result),argumentCard('Ihre Begründung',draft.reason,true),argumentCard('Gegenargument / offener Punkt',draft.counter,false),richText('Quellen: '+draft.refs.join(', ')));
    if(draft.basis==='170I'&&!value.structured)body.append(richText('Tatvorwurf: '+draft.act),richText('§ '+draft.delict+' StGB'));
    const label=el('label'),check=el('input');check.type='checkbox';check.checked=draft.confirmed;check.onchange=()=>{draft.confirmed=check.checked;save.disabled=sending||stale||!draft.confirmed;};label.append(check,document.createTextNode(g.confirmation));body.append(label);
   }
   const footer=el('div');footer.className='casefile-decision-footer';
   if(step>0)footer.append(button('Zurück',()=>{step--;draft.confirmed=false;error='';rejected=false;draw();}));
   if(step>0&&step<3)footer.append(button('Weiter',()=>{error='';if(!selected().available){error=selected().reason;draw();return;}if(step===2)try{decisionAction(value,{...draft,confirmed:true});}catch(e){error=e.message;draw();return;}step++;draft.confirmed=false;draw();}));
   if(step===3){var save=button(sending?'Wird gesichert …':draft.basis==='170I'?'Anklage einreichen':draft.basis==='170II'?'Einstellung abschließen':'Einstellungsweg beginnen',async()=>{
    if(sending||!isCurrent())return;error='';rejected=false;
    try{if(decisionFingerprint(currentValue())!==original){stale=true;throw Error('Der Aktenstand hat sich geändert. Bitte schließen Sie diesen Entwurf und öffnen Sie die aktuellen Quellen.');}const action=decisionAction(value,draft);sending=true;draw();const result=await submit(action.op,action.args,action.kind,()=>modal.close());if(modal.isConnected&&modal.open){error=result?.feedback?.text??'Die Entscheidung konnte nicht gesichert werden. Ihr Entwurf bleibt erhalten.';rejected=true;}}
    catch(e){error=e.message;rejected=true;}finally{sending=false;if(modal.isConnected&&modal.open)draw();}
   });save.disabled=sending||stale||!draft.confirmed;footer.append(save);}
   frame.append(footer);
   body.scrollTop=error?0:drawnStep===step?scroll:0;drawnStep=step;
   body.closest('dialog')?.querySelector('.context-dialog-header button')?.toggleAttribute('disabled',sending);if(sending)frame.querySelectorAll('button,input,textarea,select').forEach(n=>n.disabled=true);
  }
  draw();
 });modal.addEventListener('cancel',e=>{if(sending)e.preventDefault();});return modal;
}

// Display-only helpers: they neither change the legal engine nor rewrite a saved journal.
export function decisionOptions(guide,v){
 return (guide?.grounds??[]).map(g=>{
  const discretionary=['153','153a'].includes(g.id),felony=['THERAPY_A','THERAPY_B'].includes(v.variant);
  const available=!(v.structured&&discretionary);
  const reason=!available?(felony?'Der untersuchte Vorwurf nach § 212 StGB ist ein Verbrechen. §§ 153 und 153a StPO gelten nur für Vergehen (§ 12 StGB).':'Hier steht die Abgrenzung zwischen Anklage und fehlendem hinreichendem Tatverdacht im Mittelpunkt. Die verlinkten Voraussetzungen erläutern die Ermessenseinstellungen nach §§ 153 und 153a StPO. Für den Abschluss dieses Fallwegs wählen Sie Anklage oder Einstellung nach § 170 Abs. 2 StPO.') : '';
  return {...g,available,reason,url:'https://www.gesetze-im-internet.de/stpo/__'+(discretionary?g.id:'170')+'.html'};
 });
}
export function decisionRecovery(v,draft){
 if(v.phase!=='investigation'||v.ended)return [];
 const options=[{basis:'170II',label:'Stattdessen Einstellung vorbereiten'},{basis:'170I',label:'Stattdessen Anklage vorbereiten'}];
 return options.filter(x=>x.basis!==draft.basis);
}
export function decisionAddArgument(draft,argument){
 if((draft.argumentIds??[]).includes(argument.id))return draft;
 const key=argument.favor===false?'counter':'reason';
 return {...draft,[key]:draft[key]?.includes(argument.text)?draft[key]:(draft[key]?.trim()?draft[key]+'\n\n':'')+argument.text,refs:[...new Set([...(draft.refs??[]),...argument.refs])],argumentIds:[...(draft.argumentIds??[]),argument.id],confirmed:false};
}
