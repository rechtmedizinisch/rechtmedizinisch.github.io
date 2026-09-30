const fields=new Set(['title','subtitle','goals','body','text','searchText','explanation','practice','definition','summary','prompt','question','label','description','tenor','holding','status','docket','court','category','source','eyebrow','kind','bridge','feedback','answer']);
export function searchableText(value){
  if(Array.isArray(value))return value.map(searchableText).join(' ');
  if(value&&typeof value==='object')return Object.entries(value).map(([key,v])=>{if(['assets','publicAssets','materials','courses','courseIds','links','sourcePages'].includes(key))return '';if(typeof v==='string')return fields.has(key)?v:'';if(Array.isArray(v)&&!fields.has(key))return v.filter(x=>x&&typeof x==='object').map(searchableText).join(' ');return searchableText(v);}).join(' ');
  return typeof value==='string'?value:'';
}
const normalize=t=>String(t).normalize('NFKD').replace(/\p{M}/gu,'').toLocaleLowerCase('de').replace(/ß/g,'ss');
export function searchEntries(entries,query){const phrase=normalize(query).trim().replace(/\s+/g,' '),terms=phrase.split(' ').filter(Boolean);if(!terms.length)return [];
  return entries.map(entry=>{const title=normalize(entry.title),body=normalize(entry.text);if(!terms.every(t=>title.includes(t)||body.includes(t)))return null;return {...entry,score:(title===phrase?100:title.startsWith(phrase)?20:0)+terms.reduce((n,t)=>n+(title.includes(t)?10:1),0)};}).filter(Boolean).sort((a,b)=>b.score-a.score||a.title.localeCompare(b.title,'de'));
}
export function searchIndex(catalog,library,episodes,authorized=[]){
  const rows=new Map(authorized.map(r=>[r.id,r.payload])),entries=[];
  for(const c of catalog.catalog){const content=catalog.courses.find(x=>x.id===c.id)??rows.get(c.id);entries.push({id:c.id,title:`Kurs ${String(c.no).padStart(2,'0')} · ${c.title}`,type:'Kurse',href:`#course/${c.id}`,text:searchableText(content??c),preview:!content});}
  const names={slides:'Folien',glossary:'Begriffe',career:'Berufsstart',professions:'Gesundheitsberufe',podcast:'Schaubilder',system:'Schaubilder'};
  for(const e of library){const content=e.content??rows.get(e.id);entries.push({id:e.id,title:e.group==='slides'?`Folie ${e.nativeId} · ${e.title}`:e.title,type:names[e.group]??'Wissen',href:'#material/'+encodeURIComponent(e.id),text:searchableText(content??e),preview:!content});}
  for(const r of catalog.landmarkCases)entries.push({id:'case:'+r.id,title:r.title,type:'Urteile',href:'#cases/'+encodeURIComponent(r.id),text:searchableText(r)});
  for(const [i,r] of catalog.importantNorms.entries())entries.push({id:'norm:'+i,title:r.label,type:'Normen',href:r.url,text:searchableText(r),external:true});
  for(const e of episodes)entries.push({id:'episode:'+e.id,title:e.title,type:'Podcast',href:'#podcast/'+encodeURIComponent(e.id),text:searchableText(e)});
  return entries;
}
