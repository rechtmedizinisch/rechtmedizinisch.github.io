import {preparePresentationDownload} from './presentation-download.mjs?v=20260930ae';
import {renderSource} from './source-links.mjs?v=20260930ae';
import {headingStyle,slideSections,layoutForSlide} from './presentation-theme.mjs?v=20260930ae';
import {formatSlideText,downloadSlides} from './slide-tools.js?v=20260930ae';
import {hasAccess,safeURL} from './policy.mjs?v=20260930ae';
const groups={glossary:'📖 Begriffe & Gesundheitssystem',career:'🩺 PJ & Berufsstart',professions:'🤝 Gesundheitsberufe',podcast:'🎧 Schaubilder zum Podcast',system:'🧭 Schaubilder Medizinrecht & Gesundheitssystem',slides:'📑 Kursfolien'};
const categorySymbols={'PJ & Verantwortung':'🪪','Erste Stelle & Rechte':'📄','Weiterbildung & Kammer':'🎓','Rezepte & Alltag':'💊','Pflege':'🩺','Rettungsdienst':'🚑','Hebammen':'🤱','Physiotherapie':'🚶','Ergotherapie':'✋','Logopädie':'🗣','Psychologie':'🧠','Patientenrechte':'❤','Gesundheitssystem':'🏛','Berufsweg':'🎓','Eigene Praxis':'🏥','Gesundheitsökonomie':'📊','Krankenhaus & Arbeit':'🏥','Gesundheitssystem & Leistungsrecht':'🏛','Rechtliche Grundlagen & Haftung':'⚖','Versicherung & Finanzierung':'📊'};
const careerEntries=[['Vor meinem PJ',['pj-rolle','pj-plan','kompetenz-pj','aufklaerung-pj']],['Vor meiner ersten Stelle',['approbation-start','vertrag-start','arbeitszeit-start','haftpflicht-start','versorgung-start']],['In meiner Weiterbildung',['wbo-start','elogbuch-start','facharzt-start','ueberlastung-start']]];
let entries;
const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text!=null)n.textContent=text;if(cls)n.className=cls;return n;};
const anchor=(text,url)=>{const n=node('a',text,'button secondary');n.href=url;return n;};
const scope=e=>e.group==='slides'?'slides':['system','podcast'].includes(e.group)?'diagrams':'knowledge';
export async function courseMaterials(main,no,isCurrent){
 if(!entries){const r=await fetch('./library.json?v=20260930ae');if(!r.ok)return;entries=await r.json();}
 if(!isCurrent())return;
 const matching=entries.filter(e=>e.courses?.includes(no));if(!matching.length)return;
 const box=node('section',null,'card');box.append(node('h2','📚 Materialien zu Kurs '+String(no).padStart(2,'0')));
 for(const group of ['slides','system','podcast','glossary','career','professions']){const items=matching.filter(e=>e.group===group);if(!items.length)continue;const details=node('details');details.append(node('summary',`${groups[group]} · ${items.length} Inhalte`));if(group==='slides'){details.append(node('p',`${items.length} Folien zum Kurs. Öffnen Sie die erste Folie und blättern Sie mit der Foliennavigation weiter.`),anchor('▶ Kursfolien beginnen','#material/'+encodeURIComponent(items[0].id)),anchor('Folienübersicht öffnen →','#slides'));}else for(const e of items)details.append(anchor(`${e.free?'Kostenlos · ':''}${e.title} →`,'#material/'+encodeURIComponent(e.id)));box.append(details);}
 main.append(box);
}
export async function renderLibrary(main,id,auth,grants,isCurrent,onlyGroup=null,learningStore=null){
 if(!entries){const r=await fetch('./library.json?v=20260930ae');if(!r.ok)throw Error('Bibliothek nicht erreichbar');entries=await r.json();}
 if(!isCurrent())return;
 const open=e=>e.free||hasAccess(scope(e),grants);
 const badge=e=>node('span',(e.group==='career'&&learningStore?.snapshot.completedCareerTopics.includes(e.id)?'✓ Gelesen · ':'')+(e.free?'Kostenlos':open(e)?'✓ Freigeschaltet':'🔒 Mit Code freischalten'),`badge ${open(e)?'':'lock'}`);
 if(!id&&!onlyGroup){
  main.append(node('h1','Wissen & Materialien'),node('p','Wählen Sie einen Bereich – oder suchen Sie gezielt nach einem Begriff.'));
  const search=node('input');search.type='search';search.placeholder='Begriff oder Thema suchen';search.setAttribute('aria-label','Alle Materialien durchsuchen');const result=node('div',null,'library-search-results'),tiles=node('div',null,'knowledge-tiles');
  for(const [group,title] of Object.entries(groups)){const tile=anchor(title,group==='slides'?'#slides':'#library/'+group);tile.className='knowledge-tile category-'+group;tile.append(node('span',entries.filter(e=>e.group===group).length+' Inhalte · Öffnen →','subtle'));tiles.append(tile);}
  search.oninput=()=>{result.replaceChildren();const q=search.value.trim().toLocaleLowerCase('de');tiles.hidden=Boolean(q);if(!q)return;const matches=entries.filter(e=>`${e.title} ${e.category??''}`.toLocaleLowerCase('de').includes(q));result.append(node('p',matches.length+' Treffer'));for(const e of matches.slice(0,30)){const row=node('div',null,'library-row');row.append(badge(e),anchor(e.title+' →','#material/'+encodeURIComponent(e.id)));result.append(row);}if(matches.length>30)result.append(node('p','Bitte grenzen Sie den Suchbegriff weiter ein, um die übrigen Treffer zu finden.'));};main.append(search,result,tiles);return;
 }
 if(!id){
  if(onlyGroup&&onlyGroup!=='slides')main.append(anchor('← Alle Wissensbereiche','#library'));
  main.append(node('h1',onlyGroup==='slides'?'Kursfolien':groups[onlyGroup]??'Wissen & Materialien'),node('p',onlyGroup==='slides'?'Ihre Präsentation: gezielt auswählen und Folie für Folie durcharbeiten.':'Die Inhalte der App – zum Nachschlagen, Vertiefen und Lernen.'));
  if(onlyGroup==='career'){
   const entry=node('section',null,'card career-entry');entry.append(node('h2','🧭 Was steht bei Ihnen als Nächstes an?'),node('p','Wählen Sie Ihren Einstieg. Die Lernkarten helfen Ihnen, Ihre nächsten Schritte zu klären.'));
   for(const [title,ids] of careerEntries){const detail=node('details');detail.append(node('summary',title));for(const id of ids){const item=entries.find(e=>e.id==='career:'+id);if(item)detail.append(anchor(item.title+' →','#material/'+encodeURIComponent(item.id)));}entry.append(detail);}main.append(entry);
  }
  const presentation=node('section',null,'presentation-launch');presentation.append(node('h2','▶ Präsentation'),node('p','Folie für Folie in einer festen Leseansicht – mit direkter Auswahl und Vor-/Zurücknavigation.'),anchor('Präsentation starten →','#material/slides%3A1'));const download=node('button',hasAccess('slides',grants)?'↓ Alle Kursfolien herunterladen':'↓ Kostenlose Folien herunterladen','secondary');download.onclick=async()=>{download.disabled=true;try{const file=await downloadSlides(auth,entries.filter(e=>e.group==='slides'),hasAccess('slides',grants));presentation.querySelector('.download-ready')?.remove();const ready=node('div',null,'download-ready'),save=anchor('↓ Datei jetzt speichern',file.url),preview=anchor('Druckansicht öffnen ↗',file.url);save.download=file.filename;preview.target='_blank';preview.rel='noopener';ready.append(save,preview,node('p','Im Browser drucken oder über „Teilen“ in Dateien sichern.','subtle'));presentation.append(ready);download.textContent='Download erneut vorbereiten';}catch{download.textContent='Download fehlgeschlagen – erneut versuchen';}finally{download.disabled=false;}};const pptx=anchor('↓ Kostenloser Einstieg als PowerPoint','assets/downloads/Recht-Medizinisch-Einstieg.pptx?v=20260930ae');pptx.download='Recht-Medizinisch-Einstieg.pptx';presentation.append(pptx,node('p','Die ersten 12 Folieneinträge als PowerPoint: 16 Seiten mit gekennzeichneten Fortsetzungen.','subtle'));presentation.append(download,node('p','Download mit Foliengestaltung und Grafiken als HTML-Datei; im Browser auch als PDF druckbar. Heruntergeladene Dateien bleiben nach Ablauf eines Zugangs erhalten.','subtle'));if(onlyGroup==='slides'){
   const complete=node('button','↓ Vollständige Präsentation als PowerPoint','secondary');
   const feedback=node('p','','subtle');feedback.setAttribute('role','status');
   complete.onclick=async()=>{
    if(!hasAccess('slides',grants)){location.hash='#account';return;}
    complete.disabled=true;feedback.textContent='Download wird vorbereitet …';
    try{const file=await preparePresentationDownload(auth);if(!isCurrent())return;
     const save=anchor('↓ PowerPoint jetzt speichern',file.url);save.download=file.filename;
     feedback.replaceChildren(save,node('span',' Der Download-Link gilt zwei Minuten. Danach bitte erneut vorbereiten.'));
    }catch(error){feedback.textContent=error.message||'Download derzeit nicht verfügbar. Bitte Zugang prüfen und erneut versuchen.';}
    finally{complete.disabled=false;}
   };
   if(!hasAccess('slides',grants))complete.textContent='🔒 Vollständige PowerPoint · Zugang freischalten';
   presentation.append(complete,node('p','474 Folieninhalte · 749 Seiten mit gekennzeichneten Fortsetzungen. Für einen aktiven Zugang zu allen Kursfolien.','subtle'),feedback);
   main.append(presentation);
  }
  const search=node('input');search.type='search';search.placeholder='Thema, Beruf oder Begriff suchen';search.setAttribute('aria-label','Materialien durchsuchen');const results=node('div');
  function draw(){
   results.replaceChildren();
   for(const [group,title] of Object.entries(groups)){
    if(onlyGroup&&group!==onlyGroup)continue;
    const matching=entries.filter(e=>e.group===group&&`${e.title} ${e.category??''} ${e.subtitle??''} ${(e.courses??[]).map(n=>'Kurs '+n).join(' ')}`.toLowerCase().includes(search.value.toLowerCase()));
    if(!matching.length)continue;
    const section=node('section',null,'library-section');section.append(node('h2',`${title} · ${matching.length}`));
    if(group==='slides'){
     section.append(node('p','Einzelne Folien lesen, vor- und zurückblättern oder gezielt eine Folie auswählen.'));
     const selector=node('select');selector.setAttribute('aria-label','Folien nach Kurs filtern');
     for(const [value,label] of [['','Alle Kursfolien'],...Array.from({length:15},(_,i)=>[String(i+1),'Kurs '+String(i+1).padStart(2,'0')])]){const option=node('option',label);option.value=value;selector.append(option);}
     const deck=node('div');let page=0;
     function drawDeck(){deck.replaceChildren();const items=matching.filter(e=>!selector.value||e.courses?.includes(Number(selector.value)));const size=8,pages=Math.max(1,Math.ceil(items.length/size));page=Math.min(page,pages-1);
      const controls=node('nav',null,'deck-controls');controls.setAttribute('aria-label','Folienübersicht blättern');
      const prev=node('button','← Zurück','secondary'),next=node('button','Weiter →','secondary');prev.disabled=page===0;next.disabled=page>=pages-1;prev.onclick=()=>{page--;drawDeck();};next.onclick=()=>{page++;drawDeck();};
      controls.append(prev,node('span',`${items.length} Folien · Seite ${page+1} von ${pages}`),next);deck.append(controls);
      const grid=node('div',null,'slide-grid');for(const e of items.slice(page*size,(page+1)*size)){const card=node('article',null,'card slide-preview');card.append(node('p','FOLIE '+e.nativeId,'section-number'),node('h3',e.title),badge(e),anchor('Folie öffnen →','#material/'+encodeURIComponent(e.id)));grid.append(card);}deck.append(grid);
     }selector.onchange=()=>{page=0;drawDeck();};section.append(selector,deck);drawDeck();
    }else{
     for(const cat of [...new Set(matching.map(e=>e.category??''))]){const details=node('details');details.open=Boolean(search.value);details.append(node('summary',(categorySymbols[cat]?categorySymbols[cat]+' ':'')+(cat||title)+' · Inhalte öffnen'));for(const e of matching.filter(x=>(x.category??'')===cat)){const row=node('div',null,'library-row');row.append(badge(e),anchor(e.title+' →','#material/'+encodeURIComponent(e.id)));details.append(row);}section.append(details);}
    }results.append(section);
   }
  }
  search.addEventListener('input',draw);main.append(search,results);draw();return;
 }
 const e=entries.find(x=>x.id===id);main.append(anchor(e?'← '+(e.group==='slides'?'Kursfolien':groups[e.group]):'← Wissen & Materialien',e?(e.group==='slides'?'#slides':'#library/'+e.group):'#library'));if(!e){main.append(node('h1','Inhalt nicht gefunden'));return;}
 const heading=node('section',null,e.group==='slides'?'':'knowledge-banner');heading.append(node('p',groups[e.group],'section-number'));if(e.group!=='slides'&&categorySymbols[e.category]){const symbol=node('span',categorySymbols[e.category],'knowledge-symbol');symbol.setAttribute('aria-hidden','true');heading.append(symbol);}heading.append(node('h1',e.title));if(e.category)heading.append(node('p',e.category,'knowledge-category'));heading.append(badge(e));main.append(heading);let c=e.content;
 if(!c&&open(e)&&auth){try{c=await auth.getCourse(e.id);}catch{main.append(node('p','Inhalt konnte nicht geladen werden. Bitte erneut versuchen.','notice'));return;}if(!isCurrent())return;}
 if(!c){main.append(node('p','Für diesen Inhalt benötigen Sie einen gültigen Freischaltcode. Die kostenlosen Einstiege bleiben ohne Anmeldung zugänglich.','notice'),anchor('Anmelden & Zugang freischalten →','#account'));return;}
 if(e.group==='slides'){
  const slides=entries.filter(x=>x.group==='slides'),index=slides.findIndex(x=>x.id===e.id),nav=node('nav',null,'slide-toolbar');nav.setAttribute('aria-label','Foliennavigation');
  if(index>0)nav.append(anchor('← Zurück','#material/'+encodeURIComponent(slides[index-1].id)));
  const jump=node('select');jump.setAttribute('aria-label','Direkt zu Folie');for(const x of slides){const o=node('option','Folie '+x.nativeId+' · '+x.title);o.value=x.id;o.selected=x.id===e.id;jump.append(o);}jump.onchange=()=>{location.hash='#material/'+encodeURIComponent(jump.value);};nav.append(jump);
  if(index+1<slides.length)nav.append(anchor('Weiter →','#material/'+encodeURIComponent(slides[index+1].id)));main.append(nav);
 }
 function box(title,text,cls='card'){const b=node('section',null,cls);if(title){const theme=/merksatz|praxis|merke/i.test(title)?'💡 ':/sachverhalt|fall/i.test(title)?'🧩 ':/problem|achtung|risik/i.test(title)?'⚠ ':/quelle|fundstelle/i.test(title)?'📚 ':/prüfung|schritt/i.test(title)?'✓ ':'';b.append(node('h2',/^[^A-Za-zÄÖÜäöü0-9]/.test(title)?title:theme+title));if(theme==='💡 ')b.classList.add('takeaway');if(theme==='⚠ ')b.classList.add('caution');}if(text)b.append(node('p',text));main.append(b);return b;}
 function source(title,url){const href=safeURL(url);if(!href)return;const a=anchor(title+' ↗',href);a.target='_blank';a.rel='noopener noreferrer';main.append(a);}
 if(e.courses?.length){const nav=node('nav',null,'course-links');for(const n of e.courses)nav.append(anchor('Kurs '+String(n).padStart(2,'0')+' →','#course/tag-'+String(n).padStart(2,'0')));main.append(nav);}
 async function graphic(name,target=main){
  let src=c.publicAssets?.[name];
  if(!src&&auth){try{const a=await auth.getCourse('asset-v3:'+scope(e)+':'+name);if(a&&['image/png','image/jpeg','image/webp'].includes(a.mime)&&/^[A-Za-z0-9_-]+\.(png|jpg|jpeg|webp)$/.test(a.path))src=await auth.getGraphic(a.path);}catch{}}
  if(!isCurrent())return;
  if(!src){target.append(node('p','Die Grafik konnte nicht geladen werden. Die Lesefassung steht unten bereit.','notice'));return;}
  const figure=node('figure',null,'diagram'),img=node('img');img.src=src;img.alt=e.title;img.loading='lazy';
  const zoom=node('button','Grafik vergrößern ⤢','secondary');zoom.type='button';zoom.onclick=()=>{const dialog=node('dialog',null,'image-dialog'),close=node('button','Schließen ×');const full=img.cloneNode();close.onclick=()=>{dialog.close();dialog.remove();};dialog.append(close,full);dialog.addEventListener('close',()=>dialog.remove(),{once:true});document.body.append(dialog);dialog.showModal();};figure.append(img,zoom);target.append(figure);
 }
 if(!c.blocks)for(const name of c.assets??[])await graphic(name);
 if(!isCurrent())return;
 if(c.miniCase){const b=box('🧩 Kurzfall',c.miniCase.question),details=node('details');details.append(node('summary','Lösung und Einordnung anzeigen'),node('p',c.miniCase.answer));b.append(details);}
 if(c.explanation){box(c.kind,c.explanation);box('💡 Für die Praxis',c.practice,'notice');source((c.source??'Rechtsquelle').split(';')[0],c.url);if(e.id==='glossary:richtlinienfaehigkeit'){const related=box('🖼 Passendes Schaubild');related.append(anchor('Schaubild: Wann wird eine Methode zur GKV-Leistung? →','#material/system%3Adirective'));}}
 if(e.group==='career'&&learningStore){const readBox=box('✓ Ihr Lesefortschritt'),mark=node('button'),feedback=node('p');const refresh=()=>{const read=learningStore.snapshot.completedCareerTopics.includes(e.id);mark.textContent=read?'✓ Als gelesen markiert':'Als gelesen markieren';mark.disabled=read;feedback.textContent=learningStore.error??'Diese Markierung ist unabhängig vom Abschluss der 15 Kurse.';};mark.type='button';mark.onclick=()=>{learningStore.markCareerRead(e.id);refresh();};feedback.role='status';readBox.append(mark,feedback);refresh();}
 if(c.points){const b=box('Kernpunkte');const ul=node('ul');for(const p of c.points)ul.append(node('li',p));b.append(ul);box('⚖ Rechtliche Einordnung',c.clarification,'notice');}
 if(c.nodes){for(const [i,n] of c.nodes.entries())box(`${i+1}. ${n.title}`,n.text);box('💡 Merksatz',c.takeaway,'notice');for(const s of c.sources??[])source(s.title,s.url);}
 if(c.blocks){
 const stage=node('div',null,'slide-stage');stage.classList.add('layout-'+layoutForSlide(c),'slide-variant-'+((Number(c.id)-1)%4));stage.setAttribute('aria-label','Aktuelle Folie');stage.tabIndex=0;main.append(stage);
 const titleBlock=node('div',null,'deck-title');titleBlock.append(node('p',c.eyebrow??'RECHT MEDIZINISCH','eyebrow'),node('h1',e.title));for(const no of e.courses??[])titleBlock.append(anchor('Kurs '+String(no).padStart(2,'0')+' öffnen →','#course/tag-'+String(no).padStart(2,'0')));stage.append(titleBlock);
 if([16,28,291,326,371].includes(Number(e.nativeId))){const r=await fetch('./podcasts.json?v=20260930ae');if(r.ok){const podcasts=await r.json();if(!isCurrent())return;const course=Number(e.nativeId)===28?1:e.courses?.[0];const box=node('section',null,'slide-block tone-teal');box.append(node('h2','🎧 Podcast hören · Wissen vertiefen'));for(const p of podcasts.filter(p=>Number(e.nativeId)===16?p.no!==14:p.no===course)){box.append(node('h3',p.title),node('p','Passend zu Kurs '+p.no),node('p',p.bridge));const a=anchor('▶ Podcast öffnen',safeURL(p.link));a.target='_blank';a.rel='noopener noreferrer';box.append(a);}stage.append(box);}}
 const {sections,sources}=slideSections(c.blocks);const sectionsGrid=node('div',null,'slide-sections');stage.append(sectionsGrid);
 for(const part of sections){const style=headingStyle(part.title),section=node('section',null,'slide-block tone-'+style.tone);if(part.title){const h=node('h2');if(style.symbol)h.append(node('span',style.symbol,style.step?'step-number':'section-symbol'));h.append(node('span',style.title));section.append(h);}for(const block of part.blocks){if(block.image)await graphic(block.image,section);if(!isCurrent())return;if(block.text)formatSlideText(section,block.text);for(const l of block.links??[]){const url=typeof l==='string'?l:l.url;if(safeURL(url)){const a=anchor((typeof l==='string'?'Quelle':l.label??'Rechtsquelle')+' ↗',url);a.target='_blank';a.rel='noopener noreferrer';section.append(a);}}}sectionsGrid.append(section);}
 if(sources.length){const detail=node('details',null,'deck-sources');detail.append(node('summary','📚 Quellen & Fundstellen'));for(const text of sources){const p=node('p');renderSource(p,text);detail.append(p);}stage.append(detail);}
 const siblings=entries.filter(x=>x.group==='slides'),i=siblings.findIndex(x=>x.id===e.id);const nav=node('nav');if(i>0)nav.append(anchor('← Vorherige Folie','#material/'+encodeURIComponent(siblings[i-1].id)));if(i+1<siblings.length)nav.append(anchor('Nächste Folie →','#material/'+encodeURIComponent(siblings[i+1].id)));main.append(nav);
 const toolbar=main.querySelector('.slide-toolbar'),playerHeader=node('div',null,'player-header'),brand=node('div',null,'player-brand'),logo=node('img');logo.src='assets/podcast-cover.webp';logo.alt='';brand.append(logo,node('strong','Recht Medizinisch'));playerHeader.append(brand,node('span',`Folie ${e.nativeId} · ${i+1} / ${siblings.length}`,'player-position'),anchor('✕ Übersicht','#slides'));
 const find=node('button','⌕ Folie finden','secondary');find.type='button';find.onclick=()=>{
  const dialog=node('dialog',null,'slide-search-dialog'),title=node('h2','Folie finden'),close=node('button','Schließen ×','secondary'),search=node('input'),results=node('div');title.id='slide-search-title';dialog.setAttribute('aria-labelledby',title.id);search.type='search';search.placeholder='Foliennummer, Thema oder Kurs';search.setAttribute('aria-label','Folien durchsuchen');
  const draw=()=>{const q=search.value.trim().toLocaleLowerCase('de');const found=siblings.filter(x=>!q||`${x.nativeId} ${x.title} ${(x.courses??[]).map(n=>'Kurs '+n).join(' ')}`.toLocaleLowerCase('de').includes(q));results.replaceChildren(node('p',found.length+' Folien gefunden','subtle'));for(const x of found.slice(0,30)){const a=anchor('Folie '+x.nativeId+' · '+x.title+(open(x)?'':' · 🔒'),'#material/'+encodeURIComponent(x.id));a.onclick=()=>{dialog.close();dialog.remove();};results.append(a);}if(found.length>30)results.append(node('p','Suchbegriff eingrenzen, um weitere passende Folien zu finden.','subtle'));};
  search.oninput=draw;close.onclick=()=>dialog.close();dialog.addEventListener('close',()=>dialog.remove(),{once:true});dialog.append(title,close,search,results);document.body.append(dialog);draw();dialog.showModal();search.focus();
 };playerHeader.append(find);
 const foot=node('div',null,'player-controls'),progress=node('progress');progress.max=siblings.length;progress.value=i+1;progress.setAttribute('aria-label','Position in der Präsentation');foot.append(nav,progress);
 
 stage.append(node('p','App-Ausgabe: September 2026 · Den fachlichen Prüfstand finden Sie bei den jeweiligen Quellen. Zusätzliches Lernmaterial: Durchblättern erfüllt keine Kursaufgaben.','deck-reading-note'));
 main.classList.add('presentation-player');main.replaceChildren(playerHeader,toolbar,stage,foot);
 document.querySelectorAll('body > header, body > footer').forEach(el=>{el.inert=true;});stage.focus({preventScroll:true});
 }
}
