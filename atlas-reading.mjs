import {formatSlideText} from './slide-tools.js?v=20261106-polish61b';
import {safeURL} from './policy.mjs?v=20261106-polish61b';
import {protectReferences} from './presentation-theme.mjs?v=20261106-polish61b';
import {focusedAtlasNode,focusedPodcastNode,schemaDestination,materialReadingKey,slideDestination} from './atlas-navigation.mjs?v=20261106-polish61b';
import {learningTrailLink,learningTrailSource} from './learning-paths.mjs?v=20261106-polish61b';
import {readingRole,readingHeading,roleIcon} from './reading-style.mjs?v=20261106-polish61b';
export {roleIcon} from './reading-style.mjs?v=20261106-polish61b';
import {readingGroups} from './reading-guide.mjs?v=20261106-polish61b';
const element=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=protectReferences(text);if(cls)n.className=cls;return n;};
function card(title,text,role='explanation',marker=null){
 role=readingRole(title,role);
 const headingParts=readingHeading(title,marker);
 const section=element('section',null,'card atlas-text-card atlas-role-'+role),heading=element('h2');
 if(headingParts.marker)heading.append(element('span',headingParts.marker,'atlas-step-badge'));
 else {const icon=roleIcon(role);if(icon)heading.append(icon);}
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
 function sectionCard(row){const box=card(row.title,row.body,row.role);if(row.originalCourtText){box.dataset.noReferenceHelp='';box.prepend(element('p','Gerichtstext vom '+row.courtDate+' · Gesetzesbezeichnungen in dieser Lesefassung ergänzt. Maßgeblich ist die damalige Gesetzesfassung.','subtle'));}return box;}
 const groups=readingGroups(content);
 if(groups){
  for(const group of groups){
   const details=element('details',null,'card atlas-stage atlas-reading-group');details.dataset.readingKey='reading-group:'+group.id;details.open=group.expanded===true;
   const summary=element('summary');summary.append(element('span',group.title),element('small',group.indices.length===1?'1 Abschnitt':group.indices.length+' Abschnitte','subtle'));details.append(summary);
   for(const index of group.indices){const row=content.sections[index];details.append(sectionCard(row));}
   reading.append(details);
  }
 }else if(content.type==='case'||content.sections?.some(s=>s.chapter)){
  const chapters=new Map();for(const row of content.sections??[]){const title=row.chapter??'Orientierung';if(!chapters.has(title))chapters.set(title,[]);chapters.get(title).push(row);}
  for(const [title,rows] of chapters){const group=title==='Orientierung'?element('div'):element('details',null,'card atlas-stage');if(title!=='Orientierung')group.append(element('summary',title));for(const row of rows)group.append(sectionCard(row));reading.append(group);}
 }else for(const row of content.sections??[])reading.append(sectionCard(row));main.append(reading);
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
