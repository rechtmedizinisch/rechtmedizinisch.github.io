const fields=new Set(['title','subtitle','goals','body','text','searchText','explanation','practice','definition','summary','prompt','question','label','description','tenor','holding','status','docket','court','category','source','sourceCaseId','eyebrow','kind','bridge','feedback','answer','keywords']);
export function searchableText(value){
  if(Array.isArray(value))return value.map(searchableText).join(' ');
  if(value&&typeof value==='object')return Object.entries(value).map(([key,v])=>{if(['assets','publicAssets','materials','courses','courseIds','links','sourcePages'].includes(key))return '';if(typeof v==='string')return fields.has(key)?v:'';if(Array.isArray(v)&&!fields.has(key))return v.filter(x=>x&&typeof x==='object').map(searchableText).join(' ');return searchableText(v);}).join(' ');
  return typeof value==='string'?value:'';
}
const normalize=t=>String(t).normalize('NFKD').replace(/\p{M}/gu,'').toLocaleLowerCase('de').replace(/ß/g,'ss');
const courseContext=entry=>(entry.courses??[]).map(n=>'Kurs '+String(n).padStart(2,'0')+' · Kurs '+n).join(' ');
const prepared=new WeakMap();
function preparedEntry(entry){let row=prepared.get(entry);if(!row){row={title:normalize(entry.title),body:normalize(entry.text),aliases:(entry.aliases??[]).map(normalize)};prepared.set(entry,row);}return row;}
export function searchEntries(entries,query){const phrase=normalize(query).trim().replace(/\s+/g,' '),terms=phrase.split(' ').filter(Boolean);if(!terms.length)return [];
  return entries.map(entry=>{const {title,body,aliases}=preparedEntry(entry);if(!terms.every(t=>title.includes(t)||body.includes(t)||aliases.some(a=>a.includes(t))))return null;return {...entry,score:(title===phrase?100:aliases.includes(phrase)?90:title.startsWith(phrase)?20:0)+terms.reduce((n,t)=>n+(title.includes(t)?10:1),0)};}).filter(Boolean).sort((a,b)=>b.score-a.score||a.title.localeCompare(b.title,'de'));
}
export function searchIndex(catalog,library,episodes,authorized=[],references=[]){
  const rows=new Map(authorized.map(r=>[r.id,r.payload])),entries=[];
  for(const c of catalog.catalog){const content=catalog.courses.find(x=>x.id===c.id)??rows.get(c.id);entries.push({id:c.id,title:`Kurs ${String(c.no).padStart(2,'0')} · ${c.title}`,type:'Kurse',href:`#course/${c.id}`,text:searchableText(content??c),preview:!content});}
  const names={slides:'Folien',glossary:'Begriffe',career:'Berufsstart',professions:'Gesundheitsberufe',podcast:'Schaubilder',system:'Schaubilder',atlas:'Fälle & Vertiefungen',special:'Spezialkurse'};
  for(const e of library){if(e.group==='atlas'&&e.legacyJudgmentIds?.length)continue;const content=e.content??rows.get(e.id),indexed=e.group==='special'?{title:e.title,subtitle:content?.subtitle,description:content?.description,keywords:content?.keywords,chapters:content?.chapters?.map(ch=>({title:ch.title,description:ch.description}))}:content??e;entries.push({id:e.id,title:e.group==='slides'?`Folie ${e.nativeId} · ${e.title}`:e.title,type:e.group==='atlas'?(e.graphic?'Schaubilder':e.category==='Begriffe'?'Begriffe':'Fälle & Vertiefungen'):names[e.group]??'Wissen',href:'#material/'+encodeURIComponent(e.id),text:searchableText(indexed)+' '+courseContext(e),preview:!content});}
  for(const r of catalog.landmarkCases){
    const linked=library.filter(e=>e.group==='atlas'&&e.legacyJudgmentIds?.includes(r.id));
    const detail=linked.map(e=>e.content??rows.get(e.id)).filter(Boolean);
    entries.push({id:'case:'+r.id,title:r.title,type:'Urteile',href:'#cases/'+encodeURIComponent(r.id),text:searchableText([r,...detail])+' '+linked.map(courseContext).join(' ')});
  }
  for(const [i,r] of catalog.importantNorms.entries())entries.push({id:'norm:'+i,title:r.label,type:'Normen',href:r.url,text:searchableText(r),external:true});
  for(const e of episodes)entries.push({id:'episode:'+e.id,title:e.title,type:'Podcast',href:'#podcast/'+encodeURIComponent(e.id),text:searchableText(e)});
  const byId=new Map(references.filter(e=>e.kind==='term').map(e=>[e.id,e]));
  const existing=new Set();
  for(const entry of entries){const id=entry.id.startsWith('atlas:')?entry.id.slice(6):entry.id;existing.add(id);const ref=byId.get(id);if(ref)entry.aliases=ref.aliases;}
  for(const ref of byId.values())if(!existing.has(ref.id))entries.push({id:'definition:'+ref.id,title:ref.title,type:'Begriffe',text:ref.body,aliases:ref.aliases,href:'#library/definitions',referenceId:ref.id});
  return entries;
}
