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
 if(v.structured)return {op:'decision',args:{basis,reason:combined},kind:'command'};
 const args={reason,counter,refs:[...refs].sort()};
 return basis==='170I'?{op:'indict',args:{...args,act,delict},kind:'command'}:{op:'decision',args:{...args,basis,uncertainty:counter},kind:'command'};
}
export function decisionInput(guide,value,{dialog,submit,isCurrent,currentValue,rich:richText=text=>el('p',text)}){
 if(!guide)return;
 const original=decisionFingerprint(value),draft={basis:'170I',reason:'',counter:'',act:'',delict:'223',refs:[],confirmed:false};
 let step=0,direction='charge',error='',sending=false,drawnStep=-1;
 const modal=dialog(guide.title,target=>{target.classList.add('casefile-decision-dialog');const frame=el('div');frame.className='casefile-decision';const body=el('div');body.className='casefile-decision-content';frame.append(body);target.append(frame);
  const button=(text,fn)=>{const b=el('button',text);b.type='button';b.onclick=fn;return b;};
  const grounds=()=>guide.grounds.filter(g=>direction==='charge'?g.id==='170I':g.id!=='170I');
  const selected=()=>guide.grounds.find(g=>g.id===draft.basis);
  function draw(){const scroll=body.scrollTop;frame.querySelector('.casefile-decision-footer')?.remove();body.replaceChildren();body.append(richText(`${step+1} von 4 · ${['Richtung','Rechtsgrundlage','Abwägung','Zusammenfassung'][step]}`));
   const alert=richText(error);alert.role='alert';body.append(alert);
   if(step===0){body.append(richText(guide.threshold));for(const [id,title]of [['charge','Anklage vorbereiten'],['dismiss','Einstellung prüfen']])body.append(button(title,()=>{direction=id;draft.basis=id==='charge'?'170I':'170II';step=1;draw();}));body.append(richText('Weitere Sachaufklärung ist über „Abbrechen“ und „Ermitteln“ erreichbar.'));}
   if(step===1){for(const g of grounds()){const card=el('section');card.className='card';const pick=button((draft.basis===g.id?'✓ ':'')+g.title,()=>{draft.basis=g.id;draft.confirmed=false;draw();});pick.setAttribute('aria-pressed',String(draft.basis===g.id));card.append(pick,richText(g.law),richText(g.text));body.append(card);}if(['153','153a'].includes(draft.basis))body.append(richText(guide.discretionHint));}
   if(step===2){body.append(richText(guide.balanceHint),richText(guide.draftHint));if(!decisionArguments(guide,value,draft.basis,draft.delict).length)body.append(richText(guide.readHint));
    for(const a of decisionArguments(guide,value,draft.basis,draft.delict)){const box=el('section');box.className='card decision-argument '+(a.favor===null?'neutral':a.favor?'supports':'opposes');const label=a.favor===null?(a.side==='context'?'Einordnung und Aussagekraft':a.side==='charge'?'Belastender Umstand':'Entlastender Umstand'):(a.favor?'+ Spricht für die erwogene Entscheidung':'− Spricht gegen die erwogene Entscheidung');box.append(el('h3',label),richText(a.text),richText('Quellen: '+a.refs.join(', ')),button('In eigenen Entwurf übernehmen',()=>{const key=a.favor===false?'counter':'reason';draft[key]+=(draft[key]?'\n\n':'')+a.text;draft.refs=[...new Set([...draft.refs,...a.refs])];draw();}));body.append(box);}
    const editor=(key,label)=>{const wrap=el('label',label),field=el('textarea');field.rows=4;field.value=draft[key];field.oninput=()=>{draft[key]=field.value;draft.confirmed=false;};wrap.append(field);body.append(wrap);};
    editor('reason','Ihre Begründung');editor('counter','Gegenargument oder offener Punkt');if(draft.basis==='170I'&&!value.structured){editor('act','Konkreter Tatvorwurf');const wrap=el('label','Rechtliche Einordnung'),select=el('select');for(const [id,title]of [['223','§ 223 StGB · vorsätzliche Körperverletzung'],['229','§ 229 StGB · fahrlässige Körperverletzung']]){const o=el('option',title);o.value=id;select.append(o);}select.value=draft.delict;select.onchange=()=>{draft.delict=select.value;draw();};wrap.append(select);body.append(wrap);}
    const sources=el('fieldset');sources.append(el('legend','Bereits gelesene Quellen'));for(const doc of value.documents.filter(d=>d.read)){const label=el('label'),input=el('input');input.type='checkbox';input.checked=draft.refs.includes(doc.id);input.onchange=()=>{draft.refs=input.checked?[...new Set([...draft.refs,doc.id])]:draft.refs.filter(id=>id!==doc.id);draft.confirmed=false;};label.append(input,document.createTextNode(doc.id+' · '+doc.title));sources.append(label);}body.append(sources);
   }
   const explanation=value.structured&&['153','153a'].includes(draft.basis),crime=['THERAPY_A','THERAPY_B'].includes(value.variant)&&['153','153a'].includes(draft.basis);
   if(step===3){const g=selected();body.append(el('h3',g.title),richText(g.law),richText(g.result));if(crime)body.append(richText(guide.crimeHint));else if(explanation)body.append(richText(guide.explanationOnly));else{body.append(el('h3','Ihre Begründung'),richText(draft.reason),el('h3','Gegenargument / offener Punkt'),richText(draft.counter),richText('Quellen: '+draft.refs.join(', ')));if(draft.basis==='170I'&&!value.structured)body.append(richText('Tatvorwurf: '+draft.act),richText('§ '+draft.delict+' StGB'));const label=el('label'),check=el('input');check.type='checkbox';check.checked=draft.confirmed;check.onchange=()=>{draft.confirmed=check.checked;save.disabled=!draft.confirmed;};label.append(check,document.createTextNode(g.confirmation));body.append(label);var save=button('Entscheidung prüfen und sichern',async()=>{if(sending||!isCurrent())return;error='';try{if(decisionFingerprint(currentValue())!==original)throw Error('Der Aktenstand hat sich geändert. Bitte schließen Sie den Entwurf und prüfen Sie die aktuellen Quellen.');const action=decisionAction(value,draft);sending=true;draw();const result=await submit(action.op,action.args,action.kind,()=>modal.close());if(modal.isConnected){error=result?.feedback?.text??'Die Entscheidung konnte nicht gesichert werden. Ihr Entwurf bleibt erhalten.';}}catch(e){error=e.message;}finally{sending=false;if(modal.isConnected)draw();}});save.disabled=sending||!draft.confirmed;body.append(save);}}
   const footer=el('div');footer.className='casefile-decision-footer';if(step>0)footer.append(button('Zurück',()=>{step--;draft.confirmed=false;error='';draw();}));if(step>0&&step<3)footer.append(button('Weiter',()=>{error='';if(step===2&&!explanation&&!crime)try{decisionAction(value,{...draft,confirmed:true});}catch(e){error=e.message;draw();return;}step++;draft.confirmed=false;draw();}));footer.append(button('Abbrechen',()=>{if(!sending)modal.close();}));frame.append(footer);body.scrollTop=drawnStep===step?scroll:0;drawnStep=step;body.closest('dialog')?.querySelector('.context-dialog-header button')?.toggleAttribute('disabled',sending);if(sending)frame.querySelectorAll('button,input,textarea,select').forEach(n=>n.disabled=true);
  }draw();
 });modal.addEventListener('cancel',e=>{if(sending)e.preventDefault();});return modal;
}
