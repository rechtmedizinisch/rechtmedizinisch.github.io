import {officialCourtURL} from './court-sources.mjs?v=20261111-guided-learning';
import {roleIcon,readingHeading} from './reading-style.mjs?v=20261111-guided-learning';
import {hasAccess} from './policy.mjs?v=20261111-guided-learning';
import {protectReferences} from './presentation-theme.mjs?v=20261111-guided-learning';
import {referenceIndex,referenceMatches,openReferenceDialog} from './context-help.mjs?v=20261111-guided-learning';
import {notify} from './feedback.mjs?v=20261111-guided-learning';
import {caseAreas,caseCode,caseAreaLabel,matchesWorkshopCase} from './casework-browse.mjs?v=20261111-guided-learning';
import {workshopCases} from './practice-catalog.mjs?v=20261111-guided-learning';
import {workshopDemoID} from './practice-access.mjs?v=20261111-guided-learning';
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!=null)n.textContent=protectReferences(String(text));if(cls)n.className=cls;return n;};
const button=(label,action,cls='secondary')=>{const n=el('button',label,cls);n.type='button';n.onclick=action;return n;};
const link=(label,href,cls='button secondary')=>{const n=el('a',label,cls);n.href=href;return n;};
export async function renderCasework(main,auth,grants,isCurrent,store,id=''){
 main.append(link('Zurück zu Üben','#practice'));
 const unlocked=!!auth&&hasAccess('practice',grants);
 const loading=el('p','Die Fallwerkstatt wird geladen …','notice');main.append(loading);
 let data;try{if(unlocked)data=await auth.getCourse('practice:casework-202611');else{const response=await fetch('./casework-demo.json?v=20261111-guided-learning');if(response.ok){data=await response.json();if(data.cases.length!==1||data.cases[0].id!==workshopDemoID)throw Error('Invalid demo');const trial=data.cases[0];data.cases=workshopCases.map(row=>row.id===workshopDemoID?trial:{...row,locked:true});}}}catch{data=null;}
 if(!isCurrent())return;loading.remove();
 if(!data||!Array.isArray(data.cases)||!data.cases.length||!Array.isArray(data.help)){
  main.append(el('p','Die Fallwerkstatt konnte nicht geladen werden. Bitte versuchen Sie es erneut.','notice'),button('Erneut versuchen',()=>{if(isCurrent()){main.replaceChildren();renderCasework(main,auth,grants,isCurrent,store,id);}}));return;
 }
 if(!unlocked){const note=el('section',null,'card');note.append(el('strong','Ein Probefall kostenlos'),el('p','Fall 01 lässt sich vollständig ausprobieren. Die weiteren 94 Fälle sind in Premium enthalten.'),link('Premium-Zugang ansehen','#shop'));main.append(note);}
 renderCaseworkContent(main,data,{auth,isCurrent,store,id});
}
export function renderCaseworkContent(main,data,{auth,isCurrent,store,id=''}){
 main.classList.add('casework');const helpers=new Map(data.help.map(e=>[e.id,e])),index=referenceIndex(data.help);
 const header=el('section',null,'knowledge-banner');header.append(el('p','ÜBEN','section-number'),el('h1','Fallwerkstatt'),el('p','Originalfälle verstehen: erst den Sachverhalt lesen, eigene Antworten überlegen und danach die Entscheidung nachvollziehen.'));main.append(header);
 const stateFor=entry=>store.caseworkState(entry.id);
 const summary=()=>data.cases.filter(c=>stateFor(c).completed).length;
 const progress=el('section',null,'card casework-progress');main.append(progress);
 function refreshProgress(){progress.replaceChildren(el('strong',`${summary()} von ${data.cases.length} Fällen bearbeitet`));const bar=el('progress');bar.max=data.cases.length;bar.value=summary();bar.setAttribute('aria-label','Fortschritt der Fallwerkstatt');progress.append(bar);}
 refreshProgress();
 function source(parent,sources){for(const source of sources??[]){try{const url=new URL(officialCourtURL(source.url));if(url.protocol!=='https:')continue;const a=link(source.title,url.href,'context-source');a.target='_blank';a.rel='noopener noreferrer';parent.append(a);}catch{}}}
 function openHelp(owner,entry){
  if(!isCurrent())return;
  if(entry.kind!=='scheme'){const d=openReferenceDialog(owner,entry,data.help);d.classList.add('casework-help');return;}
  const d=el('dialog',null,'context-dialog casework-help'),head=el('div',null,'context-dialog-header'),close=button('Schließen',()=>d.close());head.append(el('h2',entry.title),close);d.append(head);
  d.append(paragraph(entry.body));
  let diagramTarget;if(entry.diagramAsset){diagramTarget=el('section');d.append(diagramTarget);}
  for(const card of entry.proofCards??[])d.append(cardBox(card.title,card.body,'proof'));
  const sections=entry.sections??[];
  if(sections.length>6){
   const details=el('details'),summary=el('summary','Ausführliche Erläuterungen aufklappen');details.append(summary);let populated=false;
   details.ontoggle=()=>{if(!details.open||populated||!isCurrent())return;populated=true;for(const section of sections)details.append(cardBox(section.title,section.body,section.role));};d.append(details);
  }else for(const section of sections)d.append(cardBox(section.title,section.body,section.role));
  source(d,entry.sources);d.addEventListener('close',()=>{d.remove();if(owner.isConnected)owner.focus({preventScroll:true});},{once:true});document.body.append(d);d.showModal();close.focus();if(diagramTarget)graphic(diagramTarget,entry,d);
 }
 async function graphic(target,entry,dialog){
  try{
   let url;
   if(entry.demoGraphic&&/^assets\/practice-demo-[A-Za-z0-9_-]+\.png$/.test(entry.demoGraphic))url='./'+entry.demoGraphic;else{
   const metadata=await auth.getCourse('asset-v3:practice:'+entry.diagramAsset);
   if(!metadata||!['image/png','image/jpeg','image/webp'].includes(metadata.mime)||!/^[A-Za-z0-9_-]+\.(png|jpg|jpeg|webp)$/.test(metadata.path))throw Error('missing graphic');
   url=await auth.getGraphic(metadata.path);}
   if(!isCurrent()||!dialog.isConnected)return;
   const image=el('img');image.src=url;image.alt=entry.title;image.className='casework-scheme-image';target.append(image);
   target.append(button('Schaubild vergrößern',()=>{
    const zoom=el('dialog',null,'image-dialog casework-help'),close=button('Schließen',()=>zoom.close()),full=image.cloneNode();zoom.append(close,full);document.body.append(zoom);zoom.addEventListener('close',()=>{zoom.remove();if(dialog.isConnected)dialog.focus();},{once:true});zoom.showModal();close.focus();
   }));
  }catch{if(isCurrent()&&dialog.isConnected)target.append(el('p','Die Grafik konnte gerade nicht geladen werden. Die Erläuterungen stehen darunter bereit.','notice'));}
 }
 function helpButton(id,label,inline=false){const entry=helpers.get(id);if(!entry)return el('span',label);const b=button(label,()=>openHelp(b,entry),inline?'context-reference':'button secondary casework-help-link');if(!inline){const icon=roleIcon(entry.kind==='scheme'?'focus':entry.kind==='norm'?'source':'question');if(icon)b.prepend(icon);}b.setAttribute('aria-haspopup','dialog');return b;}
 if(!id&&helpers.has('casehelp:pruefpfad')){
  const guide=helpers.get('casehelp:pruefpfad'),b=button(guide.title,()=>openHelp(b,guide),'button secondary');b.setAttribute('aria-haspopup','dialog');header.append(b);
 }
 function plain(parent,value){const text=protectReferences(value);let at=0;for(const hit of referenceMatches(text,index)){parent.append(document.createTextNode(text.slice(at,hit.start)),helpButton(hit.entry.id,text.slice(hit.start,hit.end),true));at=hit.end;}parent.append(document.createTextNode(text.slice(at)));}
 function rich(parent,text){let at=0;for(const match of text.matchAll(/\[\[([^|\]]+)\|([^\]]+)\]\]|\*\*([^*]+)\*\*/g)){plain(parent,text.slice(at,match.index));if(match[1])parent.append(helpButton(match[1],match[2],true));else{const strong=el('strong');rich(strong,match[3]);parent.append(strong);}at=match.index+match[0].length;}plain(parent,text.slice(at));return parent;}
 function paragraph(text,cls){return rich(el('p',null,cls),text??'');}
 function cardBox(title,text,tone='',symbol){const box=el('section',null,'card casework-card casework-'+tone),heading=el('h2'),parts=readingHeading(title),icon=roleIcon(symbol??tone);if(parts.marker)heading.append(el('span',parts.marker,'atlas-step-badge'));else if(icon)heading.append(icon);heading.append(el('span',parts.title));box.append(heading);if(text)box.append(paragraph(text));return box;}
 function helpLinks(entry){const box=cardBox('Nachschlagen, ohne den Fall zu verlassen',null,'source');for(const id of [...entry.normIds,...entry.schemaIds])if(helpers.has(id))box.append(helpButton(id,helpers.get(id).title));return box;}
 const entry=data.cases.find(c=>c.id===id);
 if(id&&!entry){main.append(el('p','Dieser Fall ist nicht verfügbar.','notice'),link('Zur Fallübersicht','#casework'));return;}
 if(!entry){
  const controls=el('section',null,'card casework-controls'),label=el('label','Fall oder Aktenzeichen suchen'),search=el('input'),area=el('select'),topic=el('select');search.id='casework-query';label.htmlFor=search.id;search.type='search';topic.setAttribute('aria-label','Thema');area.setAttribute('aria-label','Rechtsgebiet');
  for(const [key,title] of [['','Alle Rechtsgebiete'],...Object.entries(caseAreas)]){const option=el('option',title);option.value=key;area.append(option);}
  for(const t of ['',...new Set(data.cases.map(c=>c.cluster))]){const o=el('option',t||'Alle Themen');o.value=t;topic.append(o);}controls.append(label,search,area,topic);main.append(controls);
  const list=el('section',null,'casework-list');list.setAttribute('aria-label','Fälle');main.append(list);
  function draw(){list.replaceChildren();const visible=data.cases.filter(c=>matchesWorkshopCase(c,{area:area.value,topic:topic.value,query:search.value}));
   if(!visible.length){list.append(el('p','Keine passenden Fälle.'),button('Suche und Themenfilter zurücksetzen',()=>{search.value='';area.value='';topic.value='';draw();search.focus();}));return;}
   for(const c of visible){const a=link('', '#casework/'+encodeURIComponent(c.id),'card casework-row');a.append(el('span',caseCode(c),'casework-number'));const copy=el('span');copy.append(el('strong',c.title),el('span',caseAreaLabel(c)+' · '+c.cluster,'subtle'),el('small',`${c.source.court} · ${c.source.date} · ${c.source.docket}`));const state=stateFor(c);if(c.locked)copy.append(el('span','Premium','badge lock'));else if(c.id===workshopDemoID)copy.append(el('span','Kostenloser Probefall','badge'));if(state.completed)copy.append(el('span','✓ Bearbeitet','badge'));else if(state.decisionSeen)copy.append(el('small','Entscheidung angesehen','subtle'));a.append(copy,el('span','›'));list.append(a);}
  }search.oninput=draw;area.onchange=()=>{topic.value='';draw();};topic.onchange=draw;draw();return;
 }
 if(entry.locked){main.append(el('h2',entry.title),el('p','Dieser Fall ist in Premium enthalten. Ihr kostenloser Probefall bleibt jederzeit verfügbar.','notice'),link('Premium-Zugang ansehen','#shop'),link('Zum kostenlosen Probefall','#casework/'+encodeURIComponent(workshopDemoID)),link('Zur Fallübersicht','#casework'));return;}
 const reader=el('article',null,'casework-reader'),footer=el('nav',null,'casework-navigation');footer.setAttribute('aria-label','Im Fall blättern');main.append(link('Zur Fallübersicht','#casework'),reader,footer);
 function action(value){if(!isCurrent())return;store.caseworkAction(entry.id,value);refreshProgress();drawReader();reader.scrollIntoView({block:'start'});reader.querySelector('h2')?.focus({preventScroll:true});}
 function drawReader(){
  if(!isCurrent())return;const state=stateFor(entry),step=state.step;reader.replaceChildren();footer.replaceChildren();const title=el('h2',`${caseCode(entry)} · ${entry.title}`);title.tabIndex=-1;reader.append(title,el('p',caseAreaLabel(entry),'badge'),el('p',`${entry.source.court} · ${entry.source.date} · ${entry.source.docket}`,'subtle'),el('p',`${step+1} / 3 · ${['Sachverhalt','Fragen','Entscheidung'][step]}`,'badge'));
  if(step===0){const facts=cardBox('Sachverhalt',null,'facts');entry.facts.forEach(t=>facts.append(paragraph(t)));reader.append(facts,cardBox('Wer ist beteiligt?',entry.roles,'facts','people'),cardBox('Genau unterscheiden',entry.clarification,'proof'));}
  else if(step===1){const questions=cardBox('Ihre Überlegungen',null,'question');questions.append(el('p','Welche Tatsachen und rechtlichen Voraussetzungen sind entscheidend? Formulieren Sie zunächst eine eigene Antwort.','subtle'));entry.questions.forEach((q,i)=>{const row=el('div',null,'casework-question');row.append(el('span',i+1,'casework-number'),paragraph(q.text));questions.append(row);});const facts=el('details',null,'card');facts.append(el('summary','Sachverhalt nochmals lesen'));entry.facts.forEach(t=>facts.append(paragraph(t)));reader.append(questions,facts,helpLinks(entry));}
  else{
   const decision=entry.decision,reasons=cardBox('Warum hat das Gericht so entschieden?',null,'reasoning');decision.reasons.forEach(t=>reasons.append(paragraph(t)));reader.append(cardBox('Das Ergebnis',decision.result,'outcome'),reasons);
   entry.questions.forEach((q,i)=>reader.append(cardBox(`${i+1} · ${q.text}`,decision.answers[i],'reasoning')));
   reader.append(cardBox('Merksatz',decision.takeaway,'takeaway'),cardBox('Heutige Einordnung',decision.lawComparison,'source'),helpLinks(entry));
   const original=el('details',null,'card');original.dataset.noReferenceHelp='';original.append(el('summary','Gerichtstext lesen'),el('p',entry.original.label,'subtle'));
   for(const [key,title] of [['facts','Tatbestand'],['tenor','Tenor'],['reasons','Entscheidungsgründe']])if(entry.original[key])original.append(el('h3',title),el('p',entry.original[key],'casework-original'));
   source(original,entry.source.links.map(url=>({url,title:'Vollständige Originalquelle öffnen'})));reader.append(original);
   if(state.completed)reader.append(el('p','✓ Fall bearbeitet','badge'));else reader.append(button('Fall als bearbeitet markieren',()=>{action('complete');notify({title:'Fall als bearbeitet markiert',text:'Ihr Fortschritt in der Fallwerkstatt wurde gespeichert.'});},'button'));
   if(entry.canonicalMaterialId)reader.append(link('Fall in der Wissensbibliothek','#material/'+encodeURIComponent('atlas:'+entry.canonicalMaterialId)));
   if(entry.relatedCaseIds?.length){const related=cardBox('Fälle im Vergleich');for(const targetId of entry.relatedCaseIds){const target=data.cases.find(c=>c.id===targetId);if(target)related.append(link(caseCode(target)+' · '+target.title,'#casework/'+encodeURIComponent(target.id)));}reader.append(related);}
  }
  footer.append(step?button('Zurück',()=>action('back')):link('Fälle','#casework'));
  footer.append(step<2?button(step===0?'Zu den Fragen':'Entscheidung ansehen',()=>action('next'),'button'):link('Zur Fallübersicht','#casework','button'));
 }
 drawReader();
}
