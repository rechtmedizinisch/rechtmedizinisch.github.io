// One metadata index for the stable presentation and its additional materials.
// Never render an excerpt from a protected payload in this overview.
import {learningTrailLink} from './learning-paths.mjs?v=20261027-update51';
const norm=text=>String(text??'').normalize('NFKD').replace(/\p{M}/gu,'').toLocaleLowerCase('de').replace(/ß/g,'ss');
const prepared=new WeakMap();
export function presentationMatches(entries,query='',kind='all',course=0){
 const words=norm(query).trim().split(/\s+/).filter(Boolean),number=/^\d+$/.test(query.trim())?Number(query):null;
 return entries.filter(e=>{
  if(!['slides','atlas'].includes(e.group)||(kind!=='all'&&e.group!==kind)||(course&&!e.courses?.includes(Number(course))))return false;
  if(number!==null&&e.group==='slides')return Number(e.nativeId)===number;
  let text=prepared.get(e);if(!text){text=norm([e.title,e.subtitle,e.category,e.nativeId,...(e.courses??[]).map(n=>'Kurs '+n+' Kurs '+String(n).padStart(2,'0'))].join(' '));prepared.set(e,text);}
  return words.every(word=>text.includes(word));
 });
}
const el=(tag,text,cls)=>{const node=document.createElement(tag);if(text!=null)node.textContent=text;if(cls)node.className=cls;return node;};
export function renderPresentationIndex(main,entries,badge){
 const panel=el('section',null,'card presentation-controls'),query=el('input'),kind=el('input'),course=el('select'),results=el('div',null,'presentation-results'),total=el('p',null,'subtle'),tabs=el('div',null,'presentation-kind-switch');
 const launch=el('a','▶ Präsentation starten','button secondary');launch.href='#material/slides%3A1';
 panel.append(launch,el('h2','Basisfolien & Vertiefungen gemeinsam durchsuchen'));
 query.type='search';query.placeholder='Thema, Kurs oder Foliennummer';query.setAttribute('aria-label','Basisfolien und Vertiefungen durchsuchen');
 kind.type='hidden';kind.value='slides';kind.dataset.readingControl='presentation-kind';
 course.setAttribute('aria-label','Gemeinsamer Kursfilter');for(let n=0;n<=15;n++){const o=el('option',n?'Kurs '+String(n).padStart(2,'0'):'Alle Kurse');o.value=String(n);course.append(o);}
 query.dataset.readingControl='presentation-query';course.dataset.readingControl='presentation-course';
 const fields=el('div',null,'presentation-query-row');fields.append(query,course);panel.append(fields,kind);
 panel.dataset.readingRestorable='presentation-index';main.append(panel,total,tabs,results);
 const panes={},limits={slides:8,atlas:8};let matches=[];
 for(const [group,title,short] of [['slides','Basisfolien','Basisfolien'],['atlas','Fälle, Schemata & Vertiefungen','Vertiefungen']]){
  const tab=el('button',short,'secondary'),section=el('section',null,'card presentation-pane'),heading=el('h2'),count=el('p',null,'subtle'),scroll=el('div',null,'presentation-pane-scroll'),list=el('div',null,'presentation-pane-list'),more=el('button','Weitere '+short+' anzeigen','secondary'),shown=el('input'),position=el('input');
  section.dataset.presentationPane=group;tab.dataset.presentationKind=group;
  tab.type='button';tab.setAttribute('aria-controls','presentation-pane-'+group);tab.setAttribute('aria-pressed',group==='slides'?'true':'false');section.id='presentation-pane-'+group;
  scroll.setAttribute('aria-label',title+' · unabhängig scrollen');scroll.tabIndex=0;
  shown.type=position.type='hidden';shown.value='8';position.value='0';shown.dataset.readingControl='presentation-'+group+'-shown';position.dataset.readingControl='presentation-'+group+'-scroll';panel.append(shown,position);
  scroll.append(list,more);section.append(heading,count,scroll);results.append(section);tabs.append(tab);
  panes[group]={tab,section,heading,count,scroll,list,more,shown,position,title,short,rows:[]};
  scroll.onscroll=()=>{position.value=String(scroll.scrollTop);};
  tab.onclick=()=>{kind.value=group;updateTabs();};
  more.onclick=()=>{limits[group]+=8;drawPane(group,true);};
 }
 const updateTabs=()=>{if(!['slides','atlas'].includes(kind.value))kind.value='slides';for(const [group,p] of Object.entries(panes)){p.tab.setAttribute('aria-pressed',String(kind.value===group));p.section.className='card presentation-pane'+(kind.value!==group?' presentation-compact-inactive':'');}};
 const drawPane=(group,append=false)=>{
  const p=panes[group],start=append?p.list.children.length:0;if(!append)p.list.replaceChildren();
  for(const entry of p.rows.slice(start,limits[group])){
   const card=el('article',null,'slide-preview'),link=el('a',group==='slides'?'Basisfolie öffnen':'Material öffnen','button secondary');link.href=learningTrailLink('#material/'+encodeURIComponent(entry.id),[],'presentation-index');
   card.append(el('p',group==='slides'?'BASISFOLIE '+entry.nativeId:entry.category,'section-number'),el('h3',entry.title),badge(entry),link);p.list.append(card);
  }
  if(!p.rows.length)p.list.append(el('p','Keine Treffer in diesem Bereich. Die Suche umfasst weiterhin beide Bereiche.'));
  p.heading.textContent=p.title+' · '+p.rows.length;p.count.textContent=Math.min(limits[group],p.rows.length)+' von '+p.rows.length+' angezeigt';p.shown.value=String(limits[group]);
  p.more.hidden=p.rows.length<=limits[group];p.tab.textContent=p.short+' · '+p.rows.length;
 };
 const draw=(reset=true)=>{
  matches=presentationMatches(entries,query.value,'all',Number(course.value));total.textContent=matches.length+' passende Inhalte';
  for(const [group,p] of Object.entries(panes)){
   if(reset){limits[group]=8;p.position.value='0';}
   p.rows=matches.filter(e=>e.group===group).sort(group==='slides'?(a,b)=>Number(a.nativeId)-Number(b.nativeId):(a,b)=>a.title.localeCompare(b.title,'de'));
   const position=Number(p.position.value)||0;drawPane(group);p.scroll.scrollTop=position;
  }updateTabs();
 };
 let pending;query.oninput=()=>{clearTimeout(pending);pending=setTimeout(()=>{if(!panel.isConnected)return;draw();},75);};
 course.onchange=()=>{clearTimeout(pending);draw();};
 panel.addEventListener('reading-state-restored',()=>{
  for(const [group,p] of Object.entries(panes))limits[group]=Math.max(8,Math.min(entries.length,Number(p.shown.value)||8));
  draw(false);
 });
 main.dataset.readingId='presentation-library-index';main.dataset.readingVersion='20261027-library3';draw();
}
