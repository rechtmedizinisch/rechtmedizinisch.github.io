import {formatSlideText} from './slide-tools.js?v=20261027-view-parity56a';
import {safeURL} from './policy.mjs?v=20261027-view-parity56a';
import {protectReferences} from './presentation-theme.mjs?v=20261027-view-parity56a';
import {focusedAtlasNode,focusedPodcastNode,schemaDestination,materialReadingKey,slideDestination} from './atlas-navigation.mjs?v=20261027-view-parity56a';
import {learningTrailLink,learningTrailSource} from './learning-paths.mjs?v=20261027-view-parity56a';
import {readingRole,readingHeading} from './reading-style.mjs?v=20261029-klaro62';
import {readingGroups} from './reading-guide.mjs?v=20261028-corpus59';
const element=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=protectReferences(text);if(cls)n.className=cls;return n;};
const symbols={facts:'M7 3h7l4 4v14H6V3z M14 3v5h4 M9 12h6 M9 16h6',question:'M9 8a3 3 0 0 1 6 0c0 2-3 2-3 5 M12 17v.1 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',solution:'M8 12l3 3 5-6 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',warning:'M12 3 2 21h20L12 3z M12 9v5 M12 17v.1',takeaway:'M9 18h6 M10 21h4 M8 14a6 6 0 1 1 8 0l-1 3H9z M12 1v2',focus:'M3 8V3h5 M16 3h5v5 M21 16v5h-5 M8 21H3v-5 M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',proof:'M15 15l6 6 M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0',outcome:'M8 12l3 3 5-6 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',reasoning:'M12 3v18 M7 21h10 M4 6h16 M5 6 2 14h6L5 6z M19 6l-3 8h6l-3-8z',source:'M3 4h5v17H3z M10 4h4v17h-4z M16 5l3-1 4 16-3 1z'};
export function roleIcon(role){
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.setAttribute('class','atlas-role-symbol');
 const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d',symbols[role]);path.setAttribute('fill','none');path.setAttribute('stroke','currentColor');path.setAttribute('stroke-width','1.7');path.setAttribute('stroke-linecap','round');path.setAttribute('stroke-linejoin','round');svg.append(path);return svg;
}
function card(title,text,role='explanation',marker=null){
 role=readingRole(title,role);
 const headingParts=readingHeading(title,marker);
 const section=element('section',null,'card atlas-text-card atlas-role-'+role),heading=element('h2');
 if(headingParts.marker)heading.append(element('span',headingParts.marker,'atlas-step-badge'));
 else if(symbols[role])heading.append(roleIcon(role));
 if(title){heading.append(element('span',headingParts.title));section.append(heading);}
 if(text)formatSlideText(section,text);
 if(role==='solution'){const details=element('details',null,'atlas-stage');details.append(element('summary',title||'Lösung & Einordnung'),section);return details;}return section;
}
export function renderAtlasFocus(main,content,stage,kind='atlas'){
 const focus=kind==='podcast'?focusedPodcastNode(content,stage):focusedAtlasNode(content,stage);
 if(focus)main.append(card('Prüfungsort im Fall',focus.title,'focus'));
}
export function renderPodcastReading(main,content,stage){
 main.append(element('h2','Lesefassung'));
 const focus=focusedPodcastNode(content,stage);
 for(const [index,text] of (content.points??[]).entries()){
  const selected=focus&&stage===index+1,title=content.stageTitles?.[index]??String(index+1);
  main.append(card((selected?'Prüfungsort · ':'')+title,text,selected?'focus':'explanation'));
 }
}
export function renderAtlasReading(main,content,library=[],options={}){
 if(content.subtitle)main.append(element('p',content.subtitle,'subtle'));
 const focus=focusedAtlasNode(content,options.focusedStage);
 if(!options.hideFocusBanner)renderAtlasFocus(main,content,options.focusedStage);
 if(content.id==='procedure-fehler')main.append(card('Begriffe direkt nachschlagen','Beweislast · gesetzliche Vermutung · Ursächlichkeit · reaktionspflichtiger Befund. Tippen Sie auf einen hervorgehobenen Begriff. Die Erklärung öffnet sich hier; nach dem Schließen lesen Sie an derselben Stelle weiter.','focus'));
 if(content.overview?.length){
  if(content.overviewNote)main.append(element('p',content.overviewNote,'notice'));
  for(const [i,n] of content.overview.entries()){
   const selected=focus&&i+1===options.focusedStage;
   const row=card((selected?'Prüfungsort · ':'')+n.title,n.body,selected?'focus':n.tone==='gold'?'focus':'explanation',String(i+1).padStart(2,'0'));row.classList.add('atlas-overview-card');main.append(row);
  }
 }
 for(const stage of content.stages??[]){
  const details=element('details',null,'card atlas-stage');details.append(element('summary',stage.label+' · Vertiefung'));
  for(const detail of stage.details??[]){details.append(card(detail.label,detail.text));for(const row of detail.rows??[])if(row.length>=2)details.append(card(row[0],row[1]));}main.append(details);
 }
 const reading=content.diagramAsset?element('details',null,'atlas-explanations'):element('div');
 if(content.diagramAsset)reading.append(element('summary','Ausführliche Erläuterungen'));
 const groups=readingGroups(content);
 if(groups){
  for(const group of groups){
   const details=element('details',null,'card atlas-stage atlas-reading-group');details.dataset.readingKey='reading-group:'+group.id;details.open=group.expanded===true;
   const summary=element('summary');summary.append(element('span',group.title),element('small',group.indices.length===1?'1 Abschnitt':group.indices.length+' Abschnitte','subtle'));details.append(summary);
   for(const index of group.indices){const row=content.sections[index];details.append(card(row.title,row.body,row.role));}
   reading.append(details);
  }
 }else if(content.type==='case'||content.sections?.some(s=>s.chapter)){
  const chapters=new Map();for(const row of content.sections??[]){const title=row.chapter??'Orientierung';if(!chapters.has(title))chapters.set(title,[]);chapters.get(title).push(row);}
  for(const [title,rows] of chapters){const group=title==='Orientierung'?element('div'):element('details',null,'card atlas-stage');if(title!=='Orientierung')group.append(element('summary',title));for(const row of rows)group.append(card(row.title,row.body,row.role));reading.append(group);}
 }else for(const row of content.sections??[])reading.append(card(row.title,row.body,row.role));main.append(reading);
 if(content.legacySlideIds?.length){const slides=element('details',null,'card');slides.append(element('summary','Zugehörige Kursfolien'));for(const number of content.legacySlideIds){const link=element('a','Folie '+number+' öffnen','button secondary');link.href=learningTrailLink(slideDestination('slides:'+number,'atlas:'+content.id),options.learningTrail,learningTrailSource('atlas:'+content.id,options.focusedStage));slides.append(link);}main.append(slides);}
 if(content.schemaLinks?.length){
  const group=element('details',null,'card atlas-schema-links');group.append(element('summary','Passendes Schema & Prüfungsort'));
  for(const entry of content.schemaLinks){
   const target=library.find(row=>row.id===(entry.targetKind==='podcast'?'podcast:':'atlas:')+entry.targetId);if(!target)continue;
   const link=element('a',target.title+' öffnen','button secondary');link.href=learningTrailLink(schemaDestination(entry,content.id),options.learningTrail,learningTrailSource('atlas:'+content.id,options.focusedStage));
   const row=element('div',null,'atlas-schema-link');row.append(link,element('p',entry.stageTitle,'atlas-focus-label'),element('p',entry.reason));group.append(row);
  }main.append(group);
 }
 if(content.relatedIds?.length){const related=element('details',null,'card');related.append(element('summary','Passende Fälle & Schemata'));for(const id of content.relatedIds){const target=library.find(row=>row.id==='atlas:'+id);const link=element('a',(target?.title??(id.startsWith('case-')?'Fall '+id.slice(5).toUpperCase():'Vertiefung'))+' öffnen','button secondary');link.href=learningTrailLink('#material/'+encodeURIComponent('atlas:'+id),options.learningTrail,learningTrailSource('atlas:'+content.id,options.focusedStage));related.append(link);}main.append(related);}
 if(content.sources?.length){
  const sources=element('details',null,'card');sources.append(element('summary','Originalquellen & Rechtsgrundlagen'));
  for(const source of content.sources){const url=safeURL(source.url);if(!url)continue;const link=element('a',source.title+' · '+new URL(url).hostname+'','button secondary');link.href=url;link.target='_blank';link.rel='noopener noreferrer';sources.append(link);}main.append(sources);
 }
 main.dataset.readingId=materialReadingKey('atlas',content.id,focus?options.focusedStage:null,options.originId);main.dataset.readingVersion=content.contentVersion;
 [...main.querySelectorAll('details')].forEach((detail,index)=>{if(!detail.dataset.readingKey)detail.dataset.readingKey='detail:'+index;});
}
