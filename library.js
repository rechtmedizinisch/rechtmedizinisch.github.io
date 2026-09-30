import {headingStyle,slideSections} from './presentation-theme.mjs?v=20260930h';
import {formatSlideText,downloadSlides} from './slide-tools.js?v=20260930h';
import {hasAccess,safeURL} from './policy.mjs?v=20260930h';
const groups={glossary:'📖 Begriffe & Gesundheitssystem',career:'🩺 PJ & Berufsstart',professions:'🤝 Gesundheitsberufe',podcast:'🎧 Schaubilder zum Podcast',system:'🧭 Schaubilder Medizinrecht & Gesundheitssystem',slides:'📑 Kursfolien'};
let entries;
const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text!=null)n.textContent=text;if(cls)n.className=cls;return n;};
const anchor=(text,url)=>{const n=node('a',text,'button secondary');n.href=url;return n;};
const scope=e=>e.group==='slides'?'slides':['system','podcast'].includes(e.group)?'diagrams':'knowledge';
export async function courseMaterials(main,no,isCurrent){
 if(!entries){const r=await fetch('./library.json');if(!r.ok)return;entries=await r.json();}
 if(!isCurrent())return;
 const matching=entries.filter(e=>e.courses?.includes(no));if(!matching.length)return;
 const box=node('section',null,'card');box.append(node('h2','📚 Materialien zu Kurs '+String(no).padStart(2,'0')));
 for(const group of ['slides','system','podcast','glossary','career','professions']){const items=matching.filter(e=>e.group===group);if(!items.length)continue;const details=node('details');details.append(node('summary',`${groups[group]} · ${items.length} Inhalte`));if(group==='slides'){details.append(node('p',`${items.length} Folien zum Kurs. Öffnen Sie die erste Folie und blättern Sie mit der Foliennavigation weiter.`),anchor('▶ Kursfolien beginnen','#material/'+encodeURIComponent(items[0].id)),anchor('Folienübersicht öffnen →','#slides'));}else for(const e of items)details.append(anchor(`${e.free?'Kostenlos · ':''}${e.title} →`,'#material/'+encodeURIComponent(e.id)));box.append(details);}
 main.append(box);
}
export async function renderLibrary(main,id,auth,grants,isCurrent,onlyGroup=null){
 if(!entries){const r=await fetch('./library.json');if(!r.ok)throw Error('Bibliothek nicht erreichbar');entries=await r.json();}
 if(!isCurrent())return;
 const open=e=>e.free||hasAccess(scope(e),grants);
 const badge=e=>node('span',e.free?'Kostenlos':open(e)?'✓ Freigeschaltet':'🔒 Mit Code freischalten',`badge ${open(e)?'':'lock'}`);
 if(!id){
  main.append(node('h1',onlyGroup==='slides'?'Kursfolien':'Wissen & Materialien'),node('p',onlyGroup==='slides'?'Ihre Präsentation: gezielt auswählen und Folie für Folie durcharbeiten.':'Die Inhalte der App – zum Nachschlagen, Vertiefen und Lernen.'));
  const presentation=node('section',null,'presentation-launch');presentation.append(node('h2','▶ Präsentation'),node('p','Folie für Folie in einer festen Leseansicht – mit direkter Auswahl und Vor-/Zurücknavigation.'),anchor('Präsentation starten →','#material/slides%3A1'));const download=node('button',hasAccess('slides',grants)?'↓ Alle Kursfolien herunterladen':'↓ Kostenlose Folien herunterladen','secondary');download.onclick=async()=>{download.disabled=true;try{await downloadSlides(auth,entries.filter(e=>e.group==='slides'),hasAccess('slides',grants));}catch{download.textContent='Download fehlgeschlagen – erneut versuchen';}finally{download.disabled=false;}};presentation.append(download,node('p','Download als lesbare HTML-Datei; im Browser auch als PDF druckbar. Heruntergeladene Dateien bleiben nach Ablauf eines Zugangs erhalten.','subtle'));main.append(presentation);
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
     for(const cat of [...new Set(matching.map(e=>e.category??''))]){const details=node('details');details.open=Boolean(search.value);details.append(node('summary',(cat||title)+' · Inhalte öffnen'));for(const e of matching.filter(x=>(x.category??'')===cat)){const row=node('div',null,'library-row');row.append(badge(e),anchor(e.title+' →','#material/'+encodeURIComponent(e.id)));details.append(row);}section.append(details);}
    }results.append(section);
   }
  }
  search.addEventListener('input',draw);main.append(search,results);draw();return;
 }
 const e=entries.find(x=>x.id===id);main.append(anchor('← Wissen & Materialien','#library'));if(!e){main.append(node('h1','Inhalt nicht gefunden'));return;}
 main.append(node('p',groups[e.group],'section-number'),node('h1',e.title),badge(e));let c=e.content;
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
 async function graphic(name){
  let src=c.publicAssets?.[name];
  if(!src&&auth){try{const a=await auth.getCourse('asset-v3:'+scope(e)+':'+name);if(a&&['image/png','image/jpeg','image/webp'].includes(a.mime)&&/^[A-Za-z0-9_-]+\.(png|jpg|jpeg|webp)$/.test(a.path))src=await auth.getGraphic(a.path);}catch{}}
  if(!isCurrent())return;
  if(!src){main.append(node('p','Die Grafik konnte nicht geladen werden. Die Lesefassung steht unten bereit.','notice'));return;}
  const figure=node('figure',null,'diagram'),img=node('img');img.src=src;img.alt=e.title;img.loading='lazy';
  const zoom=node('button','Grafik vergrößern ⤢','secondary');zoom.type='button';zoom.onclick=()=>{const dialog=node('dialog',null,'image-dialog'),close=node('button','Schließen ×');const full=img.cloneNode();close.onclick=()=>{dialog.close();dialog.remove();};dialog.append(close,full);dialog.addEventListener('close',()=>dialog.remove(),{once:true});document.body.append(dialog);dialog.showModal();};figure.append(img,zoom);main.append(figure);
 }
 for(const name of c.assets??[])await graphic(name);
 if(!isCurrent())return;
 if(c.miniCase){const b=box('🧩 Kurzfall',c.miniCase.question),details=node('details');details.append(node('summary','Lösung und Einordnung anzeigen'),node('p',c.miniCase.answer));b.append(details);}
 if(c.explanation){box(c.kind,c.explanation);box('💡 Für die Praxis',c.practice,'notice');source((c.source??'Rechtsquelle').split(';')[0],c.url);if(e.id==='glossary:richtlinienfaehigkeit'){const related=box('🖼 Passendes Schaubild');related.append(anchor('Schaubild: Wann wird eine Methode zur GKV-Leistung? →','#material/system%3Adirective'));}}
 if(c.points){const b=box('Kernpunkte');const ul=node('ul');for(const p of c.points)ul.append(node('li',p));b.append(ul);box('⚖ Rechtliche Einordnung',c.clarification,'notice');}
 if(c.nodes){for(const [i,n] of c.nodes.entries())box(`${i+1}. ${n.title}`,n.text);box('💡 Merksatz',c.takeaway,'notice');for(const s of c.sources??[])source(s.title,s.url);}
 if(c.blocks){
 const stage=node('div',null,'slide-stage');stage.setAttribute('aria-label','Aktuelle Folie');stage.tabIndex=0;main.append(stage);
 const titleBlock=node('div',null,'deck-title');titleBlock.append(node('p',c.eyebrow??'RECHT MEDIZINISCH','eyebrow'),node('h1',e.title));stage.append(titleBlock);
 const {sections,sources}=slideSections(c.blocks);
 for(const part of sections){const style=headingStyle(part.title),section=node('section',null,'slide-block tone-'+style.tone);if(part.title){const h=node('h2');if(style.symbol)h.append(node('span',style.symbol,style.step?'step-number':'section-symbol'));h.append(node('span',style.title));section.append(h);}for(const block of part.blocks){if(block.text)formatSlideText(section,block.text);for(const l of block.links??[]){const url=typeof l==='string'?l:l.url;if(safeURL(url)){const a=anchor((typeof l==='string'?'Quelle':l.label??'Rechtsquelle')+' ↗',url);a.target='_blank';a.rel='noopener noreferrer';section.append(a);}}}stage.append(section);}
 if(sources.length){const detail=node('details',null,'deck-sources');detail.append(node('summary','📚 Quellen & Fundstellen'));for(const text of sources)detail.append(node('p',text));stage.append(detail);}
 const siblings=entries.filter(x=>x.group==='slides'),i=siblings.findIndex(x=>x.id===e.id);const nav=node('nav');if(i>0)nav.append(anchor('← Vorherige Folie','#material/'+encodeURIComponent(siblings[i-1].id)));if(i+1<siblings.length)nav.append(anchor('Nächste Folie →','#material/'+encodeURIComponent(siblings[i+1].id)));main.append(nav);
 const toolbar=main.querySelector('.slide-toolbar'),playerHeader=node('div',null,'player-header'),brand=node('div',null,'player-brand'),logo=node('img');logo.src='assets/podcast-cover.webp';logo.alt='';brand.append(logo,node('strong','Recht Medizinisch'));playerHeader.append(brand,node('span',`Folie ${e.nativeId} · ${i+1} / ${siblings.length}`,'player-position'),anchor('✕ Übersicht','#slides'));
 const foot=node('div',null,'player-controls'),progress=node('progress');progress.max=siblings.length;progress.value=i+1;progress.setAttribute('aria-label','Position in der Präsentation');foot.append(nav,progress);
 for(const figure of [...main.querySelectorAll('figure.diagram')])stage.append(figure);
 main.classList.add('presentation-player');main.replaceChildren(playerHeader,toolbar,stage,foot);
 }
}
