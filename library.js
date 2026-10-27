import {renderDefinitions} from './definition-library.mjs?v=20261027-parity54';
import {renderPresentationIndex} from './presentation-index.mjs?v=20261027-parity54';
import {fetchPresentationDownload} from './presentation-download.mjs?v=20261027-parity54';
import {renderSource} from './source-links.mjs?v=20261027-parity54';
import {headingStyle,slideSections,layoutForSlide,protectReferences} from './presentation-theme.mjs?v=20261027-parity54';
import {formatSlideText,downloadSlides} from './slide-tools.js?v=20261027-parity54';
import {hasAccess,safeURL} from './policy.mjs?v=20261027-parity54';
import {hasMaterialAccess} from './material-access.mjs?v=20261027-parity54';
import {fetchGraphicDownload} from './graphic-download.mjs?v=20261027-parity54';
import {renderAtlasReading,renderAtlasFocus,renderPodcastReading} from './atlas-reading.mjs?v=20261027-parity54';
import {atlasDestination,atlasReadingLabel,focusedPodcastNode,materialReadingKey,slideDestination} from './atlas-navigation.mjs?v=20261027-parity54';
import {learningTrail,learningTrailBack,learningTrailLink,learningTrailId,renderLearningPath} from './learning-paths.mjs?v=20261027-parity54';
const groups={atlas:'⚖ Fälle, Schemata & Vertiefungen',glossary:'📖 Begriffe & Gesundheitssystem',career:'🩺 PJ & Berufsstart',professions:'🤝 Gesundheitsberufe',podcast:'🎧 Schaubilder zum Podcast',system:'🧭 Schaubilder Medizinrecht & Gesundheitssystem',slides:'📑 Folien & Vertiefungen'};
const groupDescriptions={glossary:'Zentrale Begriffe, Institutionen und Zusammenhänge verständlich erklärt.',career:'Antworten für PJ, erste Stelle und die ärztliche Weiterbildung.',professions:'Rechtliche Orientierung für Pflege, Rettungsdienst und weitere Gesundheitsberufe.',podcast:'Die Fälle und Fragen aus den Podcastfolgen als Schaubilder.',system:'Grafische Übersichten zu Haftung, Versorgung und Finanzierung.',slides:'Die gesamte Präsentation im Folien-Player mit Suche und direktem Kurseinstieg.'};
groups.special='Spezialkurse';groupDescriptions.special='Thematisch lernen: Grundlagen, passende Fälle und gemeinsame Übungen.';
groupDescriptions.atlas='Prüfungsschemata, vollständige Verfahrensübersichten, Fälle und optionale Kurserläuterungen.';
const categorySymbols={'Berufsrecht':'🪪','Datenschutz & Dokumentation':'🔒','Haftung & Verfahren':'⚖','Kompetenz & Verantwortung':'🛡','Rechtliche Grundlagen':'§','Regelwerke & Standard':'☷','Strafrechtliche Grundlagen':'🏛','PJ & Verantwortung':'🪪','Erste Stelle & Rechte':'📄','Weiterbildung & Kammer':'🎓','Rezepte & Alltag':'💊','Pflege':'🩺','Rettungsdienst':'🚑','Hebammen':'🤱','Physiotherapie':'🚶','Ergotherapie':'✋','Logopädie':'🗣','Psychologie':'🧠','Patientenrechte':'❤','Gesundheitssystem':'🏛','Berufsweg':'🎓','Eigene Praxis':'🏥','Gesundheitsökonomie':'📊','Krankenhaus & Arbeit':'🏥','Gesundheitssystem & Leistungsrecht':'🏛','Rechtliche Grundlagen & Haftung':'⚖','Versicherung & Finanzierung':'📊'};
const careerEntries=[['Vor meinem PJ',['pj-rolle','pj-plan','kompetenz-pj','aufklaerung-pj']],['Vor meiner ersten Stelle',['approbation-start','vertrag-start','arbeitszeit-start','haftpflicht-start','versorgung-start']],['In meiner Weiterbildung',['wbo-start','elogbuch-start','facharzt-start','ueberlastung-start']]];
let entries;
const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text!=null)n.textContent=protectReferences(String(text));if(cls)n.className=cls;return n;};
const anchor=(text,url)=>{const n=node('a',text,'button secondary');n.href=url;return n;};
const scope=e=>e.group==='atlas'?e.scope:e.group==='slides'?'slides':['system','podcast'].includes(e.group)?'diagrams':'knowledge';
export async function courseMaterials(main,no,isCurrent){
 if(!entries){const r=await fetch('./library.json?v=20261027-parity54');if(!r.ok)return;entries=await r.json();}
 if(!isCurrent())return;
 const matching=entries.filter(e=>e.courses?.includes(no));if(!matching.length)return;
 const box=node('section',null,'card');box.append(node('h2','📚 Materialien zu Kurs '+String(no).padStart(2,'0')));
 for(const group of ['atlas','slides','system','podcast','glossary','career','professions']){const items=matching.filter(e=>e.group===group);if(!items.length)continue;const details=node('details');details.append(node('summary',`${groups[group]} · ${items.length} Inhalte`));if(group==='slides'){details.append(node('p',`${items.length} Folien zum Kurs. Öffnen Sie die erste Folie und blättern Sie mit der Foliennavigation weiter.`),anchor('▶ Kursfolien beginnen','#material/'+encodeURIComponent(items[0].id)),anchor('Folienübersicht öffnen','#slides'));}else for(const e of items)details.append(anchor(`${e.free?'Kostenlos · ':''}${e.title} →`,'#material/'+encodeURIComponent(e.id)));box.append(details);}
 main.append(box);
}
export async function renderLibrary(main,id,auth,grants,isCurrent,onlyGroup=null,learningStore=null){
 if(!id&&onlyGroup==='definitions'){await renderDefinitions(main,isCurrent);return;}

 let trail=learningTrail(id);const context=atlasDestination(id);if(id)id=context.id;
 const freeOnly=onlyGroup==='atlas-free';if(freeOnly)onlyGroup='atlas';
 const categoryOnly=onlyGroup==='atlas-terms'?'Begriffe':null;
 if(categoryOnly)onlyGroup='atlas';
 if(!id&&onlyGroup==='glossary')main.append(anchor('Rechts- & Prozessbegriffe entdecken →','#library/atlas-terms'));
 if(!entries){const r=await fetch('./library.json?v=20261027-parity54');if(!r.ok)throw Error('Bibliothek nicht erreichbar');entries=await r.json();}
 if(!isCurrent())return;
 if(!trail.every(key=>key==='presentation-index'||entries.some(e=>e.id===learningTrailId(key))))trail=[];
 const open=e=>hasMaterialAccess(e,grants);
 const badge=e=>node('span',e.group==='special'?'Übersicht':(e.group==='career'&&learningStore?.snapshot.completedCareerTopics.includes(e.id)?'✓ Gelesen · ':'')+(e.free?'Kostenlos':open(e)?'✓ Freigeschaltet':'🔒 Mit Code freischalten'),`badge ${open(e)?'':'lock'}`);
 if(!id&&onlyGroup==='diagrams'){
  main.append(node('h1','🖼 Schaubilder'),node('p','Visuell verstehen: Wählen Sie die Schaubilder zum Podcast oder die thematisch geordneten Übersichten zum Medizinrecht und Gesundheitssystem.'));
  const tiles=node('div',null,'knowledge-tiles');
  for(const [group,description] of [['atlas','Haftung, Fehlerarten und vollständige Verfahrensübersichten mit Erläuterungen.'],['podcast','Die Themen aus dem Podcast von Florian Schlepple und Dr. Philipp Graef auf einen Blick.'],['system','Rechtliche Grundlagen & Haftung · Gesundheitssystem & Leistungsrecht · Versicherung & Finanzierung.']]){
   const items=entries.filter(e=>e.group===group&&(group!=='atlas'||e.graphic)),tile=anchor(group==='atlas'?'⚖ Schemata & Verfahren':groups[group],'#library/'+group);tile.className='knowledge-tile category-'+group;tile.append(node('p',description),node('span',`${items.length} Schaubilder · ${items.filter(e=>e.free).length} kostenlos · Öffnen →`,'subtle'));tiles.append(tile);
  }
  main.append(tiles);return;
 }
 if(!id&&!onlyGroup){
  main.append(node('h1','Wissen & Materialien'),node('p','Wählen Sie einen Bereich – oder suchen Sie gezielt nach einem Begriff.'));
  const search=node('input');search.type='search';search.placeholder='Begriff oder Thema suchen';search.setAttribute('aria-label','Alle Materialien durchsuchen');const result=node('div',null,'library-search-results'),tiles=node('div',null,'knowledge-tiles');
  for(const [group,title] of Object.entries(groups)){const tile=anchor(title,group==='slides'?'#slides':'#library/'+group);tile.className='knowledge-tile category-'+group;tile.append(node('p',groupDescriptions[group]),node('span',(group==='slides'?entries.filter(e=>e.group==='slides').length+' Basisfolien · '+entries.filter(e=>e.group==='atlas').length+' Vertiefungen':entries.filter(e=>e.group===group).length+' Inhalte')+' · Öffnen →','subtle'));tiles.append(tile);}
  search.oninput=()=>{result.replaceChildren();const q=search.value.trim().toLocaleLowerCase('de');tiles.hidden=Boolean(q);if(!q)return;const matches=entries.filter(e=>`${e.title} ${e.category??''}`.toLocaleLowerCase('de').includes(q));result.append(node('p',matches.length+' Treffer'));for(const e of matches.slice(0,30)){const row=node('div',null,'library-row');row.append(badge(e),anchor(e.title+' →','#material/'+encodeURIComponent(e.id)));result.append(row);}if(matches.length>30)result.append(node('p','Bitte grenzen Sie den Suchbegriff weiter ein, um die übrigen Treffer zu finden.'));};main.append(search,result,tiles);return;
 }
 if(!id&&onlyGroup==='atlas'){
  main.append(anchor('← Alle Wissensbereiche','#library'),node('h1',freeOnly?'Kostenlos vertiefen':'Fälle, Schemata & Vertiefungen'),node('p','Wählen Sie eine Inhaltsart und den passenden Kurs. Die zusätzlichen Vertiefungen sind optional.'));
  const filters=node('section',null,'card'),query=node('input'),category=node('select'),course=node('select'),results=node('div');
  const visibleLimit=node('input');visibleLimit.type='hidden';visibleLimit.value='20';visibleLimit.dataset.readingControl='shown';
  query.dataset.readingControl='query';category.dataset.readingControl='category';course.dataset.readingControl='course';filters.dataset.readingRestorable='atlas-index';
  query.type='search';query.placeholder='Thema, Norm oder Aktenzeichen';query.setAttribute('aria-label','Atlas durchsuchen');category.setAttribute('aria-label','Inhaltsart');course.setAttribute('aria-label','Kursbezug');
  for(const label of ['Alle','Prüfungsschemata','Verfahrensübersichten','Fälle & Entscheidungen','Vertiefungen','Begriffe']){const o=node('option',label);o.value=label;category.append(o);}category.value=categoryOnly??(freeOnly?'Alle':'Prüfungsschemata');
  for(let n=0;n<=15;n++){const o=node('option',n?'Kurs '+String(n).padStart(2,'0'):'Alle Kurse');o.value=String(n);course.append(o);}
  let shown=20;const draw=()=>{visibleLimit.value=String(shown);results.replaceChildren();const q=query.value.trim().toLocaleLowerCase('de');const matches=entries.filter(e=>e.group==='atlas'&&(!freeOnly||e.free)&&(category.value==='Alle'||e.category===category.value)&&(!Number(course.value)||e.courses?.includes(Number(course.value)))&&`${e.title} ${e.subtitle??''}`.toLocaleLowerCase('de').includes(q));results.append(node('p',matches.length===1?'1 passender Inhalt':matches.length+' passende Inhalte','subtle'));for(const e of matches.slice(0,shown)){const row=node('article',null,'card library-row');row.append(node('p',e.category,'section-number'),badge(e),anchor(e.title+' →','#material/'+encodeURIComponent(e.id)));if(atlasReadingLabel(e))row.append(node('p',atlasReadingLabel(e),'subtle'));results.append(row);}if(matches.length>shown){const more=node('button','Weitere Inhalte anzeigen · '+(matches.length-shown)+' weitere','secondary');more.onclick=()=>{shown+=20;draw();};results.append(more);}if(!matches.length)results.append(node('p','Keine passenden Inhalte. Ändern Sie den Suchbegriff oder Filter.'));};
  filters.addEventListener('reading-state-restored',()=>{shown=Math.max(20,Math.min(entries.length,Number(visibleLimit.value)||20));draw();});
  query.oninput=()=>{if(query.value)category.value='Alle';shown=20;draw();};category.onchange=course.onchange=()=>{shown=20;draw();};filters.append(query,category,course,visibleLimit);main.append(filters,results);
  main.dataset.readingId='atlas-index:'+(freeOnly?'free':categoryOnly??'all');main.dataset.readingVersion=entries.find(e=>e.group==='atlas'&&e.content)?.content?.contentVersion??'legacy';draw();return;
 }
 if(!id){
  if(onlyGroup==='glossary')main.append(anchor('📖 Alle Begriffe von A bis Z →','#library/definitions'));
  if(onlyGroup&&onlyGroup!=='slides')main.append(anchor('← Alle Wissensbereiche','#library'));
  main.append(node('h1',onlyGroup==='slides'?'Folien & Vertiefungen':groups[onlyGroup]??'Wissen & Materialien'),node('p',onlyGroup==='slides'?`${entries.filter(e=>e.group==='slides').length} Basisfolien · ${entries.filter(e=>e.group==='atlas').length} Fälle, Schemata & Vertiefungen. Gemeinsam durchsuchen und direkt öffnen.`:'Die Inhalte der App – zum Nachschlagen, Vertiefen und Lernen.'));
  if(onlyGroup==='career'){
   const entry=node('section',null,'card career-entry');entry.append(node('h2','🧭 Was steht bei Ihnen als Nächstes an?'),node('p','Wählen Sie Ihren Einstieg. Die Lernkarten helfen Ihnen, Ihre nächsten Schritte zu klären.'));
   for(const [title,ids] of careerEntries){const detail=node('details');detail.append(node('summary',title));for(const id of ids){const item=entries.find(e=>e.id==='career:'+id);if(item)detail.append(anchor(item.title+' →','#material/'+encodeURIComponent(item.id)));}entry.append(detail);}main.append(entry);
  }
  if(onlyGroup==='slides')renderPresentationIndex(main,entries,badge);
  const presentation=node('section',null,'presentation-launch');presentation.append(node('h2','▶ Präsentation'),node('p','Folie für Folie in einer festen Leseansicht – mit direkter Auswahl und Vor-/Zurücknavigation.'),anchor('Präsentation starten →','#material/slides%3A1'));const download=node('button',hasAccess('slides',grants)?'↓ Alle Kursfolien herunterladen':'↓ Kostenlose Folien herunterladen','secondary');download.onclick=async()=>{download.disabled=true;try{const file=await downloadSlides(auth,entries.filter(e=>e.group==='slides'),hasAccess('slides',grants));presentation.querySelector('.download-ready')?.remove();const ready=node('div',null,'download-ready'),save=anchor('↓ Datei jetzt speichern',file.url),preview=anchor('Druckansicht öffnen',file.url);save.download=file.filename;preview.target='_blank';preview.rel='noopener';ready.append(save,preview,node('p','Im Browser drucken oder über „Teilen“ in Dateien sichern.','subtle'));presentation.append(ready);download.textContent='Download erneut vorbereiten';}catch{download.textContent='Download fehlgeschlagen – erneut versuchen';}finally{download.disabled=false;}};const pptx=anchor('↓ Kostenloser Einstieg als PowerPoint','assets/downloads/Recht-Medizinisch-Einstieg.pptx?v=20261027-parity54');pptx.download='Recht-Medizinisch-Einstieg.pptx';presentation.append(pptx,node('p','Die ersten 12 Folieneinträge als PowerPoint: 16 Seiten mit gekennzeichneten Fortsetzungen.','subtle'));presentation.append(download,node('p','Download mit Foliengestaltung und Grafiken als HTML-Datei; im Browser auch als PDF druckbar. Heruntergeladene Dateien bleiben nach Ablauf eines Zugangs erhalten.','subtle'));if(onlyGroup==='slides'){
   const complete=node('button','↓ Vollständige Präsentation als PowerPoint','secondary');
   const feedback=node('p','','subtle');feedback.setAttribute('role','status');
   complete.onclick=async()=>{
    if(!hasAccess('slides',grants)){location.hash='#account';return;}
    complete.disabled=true;feedback.textContent='Download wird vorbereitet …';
    try{const file=await fetchPresentationDownload(auth);if(!isCurrent())return;
     if(complete.dataset.blobUrl)URL.revokeObjectURL(complete.dataset.blobUrl);const url=URL.createObjectURL(file.blob);complete.dataset.blobUrl=url;
     const save=anchor('↓ PowerPoint jetzt speichern',url);save.download=file.filename;
     feedback.replaceChildren(save,node('span',` Datei bereit · ${(file.blob.size/1000000).toLocaleString('de-DE',{maximumFractionDigits:1})} MB. Speichern Sie die Präsentation auf Ihrem Gerät.`));
    }catch(error){feedback.textContent=error.message||'Download derzeit nicht verfügbar. Bitte Zugang prüfen und erneut versuchen.';}
    finally{complete.disabled=false;}
   };
   if(!hasAccess('slides',grants))complete.textContent='🔒 Vollständige PowerPoint · Zugang freischalten';
   presentation.append(complete,node('p','474 Folieninhalte · 749 Seiten mit gekennzeichneten Fortsetzungen. Für einen aktiven Zugang zu allen Kursfolien.','subtle'),feedback);
   presentation.append(anchor('Neue Fälle, Schemata & Vertiefungen →', '#library/atlas'),node('p',entries.filter(e=>e.group==='atlas').length+' zusätzliche Inhalte, nach Thema und Kurs filterbar.','subtle'));
   main.append(presentation);
   const jump=node('section',null,'card slide-course-jump');jump.append(node('p','DIREKT EINSTEIGEN','section-number'),node('h2','Folien nach Kurs öffnen'),node('p','Wählen Sie Ihren Kurs und starten Sie direkt im Folien-Player. Dort blättern Sie vor und zurück oder suchen nach Foliennummer und Thema.'));
   const courseSelect=node('select');courseSelect.setAttribute('aria-label','Kurs für den Folieneinstieg auswählen');
   for(let no=1;no<=15;no++){const option=node('option',`Kurs ${String(no).padStart(2,'0')}`);option.value=String(no);courseSelect.append(option);}
   const start=anchor('▶ Bei Kurs 01 beginnen','#material/slides%3A1'),hint=node('p','','subtle');
   const update=()=>{const no=Number(courseSelect.value),matching=entries.filter(e=>e.group==='slides'&&e.courses?.includes(no));if(!matching.length){start.hidden=true;hint.textContent='Für diesen Kurs sind derzeit keine Folien zugeordnet.';return;}start.hidden=false;start.href='#material/'+encodeURIComponent(matching[0].id);start.textContent=`▶ Kurs ${String(no).padStart(2,'0')} · bei Folie ${matching[0].nativeId} beginnen`;hint.textContent=`${matching.length} zugeordnete Folien · im Player lassen sich auch andere Folien direkt auswählen.`;};
   courseSelect.addEventListener('change',update);jump.append(courseSelect,start,hint);main.append(jump);update();return;
  }
  const search=node('input');search.type='search';search.placeholder='Thema, Beruf oder Begriff suchen';search.setAttribute('aria-label','Materialien durchsuchen');const results=node('div');
  function draw(){
   results.replaceChildren();
   for(const [group,title] of Object.entries(groups)){
    if(onlyGroup&&group!==onlyGroup)continue;
    const matching=entries.filter(e=>e.group===group&&(!categoryOnly||e.category===categoryOnly)&&`${e.title} ${e.category??''} ${e.subtitle??''} ${(e.courses??[]).map(n=>'Kurs '+n).join(' ')}`.toLowerCase().includes(search.value.toLowerCase()));
    if(!matching.length)continue;
    const section=node('section',null,`library-section library-group-${group}`);section.append(node('h2',`${title} · ${matching.length}`));
    if(group==='slides'){
     section.append(node('p','Einzelne Folien lesen, vor- und zurückblättern oder gezielt eine Folie auswählen.'));
     const selector=node('select');selector.setAttribute('aria-label','Folien nach Kurs filtern');
     for(const [value,label] of [['','Alle Kursfolien'],...Array.from({length:15},(_,i)=>[String(i+1),'Kurs '+String(i+1).padStart(2,'0')])]){const option=node('option',label);option.value=value;selector.append(option);}
     const deck=node('div');let page=0;
     function drawDeck(){deck.replaceChildren();const items=matching.filter(e=>!selector.value||e.courses?.includes(Number(selector.value))).sort((a,b)=>Number(a.nativeId)-Number(b.nativeId));const size=8,pages=Math.max(1,Math.ceil(items.length/size));page=Math.min(page,pages-1);
      const controls=node('nav',null,'deck-controls');controls.setAttribute('aria-label','Folienübersicht blättern');
      const prev=node('button','← Zurück','secondary'),next=node('button','Weiter →','secondary');prev.disabled=page===0;next.disabled=page>=pages-1;prev.onclick=()=>{page--;drawDeck();};next.onclick=()=>{page++;drawDeck();};
      controls.append(prev,node('span',`${items.length} Folien · Seite ${page+1} von ${pages}`),next);deck.append(controls);
      const grid=node('div',null,'slide-grid');for(const e of items.slice(page*size,(page+1)*size)){const card=node('article',null,'card slide-preview');card.append(node('p','FOLIE '+e.nativeId,'section-number'),node('h3',e.title),badge(e),anchor('Folie öffnen','#material/'+encodeURIComponent(e.id)));grid.append(card);}deck.append(grid);
     }selector.onchange=()=>{page=0;drawDeck();};section.append(selector,deck);drawDeck();
    }else{
     for(const cat of [...new Set(matching.map(e=>e.category??''))]){const details=node('details');details.open=Boolean(search.value);details.append(node('summary',(categorySymbols[cat]?categorySymbols[cat]+' ':'')+(cat||title)+' · Inhalte öffnen'));for(const e of matching.filter(x=>(x.category??'')===cat)){const row=node('div',null,'library-row');row.append(badge(e),anchor(e.title+' →','#material/'+encodeURIComponent(e.id)));details.append(row);}section.append(details);}
    }results.append(section);
   }
  }
  search.addEventListener('input',draw);main.append(search,results);draw();return;
 }
 const e=entries.find(x=>x.id===id),origin=entries.find(x=>x.id===(trail.length?learningTrailId(trail.at(-1)):context.from)&&['atlas','special','podcast','slides'].includes(x.group));main.append(anchor(learningTrailBack(trail)==='#slides'?'← Folien & Vertiefungen':origin?'← '+(origin.group==='special'?'Zurück zum Spezialkurs':origin.category==='Fälle & Entscheidungen'?'Zurück zum Fall':origin.graphic?'Zurück zum Schaubild':origin.category==='Begriffe'?'Zurück zum Begriff':'Zurück zur Vertiefung'):e?'← '+(e.group==='slides'?'Kursfolien':groups[e.group]):'← Wissen & Materialien',learningTrailBack(trail)??(origin?'#material/'+encodeURIComponent(origin.id):e?(e.group==='slides'?'#slides':e.group==='atlas'&&e.category==='Begriffe'?'#library/atlas-terms':'#library/'+e.group):'#library')));if(!e){main.append(node('h1','Inhalt nicht gefunden'));return;}
 if(e.group==='special'&&e.content){renderLearningPath(main,e.content,entries,grants);return;}
 if(e.group==='atlas'&&atlasReadingLabel(e))main.append(node('p',atlasReadingLabel(e),'subtle'));
 const heading=node('section',null,e.group==='slides'?'':'knowledge-banner');heading.append(node('p',groups[e.group],'section-number'));if(e.group!=='slides'&&categorySymbols[e.category]){const symbol=node('span',categorySymbols[e.category],'knowledge-symbol');symbol.setAttribute('aria-hidden','true');heading.append(symbol);}heading.append(node('h1',e.title));if(e.category)heading.append(node('p',e.category,'knowledge-category'));heading.append(badge(e));main.append(heading);let c=e.content;
 if(!c&&open(e)&&auth){try{c=await auth.getCourse(e.id);}catch(error){if(e.group==='slides')throw error;main.append(node('p','Inhalt konnte nicht geladen werden. Bitte erneut versuchen.','notice'));return;}if(!isCurrent())return;}
 if(!c){main.append(node('p','Für diesen Inhalt benötigen Sie einen passenden Zugang. Wählen Sie Premium oder lösen Sie einen gültigen Freischaltcode ein. Kostenlose Inhalte bleiben frei zugänglich.','notice'),anchor('Zugänge & Kaufoptionen öffnen','#shop'),anchor('Anmelden & Code einlösen →','#account'));return;}
 if(e.group==='slides'&&isCurrent())learningStore?.rememberLocation({kind:'slide',id:e.id,title:e.title});
 if(e.group==='slides'){
  const slides=entries.filter(x=>x.group==='slides'),index=slides.findIndex(x=>x.id===e.id),nav=node('nav',null,'slide-toolbar');nav.setAttribute('aria-label','Foliennavigation');
  if(index>0)nav.append(anchor('← Zurück',learningTrailLink(slideDestination(slides[index-1].id,context.from),trail)));
  const jump=node('select');jump.setAttribute('aria-label','Direkt zu Folie');for(const x of [...slides].sort((a,b)=>Number(a.nativeId)-Number(b.nativeId))){const o=node('option','Folie '+x.nativeId+' · '+x.title);o.value=x.id;o.selected=x.id===e.id;jump.append(o);}jump.onchange=()=>{location.hash=learningTrailLink(slideDestination(jump.value,context.from),trail);};nav.append(jump);
  if(index+1<slides.length)nav.append(anchor('Weiter →',learningTrailLink(slideDestination(slides[index+1].id,context.from),trail)));main.append(nav);
 }
 function box(title,text,cls='card'){const b=node('section',null,cls);b.classList.add('knowledge-detail-card');if(title){const style=headingStyle(title),tone=/^💡|^⚠/u.test(title)?'gold':/^🧩/u.test(title)?'blue':/^⚖/u.test(title)?'indigo':style.tone,h=node('h2');if(style.symbol&&!/^[^A-Za-zÄÖÜäöü0-9]/u.test(title)){const symbol=node('span',style.symbol,style.step?'knowledge-step-number':'knowledge-heading-symbol');symbol.setAttribute('aria-hidden','true');h.append(symbol);}h.append(node('span',style.title));b.append(h);b.classList.add('knowledge-tone-'+tone);}if(text)formatSlideText(b,text);main.append(b);return b;}
 function source(title,url){const href=safeURL(url);if(!href)return;const wrap=node('section',null,'knowledge-source'),a=anchor(title+'',href);a.target='_blank';a.rel='noopener noreferrer';wrap.append(node('span','📚','knowledge-heading-symbol'),node('strong','Originalquelle'),a);main.append(wrap);}
 if(e.courses?.length){const nav=node('nav',null,'course-links');for(const n of e.courses)nav.append(anchor('Kurs '+String(n).padStart(2,'0')+' →','#course/tag-'+String(n).padStart(2,'0')));main.append(nav);}
 async function graphic(name,target=main){
  let src=c.publicAssets?.[name];
  if(!src&&auth){try{const a=await auth.getCourse('asset-v3:'+scope(e)+':'+name);if(a&&['image/png','image/jpeg','image/webp'].includes(a.mime)&&/^[A-Za-z0-9_-]+\.(png|jpg|jpeg|webp)$/.test(a.path))src=await auth.getGraphic(a.path);}catch{}}
  if(!isCurrent())return;
  if(!src){target.append(node('p','Die Grafik konnte nicht geladen werden. Die Lesefassung steht unten bereit.','notice'));return;}
  const illustration=c.illustration?.asset===name?c.illustration:null;
  const figure=node('figure',null,'diagram'),img=node('img');img.src=src;img.alt=illustration?.alt??e.title;img.loading='lazy';
  if(illustration){figure.append(img,node('figcaption',illustration.caption,'subtle'));target.append(figure);return;}
  const zoom=node('button','Grafik vergrößern ⤢','secondary');zoom.type='button';zoom.onclick=()=>{const dialog=node('dialog',null,'image-dialog'),close=node('button','Schließen ×');const full=img.cloneNode();close.onclick=()=>{dialog.close();dialog.remove();};dialog.append(close,full);dialog.addEventListener('close',()=>dialog.remove(),{once:true});document.body.append(dialog);dialog.showModal();};
  const download=node('button','↓ Grafik herunterladen','secondary'),feedback=node('p','','subtle');download.type='button';feedback.setAttribute('role','status');
  download.onclick=async()=>{
   download.disabled=true;feedback.textContent='Download wird vorbereitet …';
   try{
    const file=await fetchGraphicDownload(auth,scope(e),name,c.publicAssets?.[name]);if(!isCurrent())return;
    if(download.dataset.blobUrl)URL.revokeObjectURL(download.dataset.blobUrl);
    const url=URL.createObjectURL(file.blob);download.dataset.blobUrl=url;
    const save=anchor('↓ Grafik jetzt speichern',url);save.download=file.filename;
    feedback.replaceChildren(save,node('span',' Auf dem iPhone über „Teilen“ in Dateien oder Fotos sichern.'));
   }catch(error){feedback.textContent=error.message||'Download derzeit nicht verfügbar. Bitte erneut versuchen.';}
   finally{download.disabled=false;}
  };
  const actions=node('div',null,'diagram-actions');actions.append(zoom,download);
  figure.append(img,actions,feedback,node('figcaption','Für Ihre persönliche Nutzung. Heruntergeladene Dateien bleiben nach Ablauf Ihres Zugangs erhalten.','subtle'));target.append(figure);
 }
 if(['atlas','podcast'].includes(e.group))renderAtlasFocus(main,c,context.focusedStage,e.group);
 if(!c.blocks)for(const name of c.assets??[])await graphic(name);
 if(e.group==='atlas')renderAtlasReading(main,c,entries,{focusedStage:context.focusedStage,originId:context.from,hideFocusBanner:true,learningTrail:trail});
 if(['career:pj-rolle','career:kompetenz-pj','career:haftpflicht-start'].includes(e.id))main.append(anchor('Fall vertiefen: Die unbeschriftete Spritze im PJ →','#material/atlas%3Acase-r54'));
 if(!isCurrent())return;
 if(c.miniCase){const b=box('🧩 Kurzfall',c.miniCase.question),details=node('details');details.append(node('summary','Lösung und Einordnung anzeigen'),node('p',c.miniCase.answer));b.append(details);}
 if(c.explanation){box(c.kind,c.explanation);if(c.relatedMaterials?.length){const related=box('↗ Vertiefen & anwenden');for(const target of c.relatedMaterials)related.append(anchor(target.title+' öffnen','#material/'+encodeURIComponent('atlas:'+target.id)));}box('💡 Für die Praxis',c.practice,'notice');source((c.source??'Rechtsquelle').split(';')[0],c.url);if(e.id==='glossary:richtlinienfaehigkeit'){const related=box('🖼 Passendes Schaubild');related.append(anchor('Schaubild: Wann wird eine Methode zur GKV-Leistung? →','#material/system%3Adirective'));}}
 if(e.group==='career'&&learningStore){const readBox=box('✓ Ihr Lesefortschritt'),mark=node('button'),feedback=node('p');const refresh=()=>{const read=learningStore.snapshot.completedCareerTopics.includes(e.id);mark.textContent=read?'✓ Als gelesen markiert':'Als gelesen markieren';mark.disabled=read;feedback.textContent=learningStore.error??'Diese Markierung ist unabhängig vom Abschluss der 15 Kurse.';};mark.type='button';mark.onclick=()=>{learningStore.markCareerRead(e.id);refresh();};feedback.role='status';readBox.append(mark,feedback);refresh();}
 if(c.points){
  renderPodcastReading(main,c,context.focusedStage);box('⚖ Rechtliche Einordnung',c.clarification,'notice');
  main.dataset.readingId=materialReadingKey('podcast',c.id,focusedPodcastNode(c,context.focusedStage)?context.focusedStage:null,context.from);main.dataset.readingVersion='podcast-stations-v1';
 }
 if(c.nodes){for(const [i,n] of c.nodes.entries())box(`${i+1}. ${n.title}`,n.text);box('💡 Merksatz',c.takeaway,'notice');for(const s of c.sources??[])source(s.title,s.url);}
 if(c.blocks){
 const stage=node('div',null,'slide-stage');stage.classList.add('layout-'+layoutForSlide(c),'slide-variant-'+((Number(c.id)-1)%4));stage.setAttribute('aria-label','Aktuelle Folie');stage.tabIndex=0;main.append(stage);
 const titleBlock=node('div',null,'deck-title');titleBlock.append(node('p',c.eyebrow??'RECHT MEDIZINISCH','eyebrow'),node('h1',e.title));for(const no of e.courses??[])titleBlock.append(anchor('Kurs '+String(no).padStart(2,'0')+' öffnen','#course/tag-'+String(no).padStart(2,'0')));stage.append(titleBlock);
 if([16,28,291,326,371].includes(Number(e.nativeId))){const r=await fetch('./podcasts.json?v=20261027-parity54');if(r.ok){const podcasts=await r.json();if(!isCurrent())return;const course=Number(e.nativeId)===28?1:e.courses?.[0];const box=node('section',null,'slide-block tone-teal');box.append(node('h2','🎧 Podcast hören · Wissen vertiefen'));for(const p of podcasts.filter(p=>Number(e.nativeId)===16?p.no!==14:p.no===course)){box.append(node('h3',p.title),node('p','Passend zu Kurs '+p.no),node('p',p.bridge));const a=anchor('▶ Podcast öffnen',safeURL(p.link));a.target='_blank';a.rel='noopener noreferrer';box.append(a);}stage.append(box);}}
 const {sections,sources}=slideSections(c.blocks);const sectionsGrid=node('div',null,'slide-sections');stage.append(sectionsGrid);
 for(const part of sections){const style=headingStyle(part.title),section=node('section',null,'slide-block tone-'+style.tone);if(part.title){const h=node('h2');if(style.symbol)h.append(node('span',style.symbol,style.step?'step-number':'section-symbol'));h.append(node('span',style.title));section.append(h);}for(const block of part.blocks){if(block.image)await graphic(block.image,section);if(!isCurrent())return;if(block.text)formatSlideText(section,block.text);for(const l of block.links??[]){const url=typeof l==='string'?l:l.url;if(safeURL(url)){const a=anchor((typeof l==='string'?'Quelle':l.label??'Rechtsquelle')+'',url);a.target='_blank';a.rel='noopener noreferrer';section.append(a);}}}sectionsGrid.append(section);}
 if(sources.length){const detail=node('details',null,'deck-sources');detail.append(node('summary','📚 Quellen & Fundstellen'));for(const text of sources){const p=node('p');renderSource(p,text);detail.append(p);}stage.append(detail);}
 const siblings=entries.filter(x=>x.group==='slides'),i=siblings.findIndex(x=>x.id===e.id);const nav=node('nav');if(i>0)nav.append(anchor('← Vorherige Folie',learningTrailLink(slideDestination(siblings[i-1].id,context.from),trail)));if(i+1<siblings.length)nav.append(anchor('Nächste Folie →',learningTrailLink(slideDestination(siblings[i+1].id,context.from),trail)));main.append(nav);
 const toolbar=main.querySelector('.slide-toolbar'),playerHeader=node('div',null,'player-header'),brand=node('div',null,'player-brand'),logo=node('img');logo.src='assets/recht-medizinisch-logo.png';logo.alt='';brand.append(logo,node('strong','Recht Medizinisch'));playerHeader.append(brand,node('span',`Folie ${e.nativeId} · ${i+1} / ${siblings.length}`,'player-position'),anchor(origin?'← '+(origin.category==='Fälle & Entscheidungen'?'Fall':origin.graphic?'Schaubild':origin.category==='Begriffe'?'Begriff':'Vertiefung'):'✕ Übersicht',learningTrailBack(trail)??(origin?'#material/'+encodeURIComponent(origin.id):'#slides')));
 const find=node('button','⌕ Folie finden','secondary');find.type='button';find.onclick=()=>{
  const dialog=node('dialog',null,'slide-search-dialog'),title=node('h2','Folie finden'),close=node('button','Schließen ×','secondary'),search=node('input'),results=node('div');title.id='slide-search-title';dialog.setAttribute('aria-labelledby',title.id);search.type='search';search.placeholder='Foliennummer, Thema oder Kurs';search.setAttribute('aria-label','Folien durchsuchen');
  const draw=()=>{const q=search.value.trim().toLocaleLowerCase('de');const found=siblings.filter(x=>!q||`${x.nativeId} ${x.title} ${(x.courses??[]).map(n=>'Kurs '+n).join(' ')}`.toLocaleLowerCase('de').includes(q));results.replaceChildren(node('p',found.length+' Folien gefunden','subtle'));for(const x of found.slice(0,30)){const a=anchor('Folie '+x.nativeId+' · '+x.title+(open(x)?'':' · 🔒'),learningTrailLink(slideDestination(x.id,context.from),trail));a.onclick=()=>{dialog.close();dialog.remove();};results.append(a);}if(found.length>30)results.append(node('p','Suchbegriff eingrenzen, um weitere passende Folien zu finden.','subtle'));};
  search.oninput=draw;close.onclick=()=>dialog.close();dialog.addEventListener('close',()=>dialog.remove(),{once:true});dialog.append(title,close,search,results);document.body.append(dialog);draw();dialog.showModal();search.focus();
 };playerHeader.append(find);
 const globalSearch=anchor('','#search');globalSearch.className='global-search';globalSearch.setAttribute('aria-label','Gesamte Lernbibliothek durchsuchen');
 const magnifier=document.createElementNS('http://www.w3.org/2000/svg','svg');magnifier.setAttribute('viewBox','0 0 24 24');magnifier.setAttribute('aria-hidden','true');
 const lens=document.createElementNS('http://www.w3.org/2000/svg','circle');lens.setAttribute('cx','10');lens.setAttribute('cy','10');lens.setAttribute('r','6.5');
 const handle=document.createElementNS('http://www.w3.org/2000/svg','path');handle.setAttribute('d','m15 15 6 6');magnifier.append(lens,handle);globalSearch.append(magnifier);playerHeader.append(globalSearch);
 const foot=node('div',null,'player-controls'),progress=node('progress');progress.max=siblings.length;progress.value=i+1;progress.setAttribute('aria-label','Position in der Präsentation');foot.append(nav,progress);
 
 const related=entries.filter(x=>x.group==='atlas'&&x.legacySlideIds?.includes(Number(e.nativeId)));if(related.length){const details=node('details',null,'card');details.append(node('summary','Passende Fälle, Erläuterungen & Schemata'));for(const x of related)details.append(anchor(x.title+' →',learningTrailLink('#material/'+encodeURIComponent(x.id),trail,e.id)));stage.append(details);}
 stage.append(node('p','Inhaltsausgabe: Oktober 2026 · Den fachlichen Prüfstand finden Sie bei den jeweiligen Quellen. Zusätzliches Lernmaterial: Durchblättern erfüllt keine Kursaufgaben.','deck-reading-note'));
 main.classList.add('presentation-player');main.replaceChildren(playerHeader,toolbar,stage,foot);
 if(main.isConnected){document.querySelectorAll('body > header, body > footer').forEach(el=>{el.inert=true;});stage.focus({preventScroll:true});}
 }
}
