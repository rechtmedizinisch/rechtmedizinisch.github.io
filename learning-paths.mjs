import {hasMaterialAccess} from './material-access.mjs?v=20261027-update51';
const validId=id=>typeof id==='string'&&/^(?:special:special-[a-z0-9-]+|atlas:(?:case|topic|schema|procedure|term|review)-[a-z0-9-]+|podcast:Podcast(?:Emergency|Defensive|Adults|Children)|slides:[1-9]\d{0,3})$/.test(id);
const validStep=step=>typeof step==='string'&&(step==='presentation-index'||validId(step)||/^(?:atlas:(?:schema|procedure)-[a-z0-9-]+|podcast:Podcast(?:Emergency|Defensive|Adults|Children))\?stage=[1-9]\d?$/.test(step));
export const learningTrailId=step=>String(step??'').split('?')[0];
export function learningTrailSource(id,stage){
 const focused=id+'?stage='+stage;return validStep(focused)?focused:id;
}
export function learningTrail(raw){
 try { const value=JSON.parse(new URLSearchParams(String(raw??'').split('?')[1]??'').get('trail')??'[]');
  return Array.isArray(value)&&value.length<=24&&value.every(validStep)?value:[];
 }catch{return [];}
}
export function learningTrailLink(href,trail,source=null){
 const next=source?[...(trail??[]),source]:[...(trail??[])];
 if(!next.length)return href;
 if(!next.every(validStep)||next.length>24||!href.startsWith('#material/'))return href;
 let raw;try{raw=decodeURIComponent(href.slice('#material/'.length));}catch{return href;}
 const [id,query='']=raw.split('?',2);
 if(!validId(id))return href;
 const params=new URLSearchParams(query);params.set('trail',JSON.stringify(next));params.set('from',learningTrailId(next.at(-1)));
 return '#material/'+encodeURIComponent(id+'?'+params.toString());
}
export function learningTrailBack(trail){
 if(!trail?.length||!trail.every(validStep))return null;
 const id=trail.at(-1),previous=trail.slice(0,-1);
 if(id==='presentation-index')return '#slides';
 return learningTrailLink('#material/'+encodeURIComponent(id),previous);
}
export function learningPathQuestions(questions,paths,id=''){
 if(!id)return questions;
 const ids=new Set(paths.find(p=>p.id===id)?.questionIds??[]);
 return questions.filter(q=>ids.has(q.id));
}
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!=null)n.textContent=text;if(cls)n.className=cls;return n;};
export function renderLearningPath(main,path,entries,grants){
 const hero=el('section',null,'knowledge-banner');hero.append(el('p','OPTIONALER SPEZIALKURS','section-number'),el('h1',path.title),el('p',path.subtitle));main.append(hero,el('p',path.description));
 for(const [index,chapter] of path.chapters.entries()){
  const detail=el('details',null,'card learning-path-chapter');detail.dataset.readingKey=chapter.id;
  const summary=el('summary'),number=el('span',String(index+1).padStart(2,'0'),'learning-path-number'),label=el('span');
  label.append(el('strong',chapter.title),el('small',chapter.itemIds.length+(chapter.itemIds.length===1?' Inhalt':' Inhalte')));summary.append(number,label);detail.append(summary,el('p',chapter.description,'subtle'));
  for(const key of chapter.itemIds){
   const entry=entries.find(e=>e.id==='atlas:'+key);if(!entry)continue;
   const row=el('a',null,'learning-path-item');row.href=learningTrailLink('#material/'+encodeURIComponent(entry.id),['special:'+path.id]);
   row.append(el('strong',entry.title),el('small',entry.free?'Kostenlos · Öffnen':hasMaterialAccess(entry,grants)?'Freigeschaltet · Öffnen':'Zugang erforderlich · Vorschau'),el('span','→','learning-path-arrow'));detail.append(row);
  }main.append(detail);
 }
 const practice=el('a','Passende Fragen üben →','button');practice.href='#practice/'+encodeURIComponent(path.id);main.append(practice,el('p','Die Übersicht ist frei zugänglich. Bei den einzelnen Inhalten sehen Sie, welcher Zugang benötigt wird.','subtle'));
 main.dataset.readingId='learning-path:'+path.id;main.dataset.readingVersion=path.contentVersion;
}
