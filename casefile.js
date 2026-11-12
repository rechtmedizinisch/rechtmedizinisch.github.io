import {hasAccess} from './policy.mjs?v=20261111-guided-learning';
import {protectReferences} from './presentation-theme.mjs?v=20261111-guided-learning';
import {referenceIndex,referenceMatches,openReferenceDialog,loadReferenceHelp} from './context-help.mjs?v=20261111-guided-learning';
import {notify} from './feedback.mjs?v=20261111-guided-learning';
import {roleIcon,readingRole} from './reading-style.mjs?v=20261112-casefile-procedure';
import {casefileCatalog,casefileBundleHash,casefileDemoHash} from './casefile-catalog.mjs?v=20261112-casefile-procedure';
import {casefileStore} from './casefile-store.mjs?v=20261111-guided-learning';
import {casefileWorker} from './casefile-worker.mjs?v=20261111-guided-learning';
import {casefileSession} from './casefile-session.mjs?v=20261111-guided-learning';
import {casefileInput} from './casefile-form.mjs?v=20261112-casefile-procedure';
import {practiceAccess} from './practice-access.mjs?v=20261111-guided-learning';
let activeClose=()=>{};
export function closeActiveCasefile(){activeClose();activeClose=()=>{};}
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!=null)n.textContent=protectReferences(String(text));if(cls)n.className=cls;return n;};
const button=(text,fn,cls='secondary')=>{const n=el('button',text,cls);n.type='button';n.onclick=fn;return n;};
const link=(text,href,cls='button secondary')=>{const a=el('a',text,cls);a.href=href;return a;};
export async function renderCasefile(main,auth,grants,user,isCurrent,progress,variant=''){
 main.classList.add('casework','casefile');main.append(link('Zurück zu Üben','#practice'));
 const hero=el('section',null,'knowledge-banner');hero.append(el('p','ÜBEN','section-number'),el('h1','Interaktive Strafakte'));if(!variant)hero.append(el('p',casefileCatalog.title),el('p','Sie übernehmen die Rolle der Staatsanwaltschaft: Quellen prüfen, Belastendes und Entlastendes ermitteln und eine begründete Entscheidung treffen.'));hero.append(el('p','Fiktiver Lernfall · alle Personen und Unterlagen sind erfunden.','subtle'));main.append(hero);
 const premium=!!auth&&!!user&&hasAccess('practice',grants);
 const orientation=el('section',null,'card casefile-orientation');orientation.append(el('h2','So funktioniert die Strafakte'),el('p','1. Anzeige und Unterlagen lesen. 2. Personen auswählen und Fragen anklicken oder weitere Unterlagen anfordern. 3. In der Beweisübersicht Belastendes, Entlastendes und offene Fragen vergleichen und entscheiden.'),el('p','Antworten sind für diesen Lernfall vorbereitet. Eigene Notizen werden gespeichert; sie sind keine Chatfragen.','subtle'));if(!variant)main.append(orientation);
 if(!variant){
  const done=casefileCatalog.variants.filter(v=>progress.snapshot.completedCasefileVariants?.includes(v.id)).length;main.append(el('p',`${done} von ${casefileCatalog.variants.length} Varianten abgeschlossen`,'badge'));
  for(const v of casefileCatalog.variants){if(v.id==='A'||v.id.endsWith('_A'))main.append(el('h2',v.caseTitle??'Fall 1 · Die Knieoperation'));const row=el('section',null,'card');row.append(el('h2',v.title),el('p',v.focus),el('span',v.id==='A'?'Kostenloser Probefall':premium?'Premium freigeschaltet':'Premium','badge'+(!premium&&v.id!=='A'?' lock':'')),link(v.id!=='A'&&!premium?'Premium-Zugang ansehen':progress.snapshot.completedCasefileVariants?.includes(v.id)?'Abgeschlossen · erneut öffnen':'Akte öffnen oder fortsetzen','#casefile/'+v.id));main.append(row);}
  main.append(el('p','Die ausführlichen Aktenstände bleiben in diesem Browser. Ihre Abschlussmarkierungen gehören zum Lernstand.','subtle'));return;
 }
 if(!casefileCatalog.variants.some(v=>v.id===variant)){main.append(el('p','Diese Fallvariante ist nicht verfügbar.'),link('Zur Variantenübersicht','#casefile'));return;}
 if(!practiceAccess('casefile',variant,premium?grants:[])){main.append(el('p','Diese Variante ist in Premium enthalten. Fall A können Sie kostenlos vollständig ausprobieren.','notice'),link('Premium-Zugang ansehen','#shop'),link('Kostenlosen Fall A öffnen','#casefile/A'),link('Zur Variantenübersicht','#casefile'));return;}
 const loading=el('p','Die Strafakte wird geladen …','notice');main.append(loading);
 try{let payload;const expectedHash=premium?casefileBundleHash:casefileDemoHash;if(premium){const delivered=await auth.getCourse('practice:casefile-202611');payload=delivered?.uiAdapters?.[casefileBundleHash]??delivered?.uiAdapter??delivered;}else{const response=await fetch('./casefile-demo-20261111.js?v=20261112-casefile-procedure');if(!response.ok)throw Error('Der Probefall konnte nicht geladen werden.');payload={script:await response.text(),sha256:casefileDemoHash};}if(!isCurrent())return;loading.remove();if(payload?.sha256!==expectedHash)throw Error('Die Strafakte wurde aktualisiert. Bitte laden Sie die Seite erneut.');await renderCasefileContent(main,payload,{owner:user?.id??'guest',variant,isCurrent,progress,expectedHash});}
 catch(error){if(isCurrent()){loading.remove();main.append(el('p',error.message??'Die Strafakte konnte nicht geladen werden.','notice'),button('Erneut versuchen',()=>{if(isCurrent()){main.replaceChildren();renderCasefile(main,auth,grants,user,isCurrent,progress,variant);}}));}}
}
export async function renderCasefileContent(main,payload,{owner,variant,isCurrent,progress,expectedHash=casefileBundleHash}){
 main.classList.add('casework','casefile');main.append(link('Zur Variantenübersicht','#casefile'));
 const files=casefileStore(),header=el('section',null,'card'),status=el('div',null,'notice'),picker=el('select'),body=el('article',null,'casework-reader');picker.setAttribute('aria-label','Bereich der Akte');
 for(const title of ['Akte','Ermitteln','Verfahren','Verlauf']){const option=el('option',title);option.value=title;picker.append(option);}header.append(el('h2',casefileCatalog.variants.find(v=>v.id===variant)?.title??'Strafakte'),status);const shortcuts=el('div',null,'casefile-step-grid');for(const [label,target] of [['Aktuelle Aktenlage','Akte'],['Ermitteln','Ermitteln'],['Verfahrensweg','Verfahren'],['Verlauf','Verlauf']]){const b=button(label,()=>selectTab(target),'secondary casefile-tab');b.dataset.tab=target;const icon=roleIcon({Akte:'facts',Ermitteln:'proof',Verfahren:'reasoning',Verlauf:'history'}[target]);if(icon)b.prepend(icon);shortcuts.append(b);};const inbox=button('Rückläufe',()=>{returnsOnly=true;selectTab('Akte');},'secondary casefile-inbox');inbox.prepend(roleIcon('mail'));header.append(inbox,shortcuts);main.append(header,body);
 let session,closed=false,busy=false,value=null,tab='Akte',documentDialog=null,interviewDialog=null,helperIndex=[],helpers=[];const expanded=new Set(['Menschen']);let returnTimer=null,structuredReason="",queuedReturns=[],returnsOnly=false;
 function scheduleReturns(){clearTimeout(returnTimer);if(showQueuedReturns())return;if(!current()||busy||documentDialog||interviewDialog||document.querySelector('.casefile-dialog[open]')||document.visibilityState!=='visible'||!value?.pendingJobs?.some(j=>j.ready)||value.ended)return;returnTimer=setTimeout(()=>{if(current()&&!busy&&!documentDialog&&!interviewDialog&&!document.querySelector('.casefile-dialog[open]')&&document.visibilityState==='visible')run('collect');},3000);}
 const resumeReturns=()=>scheduleReturns();document.addEventListener('visibilitychange',resumeReturns);
 const current=()=>!closed&&isCurrent();
 const close=()=>{closed=true;clearTimeout(returnTimer);document.removeEventListener('visibilitychange',resumeReturns);session?.close();files.close();document.querySelectorAll('.casefile-dialog').forEach(d=>d.close());};activeClose=close;
 function rich(text){const p=el('p'),plain=protectReferences(String(text??''));let at=0;for(const hit of referenceMatches(plain,helperIndex)){p.append(document.createTextNode(plain.slice(at,hit.start)));const b=button(plain.slice(hit.start,hit.end),()=>{const d=openReferenceDialog(b,hit.entry,helpers);d.classList.add('casefile-dialog');},'context-reference');b.setAttribute('aria-haspopup','dialog');p.append(b);at=hit.end;}p.append(document.createTextNode(plain.slice(at)));return p;}
 function card(title,text,tone='explanation',symbol){tone=readingRole(title,tone);const n=el('section',null,'card casework-card casework-'+tone);const h=el('h3'),icon=roleIcon(symbol??tone);if(icon)h.append(icon);h.append(el('span',title));n.append(h);if(text)n.append(rich(text));return n;}
 function disclosure(title,content){const n=el('details',null,'card');n.append(el('summary',title));let drawn=false;const draw=()=>{if(n.open&&!drawn){drawn=true;content(n);}};n.ontoggle=()=>{if(n.open)expanded.add(title);else expanded.delete(title);draw();};if(expanded.has(title)){n.open=true;draw();}return n;}
 function source(target,key){const item=value?.sources?.[key];if(!item||!/^https:\/\//.test(item[1]))return;const a=link(item[0],item[1],'context-source');a.target='_blank';a.rel='noopener noreferrer';target.append(a);}
 function dialog(title,content){const d=el('dialog',null,'context-dialog casefile-dialog'),head=el('div',null,'context-dialog-header'),opener=document.activeElement;head.append(el('h2',title),button('Schließen',()=>d.close()));d.append(head);content(d);d.addEventListener('close',()=>{d.remove();if(opener?.isConnected)opener.focus({preventScroll:true});scheduleReturns();},{once:true});document.body.append(d);d.showModal();head.querySelector('button').focus();return d;}
 function documentView(doc,mark=true){documentDialog=dialog(doc.title,d=>{d.append(el('p',doc.kind+' · '+doc.author,'subtle'),el('p',doc.sourceLabel??'Fiktiver Aktenauszug','badge'),rich(doc.body));for(const note of doc.teachingNotes??[])d.append(card('Redaktionelle Einordnung',note,'proof'));if(doc.limit)d.append(card('Aussagekraft & Grenzen',doc.limit));});documentDialog.addEventListener('close',()=>{documentDialog=null;scheduleReturns();},{once:true});if(mark&&!doc.read)run('read',{id:doc.id});}
 function action(label,op,args={},kind='command',after=()=>{}){const b=button(label,()=>run(op,value?.structured&&['decision','plea'].includes(op)?{...args,reason:structuredReason}:args,kind,after),'button');b.disabled=busy||!session?.ready;return b;}
 function selectTab(next){tab=next;picker.value=next;draw();header.scrollIntoView({block:'start'});}
 picker.onchange=()=>selectTab(picker.value);
 async function run(op,args={},kind='command',after=()=>{}){
  if(busy||!current()||!session)return;const receipt=op==='note'&&args.key==='_returnNoticeSeen';busy=true;const knownBefore=new Set(value?.documents.map(d=>d.id)??[]);status.textContent='Aktenstand wird gesichert …';draw();
  try{value=kind==='history'?await session.history(args.page):await session.apply(op,args,kind);if(!current())return;if(!value.feedback||value.feedback.kind==='info')after();feedback();const fresh=value.documents.filter(d=>!knownBefore.has(d.id));if(fresh.length&&(documentDialog||interviewDialog||document.querySelector('.casefile-dialog[open]')||['read','ask'].includes(op)))queuedReturns=[...new Set([...queuedReturns,...fresh.map(d=>d.id)])];if(!receipt&&!documentDialog&&!interviewDialog&&!document.querySelector('.casefile-dialog[open]')&&kind!=='history'&&!['read','ask'].includes(op)){if(fresh.length)resultDialog(fresh);else if(['error','warning'].includes(value.feedback?.kind))noticeDialog(value.feedback.kind==='error'?'Schritt noch nicht möglich':'Bitte beachten');else if((value.pendingJobs??[]).length)noticeDialog('Auftrag erteilt');else notify({title:'Schritt gesichert',text:value.feedback?.text??'Ihr Aktenstand wurde gespeichert.'});}return value;}
  catch(error){if(current()){status.textContent=error.message;status.setAttribute('role','alert');notify({kind:'error',title:'Schritt nicht gespeichert',text:error.message});header.append(button('Erneut öffnen',open));}}
  finally{busy=false;if(current()){draw();if(!receipt&&!documentDialog&&!interviewDialog)header.scrollIntoView({block:'start'});}}
 }
 function feedback(){const f=value.feedback;status.dataset.kind=f?.kind??'info';status.replaceChildren();if(f){status.append(rich(f.text));source(status,f.source);}else status.textContent='Aktenstand gesichert.';status.setAttribute('role',f?.kind==='error'?'alert':'status');}
 function draw(){
  if(!current()||!value)return;inbox.replaceChildren(roleIcon('mail'),document.createTextNode('Rückläufe · '+(value.returnInbox??[]).filter(x=>x.unread).length+' ungelesen'));for(const b of shortcuts.querySelectorAll('button')){const selected=b.dataset.tab===tab;b.setAttribute('aria-pressed',String(selected));b.classList.toggle('is-active',selected);}body.replaceChildren();scheduleReturns();header.querySelector('h2').textContent=(casefileCatalog.variants.find(v=>v.id===variant)?.title??'Strafakte')+' · '+value.phaseTitle;
  if(value.flow){const inTrial=['trial','closing','lastword','judgment'].includes(value.phase),completed=inTrial?(value.processGuide?.completed??0):value.flow.completed,total=inTrial?6:value.flow.total;const flow=el('section',null,'card casefile-flow'),meter=el('progress');meter.max=total||1;meter.value=completed;meter.setAttribute('aria-label',inTrial?'Verfahrensstand':'Beweiswege erkundet');flow.append(el('h3',inTrial?'Ihr Verfahrensstand':'Ihr Ermittlungsstand'),el('p',`${completed} von ${total} ${inTrial?'Verfahrensabschnitten':'Beweiswegen'} · ${Math.round(100*completed/Math.max(1,total))} %`),meter,el('p','Diese Anzeige misst Ihre Erkundung. Sie ist kein Schuldmaß und keine gesetzliche Mindestquote.','subtle'));if(value.pendingJobs?.length){flow.append(el('h3','Ausstehende Aufträge'));for(const j of value.pendingJobs)flow.append(el('p',j.title+(j.ready?' · Rücklauf wird vorbereitet …':' · Benötigt noch: '+j.missingTitles.join(', ')),'casefile-pending'));}const steps=el('ol',null,'casefile-flow-steps'),phase=['conditions','minor'].includes(value.phase)?'investigation':value.phase==='lastword'?'closing':value.ended?'judgment':value.phase;for(const step of value.flow.steps){const item=el('li',step.title+(step.id===phase?' · Hier sind Sie':''));item.className=step.id===phase?'is-current':value.flow.visited?.includes(step.id)?'is-complete':'';steps.append(item);}const path=el('details'),pathTitle=el('summary','Verfahrensweg · '+(value.flow.steps.find(s=>s.id===phase)?.title??'Übersicht'));path.append(pathTitle,steps);flow.append(path);body.append(flow);}
  if(tab==='Akte'){
   body.append(el('h3',returnsOnly?'Rückläufe':'Aktuelle Aktenlage'),el('p',`${returnsOnly?'Rückläufe':'Unterlagen'}: ${returnsOnly?(value.returnInbox??[]).length:value.documents.length} · Gelesen: ${value.documents.filter(d=>d.read&&(!returnsOnly||(value.returnInbox??[]).some(x=>x.id===d.id))).length}`,'badge'));
   if(returnsOnly)body.append(button('Alle Unterlagen anzeigen',()=>{returnsOnly=false;draw();}));
   for(const doc of value.documents.filter(d=>!returnsOnly||(value.returnInbox??[]).some(x=>x.id===d.id))){const row=el('section',null,'card');row.append(el('h3',doc.title),el('p',doc.id+' · '+doc.kind,'subtle'),button(doc.read?'Quelle nachlesen':'Quelle öffnen',()=>documentView(doc)));body.append(row);}
   body.append(value.phase==='intake'?action('Ermittlungen aufnehmen','start',{},'command',()=>selectTab('Ermitteln')):button('Ermittlungen & nächste Schritte',()=>selectTab(['intake','investigation','conditions','minor'].includes(value.phase)?'Ermitteln':'Verfahren'),'button'));
  }else if(tab==='Verlauf'){
   body.append(el('p',`${value.totalLogEntries} Einträge · Abschnitt ${value.logPage+1} von ${value.logPages}`));if(value.logPage>0)body.append(action('Neuere Einträge','inspect',{page:value.logPage-1},'history'));
   for(const group of value.historyGroups??[]){const box=card(group.title,group.subtitle,'source');for(const event of group.events){box.append(el('p','Eintrag '+event.number,'subtle'));if(event.question)box.append(card(event.questioner??'Frage',event.question,'question'));box.append(card(event.sourceLabel??'Verfahrenseintrag',event.detail,'facts'));for(const note of event.teachingNotes??[])box.append(card('Redaktionelle Einordnung',note,'proof'));}body.append(box);}if(value.logPage+1<value.logPages)body.append(action('Frühere Einträge anzeigen','inspect',{page:value.logPage+1},'history'));
  }else if(tab==='Ermitteln')investigations();else {reasoningSupport();if(['trial','closing','lastword'].includes(value.phase))guidedTrial();else if(value.structured)structuredProcedure();else procedure();}
  if(tab!=='Akte')body.append(button('Zur aktuellen Aktenlage',()=>selectTab('Akte'),'secondary'));
  if(value.ended)body.append(button('Gesammelte Quellen nachlesen',()=>selectTab('Akte'),'secondary'));
  const tools=el('section',null,'card');tools.append(el('p','Die ausführlichen Aktenstände bleiben in diesem Browser. Ihre Abschlussmarkierungen gehören zum Lernstand.','subtle'),button('Aktenstand als Datei sichern',async()=>{try{const json=await session.export();if(!current())return;const url=URL.createObjectURL(new Blob([json],{type:'application/json'})),a=link('Sicherung speichern',url);a.download=`Recht-Medizinisch-Strafakte-${variant}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(error){notify({title:'Sicherung nicht möglich',text:error.message});}}));body.append(tools);
 }
 function input(title,id,op=id){const b=button(title,()=>casefileInput({id,title,op},value,{dialog,submit:run,isCurrent:current}));b.disabled=busy||!session?.ready;return b;}
 function showQueuedReturns(){
  if(!current()||busy||!session?.ready||documentDialog||interviewDialog||document.querySelector('.casefile-dialog[open]')||(!queuedReturns.length&&!value?.returnNotice))return false;
  const ids=new Set([...queuedReturns,...(value?.returnNotice?.documentIds??[])]);const docs=value?.documents.filter(d=>ids.has(d.id))??[];queuedReturns=[];if(!docs.length)return false;resultDialog(docs);return true;
 }
 function noticeDialog(title){
  documentDialog=dialog(title,box=>{if(value.feedback)box.append(rich(value.feedback.text));source(box,value.feedback?.source);
   for(const job of value.pendingJobs??[])box.append(card(job.title,job.ready?'Der Rücklauf wird nach kurzer simulierter Bearbeitung automatisch angezeigt.':'Noch benötigt: '+job.missingTitles.join(', '),'proof'));
   box.append(button('Zur Ermittlungsübersicht',()=>{documentDialog?.close();selectTab('Ermitteln');}));
  });documentDialog.addEventListener('close',()=>{documentDialog=null;scheduleReturns();},{once:true});
 }
 function resultDialog(docs){
  const receipt=value.returnNotice,ids=new Set([...docs.map(d=>d.id),...(receipt?.documentIds??[])]);
  docs=value.documents.filter(d=>ids.has(d.id));
  let finishClose;const closed=new Promise(resolve=>finishClose=resolve);
  const d=dialog(docs.length===1?'Neue Unterlage':'Neue Unterlagen',box=>{box.append(el('p','Das Ergebnis liegt vor. Öffnen Sie eine Quelle oder prüfen Sie alle bisher gesammelten Beweise.'));for(const doc of docs)box.append(button(doc.title,async()=>{d.close();await closed;if(current())documentView(doc,session?.ready);}));box.append(button('Alle gesammelten Beweise',async()=>{d.close();await closed;if(current())selectTab('Akte');}));});
  documentDialog=d;d.addEventListener('close',async()=>{
   if(documentDialog===d)documentDialog=null;
   try{if(current()&&receipt)await run('note',{key:'_returnNoticeSeen',text:String(receipt.sequence)});}
   finally{finishClose();scheduleReturns();}
  },{once:true});
 }

 function interview(person,trial=false){
  let answer;
  interviewDialog=dialog(person.name,d=>{d.append(el('p',person.role,'subtle'),el('p','Wählen Sie eine Frage. Bereits beantwortete Fragen können Sie jederzeit nachlesen.','notice'));answer=el('section',null,'casefile-answer');answer.setAttribute('aria-live','polite');d.append(answer);
   for(const q of person.questions){const key=trial?'trialAnswer':'answer',saved=q[key];const b=button((saved?'✓ ':'')+q.text+(saved?' · Antwort nachlesen':''),async()=>{
    if(busy)return;let updated=value.interviews.find(p=>p.id===person.id)?.questions.find(x=>x.id===q.id),text=updated?.[key],asked=false;
    if(!text){b.disabled=true;const response=await run(trial?'guidedAsk':'ask',{interview:person.id,question:q.id,trial});if(!current()||!d.isConnected)return;b.disabled=false;if(!response){answer.replaceChildren(card('Nicht gespeichert','Bitte schließen Sie die Befragung und öffnen Sie die Akte erneut. Ihr gesicherter Stand bleibt erhalten.','warning'));return;}asked=true;updated=value.interviews.find(p=>p.id===person.id)?.questions.find(x=>x.id===q.id);text=updated?.[key];}
    answer.replaceChildren();if(text){answer.append(card(updated?.sourceLabel??'Fiktive Antwort',text,'facts'));for(const note of updated?.teachingNotes??[])answer.append(card('Redaktionelle Einordnung',note,'proof'));b.textContent='✓ '+q.text+' · Antwort nachlesen';b.classList.add('is-answered');b.setAttribute('aria-description','Bereits beantwortet');}if(asked&&value.feedback)answer.append(card(text?'Einordnung':'Hinweis zur Frage',value.feedback.text));d.scrollTop=0;
   });if(saved)b.classList.add('is-answered');if(!trial&&!saved&&['trial','closing','lastword','closed','judgment'].includes(value.phase)){b.disabled=true;b.title='Ermittlungsbefragung abgeschlossen. Gerichtliche Fragen im Verfahrensweg stellen.';}d.append(b);}
  });interviewDialog.addEventListener('close',()=>{interviewDialog=null;scheduleReturns();},{once:true});
 }
 function investigations(){
  if(!value.release)body.append(action('Fallbezogene Schweigepflichtentbindung klären','release'));
  if(value.phase==='intake')body.append(action('Ermittlungen aufnehmen','start'));if(value.ended)body.append(card('Ermittlung abgeschlossen','Sie können alle erhobenen Quellen und Antworten nachlesen. Für zusätzliche Ermittlungen öffnen Sie unter Verfahrensweg einen getrennten Vergleichszweig.','focus'));
  for(const group of ['Einstieg','Menschen','Unterlagen','Aufträge','Auswertung'].filter(g=>value.actions.some(a=>a.group===g)))body.append(disclosure(group,n=>{
   for(const a of value.actions.filter(a=>a.group===group)){const box=card(a.title,a.description,'facts',a.interview?'people':'facts');if(a.status==='completed')box.append(el('p','✓ Abgeschlossen · Ergebnis bleibt nachlesbar','badge'));if(a.reason)box.append(rich(value.phase==='intake'?'Nehmen Sie zuerst die Ermittlungen auf. Danach können Sie die nächsten Schritte prüfen.':a.reason));const b=button(a.interview?(a.status==='completed'?'Fragen stellen / Antwort nachlesen':a.status==='pending'?'Auftrag läuft · Status ansehen':'Befragung starten'):a.status==='completed'?'Ergebnis ansehen':a.status==='pending'?'Auftrag läuft · Status ansehen':'Schritt öffnen',()=>{
    if(a.interview&&value.documents.some(d=>d.id===value.interviews.find(p=>p.id===a.interview)?.document))interview(value.interviews.find(p=>p.id===a.interview));else if(a.status==='completed'){const docs=value.documents.filter(d=>a.documentIds?.includes(d.id));if(docs.length)resultDialog(docs);else selectTab('Akte');}else if(a.status==='pending')run('collect');else if(a.id==='A01')selectTab('Akte');else if(['A16','A17'].includes(a.id))selectTab('Verfahren');else if(a.interview)run(a.id,{},'action',()=>{const p=value.interviews.find(p=>p.id===a.interview);if(p&&value.documents.some(d=>d.id===p.document))interview(p);});else if(value.structured)run(a.id,{},'action');else casefileInput({id:a.id,title:a.title,op:a.id,kind:'action'},value,{dialog,submit:run,isCurrent:current});
   });b.disabled=busy||!session?.ready||['blocked','unavailable'].includes(a.status);box.append(b);n.append(box);}
  }));
  body.append(action('Ausstehende Rückläufe prüfen','collect'),button('Zur Verfahrensentscheidung',()=>selectTab('Verfahren'),'button'));
 }
 function pleaDetails(parent,plea){
  parent.append(el('h4',plea.request==='acquit'?'Freispruch beantragt':'Verurteilung beantragt'));
  for(const [key,title]of [['reason','Begründung'],['charge','Tatvorwurf'],['findings','Festgestellte Tatsachen'],['legal','Rechtliche Einordnung'],['counter','Gegenargument'],['doubts','Verbleibende Zweifel'],['sentencing','Strafzumessung']])if(plea[key])parent.append(card(title,plea[key],'reasoning'));
  if(plea.days!=null&&plea.daily!=null)parent.append(el('p',`Beantragt: ${plea.days} Tagessätze zu ${plea.daily} € · fiktive Bemessung`));parent.append(el('p','Angeführte Quellen: '+(plea.refs??[]).join(', '),'subtle'));
 }
 function reasoningSupport(){
  const help=value.reasoning;if(!help)return;if(['investigation','intermediate'].includes(value.phase))body.append(card('Hinreichender Tatverdacht',help.threshold,'focus'));
  body.append(disclosure('Maßstab, Argumente & Formulierungshilfe',box=>{
   box.append(card('Prüfungsmaßstab',help.threshold,'focus'));
   for(const item of help.evidence)box.append(card(item.id+' · '+item.title,item.pro,'facts'),card('Grenze / Gegenargument',item.contra,'proof'));
   box.append(card('Formulierungsvorschlag',help.formulation,'reasoning'),el('p',help.assessment,'subtle'));
   if(value.structured)box.append(button('Gliederung in eigenen Entwurf übernehmen',()=>{structuredReason=help.formulation;draw();}));
   for(const item of value.dismissalGuide??[]){const row=card(item.title,item.text,'proof');source(row,item.source);box.append(row);}
  }));
 }
 function guidedTrial(){
  const guide=value.processGuide;if(!guide)return;
  body.append(card(guide.role,guide.text,'focus'),disclosure('Welcher Beweis zählt im Prozess?',n=>{n.append(rich(guide.proofHint));source(n,'conviction');source(n,'questions');}));
  const last=guide.courtMessages.at(-1);if(last){const box=card(last.title,last.answer,'source');box.append(el('p',last.actor,'badge'),el('p',last.sourceLabel??'Fiktive gerichtliche Befragung','subtle'));for(const note of last.notes)box.append(card('Redaktionelle Einordnung',note,'proof'));body.append(box);}
  for(const control of guide.controls){body.append(action(control.label,control.op,control.args));source(body,control.lawSource);}
  if(value.phase==='trial'&&value.trialStage===3){
   for(const station of value.stations){const row=card((station.completed?'✓ ':'')+station.title,station.description,'source');row.append(action(station.active?'Gerichtliche Erhebung erneut ansehen':station.completed?'Erneute Erhebung prüfen':'Gerichtliche Erhebung öffnen','guidedStation',{station:station.id,...(station.id==='accused'?{response:'speak'}:{})}));
    if(station.active){const person=value.interviews.find(p=>p.id===station.interview);if(person)row.append(button('Staatsanwaltschaft: vorbereitete Nachfragen',()=>interview(person,true)));
     if(value.structured){const label=el('label','Eigene Erklärung zum Beweisergebnis (optional)'),text=el('textarea');text.rows=4;label.append(text);row.append(label,button('Eigene Erklärung dokumentieren',()=>run('trialComment',{text:text.value})));}
     else row.append(input('Erklärung zum Beweisergebnis','comment'));
     row.append(action('§ 257 StPO: Erklärungen & Beweisblock abschließen','guidedEndStation'));
    }body.append(row);
   }
   body.append(action('Gericht: Beweisaufnahme schließen','guidedCloseEvidence'));
   if(!value.structured){body.append(input('Weiteres Beweismittel beantragen','motion'));if(value.feedback?.source==='notice')body.append(action('§ 265 StPO: Verteidigungsmöglichkeit wahren','noticeResponse',{response:'pause'}));}
  }
  if(value.phase==='closing'){
   if(!value.structured)body.append(input('Staatsanwaltschaft: Schlussvortrag vorbereiten','plea','guidedPlea'));
   else {const label=el('label','Antrag, eingeführte Tatsachen, Gegenargument und Zweifel'),text=el('textarea');text.rows=7;text.value=structuredReason;text.oninput=()=>structuredReason=text.value;label.append(text);body.append(label,button('Eigenen Schlussvortrag dokumentieren',()=>run('guidedPlea',{reason:structuredReason})));}
  }
  if(value.phase==='lastword'){
   if(value.closingStep==='defense')body.append(action('Verteidigung: Schlussvortrag anhören','guidedDefenseClosing'));
   else if(value.closingStep==='reply'){body.append(action('Staatsanwaltschaft: auf weitere Erwiderung verzichten','guidedReply'));if(!value.structured)body.append(input('Stattdessen eine Erwiderung formulieren','reply','guidedReply'));else{const label=el('label','Eigene Erwiderung (optional)'),text=el('textarea');text.rows=4;label.append(text);body.append(label,button('Eigene Erwiderung dokumentieren',()=>run('guidedReply',{text:text.value})));}}
   else body.append(action('Gericht: persönliches letztes Wort, Beratung & Urteil','guidedLastWord'));source(body,'lastWord');
  }
  if(['closing','lastword'].includes(value.phase))body.append(value.structured?action('Weitere Beweisaufnahme anregen','reopenEvidence'):input('Weitere Beweisaufnahme anregen','reopenEvidence'));
 }
 function structuredProcedure(){
  const c=value.structured;body.append(card('Die Fallfrage',c.problem,'question'));if(value.judgment)body.append(card(value.judgment.title,value.judgment.reason,'outcome'));else if(value.decision)body.append(card(value.decision.kind,value.decision.reason,'outcome'));
  if(value.solution)body.append(card('Einordnung der Fallvariante',value.solution,'takeaway'));
  if(c.comparison){const row=card('Vergleich mit der Originalentscheidung',c.comparison.comparison,'source');row.append(el('h3',c.comparison.title));if(c.caseNumber===2)row.append(link('Originalfall und Entscheidungsgründe in der Bibliothek','#material/atlas%3Acase-r13'));const a=link('Gesamte Entscheidung · '+c.comparison.kind,c.comparison.url);a.target='_blank';a.rel='noopener noreferrer';row.append(a);body.append(row);}
  if(c.controls.some(x=>x.needsReason)){const label=el('label','Ihre Begründung'),input=el('textarea');input.rows=6;input.value=structuredReason;input.oninput=()=>structuredReason=input.value;label.append(input);body.append(label);}
  for(const control of c.controls){body.append(action(control.label,control.op,{...control.args,...(control.needsReason?{reason:structuredReason}:{})},'command',()=>{if(control.op==='debrief'&&value.ended){progress.markCasefileComplete(variant);notify({title:'Variante abgeschlossen',text:'Ihre Abschlussmarkierung wurde gespeichert.'});}}));source(body,control.lawSource);}
  if(value.phase==='trial'&&value.trialStage===3)for(const person of value.interviews)if(value.introduced.some(x=>x.id===person.document||x===person.document))body.append(button('Gerichtliche Fragen: '+person.name,()=>interview(person,true)));
 }
 function procedure(){
  if(value.plea)body.append(disclosure('Ihr gesicherter Schlussvortrag',n=>pleaDetails(n,value.plea)));
  if(value.snapshots?.length)body.append(disclosure(`Entscheidungsgrundlagen vergleichen · ${value.snapshots.length}`,n=>{for(const s of value.snapshots){const box=card(s.kind+' · '+s.branchId,s.reason);if(s.counter)box.append(card('Gegenargument',s.counter));if(s.uncertainty)box.append(card('Verbleibende Unsicherheit',s.uncertainty));box.append(el('p','Damals bekannte Quellen: '+s.known.join(', '),'subtle'));for(const id of s.refs){const doc=value.documents.find(d=>d.id===id);if(doc)box.append(button(doc.id+' · '+doc.title,()=>documentView(doc,false)));}if(s.introduced?.length)box.append(el('p','Gerichtlich eingeführt: '+s.introduced.map(e=>e.id+' · '+e.method).join('; ')));for(const warning of s.warnings??[])box.append(card(warning.kind==='legal'?'Rechtlich beachten':'Zur weiteren Aufklärung',warning.text));n.append(box);}}));
  if(!value.ended&&value.readiness.length){const n=card('Vor einer Anklage prüfen','Die Anhörung ist keine Voraussetzung jeder Einstellung. Optionale Beweiswege müssen nicht für einen Prozentwert vollständig gesammelt werden.','focus');for(const item of value.readiness){const row=card(item.kind==='legal'?'Voraussetzung vor Anklage':'Weitere Aufklärung',item.text,item.kind==='legal'?'warning':'explanation');source(row,item.source);if(item.action)row.append(button('Passenden Ermittlungsschritt ansehen',()=>selectTab('Ermitteln')));n.append(row);}body.append(n);}
  const actor=id=>({court:'Gericht',accused:'Beschuldigte Person',prosecution:'Staatsanwaltschaft'})[id]??id;
  if(['intermediate','trial','closing','lastword'].includes(value.phase))body.append(disclosure('Andere gerichtliche Erledigung prüfen',n=>{n.append(el('p','Nach Anklage entscheidet das Gericht. Die Voraussetzungen und die erforderlichen Zustimmungen werden gesondert geprüft.'),input('§ 153 Abs. 2 StPO · Einstellung ohne Auflagen prüfen','decision:153','decision'),input('§ 153a Abs. 2 StPO · gerichtlichen Auflagenweg prüfen','decision:153a','decision'));}));
  if(value.phase==='intake')body.append(action('Ermittlungen aufnehmen','start',{},'command',()=>selectTab('Ermitteln')));
  else if(value.phase==='investigation'){
   const options=card('Wie soll das Verfahren weitergehen?','Eine Einstellung, eine Anklage und ein gerichtlicher Schuldspruch haben unterschiedliche Voraussetzungen.','question');
   options.append(input('Einstellung nach § 170 Abs. 2 StPO begründen','decision:170II','decision'),input('§ 153 StPO · ohne Auflagen prüfen','decision:153','decision'),input('§ 153a StPO · Auflagenweg prüfen','decision:153a','decision'),input('Anklage vorbereiten','indict'));body.append(options,button('Weiter ermitteln',()=>selectTab('Ermitteln')));
  }else if(value.phase==='intermediate'){
   body.append(card('Zwischenverfahren','Das Gericht prüft die Eröffnung. Einwendungen und erhebliche Entlastungsbeweise bleiben zu behandeln; eine Eröffnung ist kein Schuldspruch.'),['opened','hypothesis'].includes(value.courtStatus)?action('Hauptverhandlung beginnen','trialStart'):action('Gerichtliche Eröffnungsprüfung fortsetzen','courtReview'),button('Ergänzende Sachaufklärung öffnen',()=>selectTab('Ermitteln')));
  }else if(value.phase==='conditions'&&value.conditions){
   const plan=value.conditions,box=card('Auflagenplan',`${plan.basis==='153aII'?'§ 153a Abs. 2 StPO':'§ 153a Abs. 1 StPO'} · ${plan.deadlineMonths} Monate`);
   for(const item of plan.items)box.append(rich(({P01:'Geldzahlung',P02:'Wiedergutmachung',P03:'Ausgleichsbemühen'})[item.id]+(item.amount!=null?` · ${item.amount} €`:'')+(item.done?' · erfüllt':' · offen')));
   if(plan.status!=='running'){
    box.append(input('Auflagen konkretisieren oder ändern','savePlan'));
    for(const person of plan.basis==='153aII'?['accused','court','prosecution']:['accused','court'])box.append(el('p',actor(person)+': '+(plan.consents[person]||'offen')),action(actor(person)+' · Zustimmung prüfen','consent',{actor:person}),action(actor(person)+' · Ablehnung als Variante prüfen','consent',{actor:person,response:'refuse'}));
    box.append(action('Auflagenprüfung verlassen','cancelDisposition'));
   }else{
    for(const item of plan.items.filter(i=>!i.done))box.append(action('Erfüllungsnachweis für '+item.id+' bestätigen','fulfill',{id:item.id,result:'confirmed'}));
    box.append(input('Einmalige Fristverlängerung begründen','extendDeadline'),action('Fristablauf ohne vollständige Erfüllung prüfen','deadline'),input('Änderung des laufenden Plans prüfen','savePlan'));
   }
   body.append(box,disclosure('Grenzen zulässiger Auflagen',n=>{for(const [kind,title]of [['approbation','Approbation ruhen lassen?'],['profession','Berufsverbot als Auflage?'],['fine','Geldstrafe oder Geldauflage?'],['waiver','Rechteverzicht erzwingen?'],['buyout','Aufklärung durch Zahlung ersetzen?']])n.append(action(title,'invalidCondition',{kind}));}));
  }else if(value.phase==='minor'&&value.minor){
   const minor=value.minor;body.append(card('Einstellung ohne Auflagen',minor.reason,'reasoning'));for(const person of minor.basis==='153II'?['court','accused','prosecution']:['court'])body.append(el('p',actor(person)+': '+(minor.consents[person]||'offen')),action(actor(person)+' · Zustimmung prüfen','minorConsent',{actor:person}),action(actor(person)+' · Ablehnung prüfen','minorConsent',{actor:person,response:'refuse'}));body.append(action('Einstellungsprüfung verlassen','cancelDisposition'));
  }else if(value.phase==='trial'){
   if(value.flow?.hearingChoice){body.append(card('Belehrung und Entscheidung zur Sache','Die angeklagte Person darf schweigen. Personalien und Erklärung zur Sache sind zu unterscheiden. Schweigen ist kein Schuldbeweis.','focus'));source(body,'trialFlow');body.append(action('Angeklagte Person schweigt zur Sache','trialNext',{response:'silence'}),action('Freiwillige Einlassung anhören','trialNext',{response:'speak'}));}else if(value.trialStage<3)body.append(action('Nächster Verfahrensschritt','trialNext'));
   else{
    for(const station of value.stations){const box=card((station.completed?'✓ ':'')+station.title,station.description);box.append(action(station.id==='accused'&&value.flow?'Freiwillige Einlassung auf Wunsch der angeklagten Person':station.active?'Erneut zum Ergebnis':'Beweisstation öffnen','station',{station:station.id,...(station.id==='accused'&&value.flow?{response:'speak'}:{})}));if(station.active){const person=value.interviews.find(p=>p.id===station.interview);if(person)box.append(button('Fragen stellen',()=>interview(person,true)));}body.append(box);}
    body.append(action('Laufende Befragung beenden','endStation'),input('Beweisantrag formulieren','motion'),input('Erklärung zum Beweisergebnis','comment'));
    if(value.feedback?.source==='notice')body.append(action('Vorbereitungszeit nach Hinweis gewähren','noticeResponse',{response:'pause'}));body.append(action('Beweisaufnahme schließen','closeEvidence'));
   }
  }else if(value.phase==='closing')body.append(input('Schlussvortrag & Antrag formulieren','plea'),input('Weitere Beweisaufnahme anregen','reopenEvidence'));
  else if(value.phase==='lastword'){
   body.append(value.closingStep==='defense'?action('Schlussvortrag der Verteidigung anhören','defenseClosing'):value.closingStep==='reply'?input('Erwidern oder auf Erwiderung verzichten','reply'):action('Persönliches letztes Wort & gerichtliche Entscheidung','lastWord'),input('Beweisaufnahme erneut öffnen lassen','reopenEvidence'));
  }else if(value.ended){
   if(value.decision){const d=value.decision,box=card(d.kind,d.reason,'outcome');if(d.counter)box.append(card('Ihr Gegenargument',d.counter));if(d.feedback)box.append(card('Entscheidung einordnen',d.feedback,'reasoning'));body.append(box);}
   if(value.judgment){const j=value.judgment,box=card(j.title,j.reason,'outcome');if(j.example)box.append(card('Fiktive Beispielentscheidung',j.example,'source'));body.append(box);}if(value.solution)body.append(card('Einordnung der Fallvariante',value.solution,'takeaway'));
   if(value.archives.length)body.append(disclosure(`${value.archives.length} bisherige Vergleichszweige`,n=>{for(const branch of value.archives){const box=card(branch.branchId,(branch.judgment??branch.decision)?.reason,'source');if(branch.plea)box.append(disclosure('Damals gehaltener Schlussvortrag',p=>pleaDetails(p,branch.plea)));box.append(el('p','Damals bekannte Quellen: '+branch.known.map(d=>d.id+' · '+d.title).join('; '),'subtle'));n.append(box);}}));
   for(const item of value.rubric)body.append(card(item.title,item.text,item.ok?'reasoning':'proof'));
   const label=el('label','Ihre Nachbesprechung'),reflection=el('textarea');reflection.rows=6;reflection.value=value.notes.reflection??'';label.append(reflection);body.append(label,button('Überlegungen sichern',()=>run('note',{key:'reflection',text:reflection.value})));
   if(progress.snapshot.completedCasefileVariants?.includes(variant))body.append(el('p','✓ Variante abgeschlossen','badge'));
   else body.append(action('Nachbesprechung abschließen','debrief',{},'command',()=>{if(!current()||!value.ended)return;progress.markCasefileComplete(variant);notify(progress.error?{kind:'error',title:'Fortschritt noch nicht gesichert',text:progress.error}:{title:'Variante abgeschlossen',text:'Ihr Fortschritt in der Strafakte wurde gespeichert. Ihr Kursabschluss bleibt unverändert.'});}));
   body.append(disclosure('Einen getrennten Vergleichszweig beginnen',n=>{n.append(el('p','Der bisherige Abschluss bleibt dokumentiert. Der Gerichtsweg wird nötigenfalls ausdrücklich als Übungsannahme behandelt.'),action('Ermittlungen neu bewerten','fork',{target:'investigation'},'command',()=>selectTab('Ermitteln')),action('Gerichtsweg als Vergleich untersuchen','fork',{target:'intermediate'}));}));
  }
 }
 async function open(){
  session?.close();status.textContent='Akte wird geöffnet …';busy=true;
  try{const worker=await casefileWorker(payload.script,expectedHash);if(!current()){worker.close();return;}session=casefileSession({owner,variant,store:files,worker,isCurrent:current});value=await session.open();if(!current())return;const shared=await loadReferenceHelp().catch(()=>({entries:[]}));if(!current())return;
   helpers=[...(shared.entries??[])];const aliases=new Set(helpers.flatMap(e=>[e.title,...(e.aliases??[])]).filter(Boolean).map(t=>t.toLocaleLowerCase('de')));
   for(const [i,g]of (value.glossary??[]).entries())if(!aliases.has(g[0].toLocaleLowerCase('de')))helpers.push({id:'casefile-term-'+i,kind:'term',title:g[0],aliases:[g[0]],body:g[1],sources:g[2]&&value.sources[g[2]]?[{title:value.sources[g[2]][0],url:value.sources[g[2]][1]}]:[]});
   helperIndex=referenceIndex(helpers);feedback();}
  catch(error){if(current()){status.textContent=error.message;status.setAttribute('role','alert');header.append(button('Erneut öffnen',open));}}finally{busy=false;if(current())draw();}
 }
 await open();
}
