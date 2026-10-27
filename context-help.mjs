// Contextual reading help never changes the route or grants access to content.
import {protectReferences} from './presentation-theme.mjs?v=20261027-parity54';
const escape=value=>value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const historicalDesignation='(?:a\\.[\\s\\u00A0]*F\\.|alter[\\s\\u00A0]+Fassung)(?![\\p{L}\\p{N}])';
export function referenceIndex(entries){
 const patterns=[];
 for(const entry of entries){
  if(entry.matchable===false)continue;
  let alternatives=[];
  if(entry.kind==='norm'&&entry.aliases?.length){
   alternatives=entry.aliases.map(alias=>alias.trim().split(/\s+/u).map(escape).join('[\\s\\u00A0]+'));
  }
  if(entry.kind==='norm'&&entry.number&&!entry.number.includes('_')&&entry.law){
   const space='[\\s\\u00A0]',marker=entry.marker==='Art.'?'Art\\.':'(?<!§)§(?!§)';
   const coordinate='(?:(?:Abs\\.|Absatz|Absätze|Satz|Sätze|S\\.|Nr\\.|Alt\\.|Buchst\\.|Doppelbuchst\\.|lit\\.)[\\s\\u00A0]*[0-9a-z]+(?:[\\s\\u00A0]*(?:,|und|oder|–|-|/)[\\s\\u00A0]*[0-9a-z]+)*)';
   const tail='(?:(?:'+space+'*(?:(?:,|und|oder)'+space+'*)?'+coordinate+')|(?:'+space+'+[IVX]+))*';
   const law=entry.law.split(' ').map(escape).join(space+'+');
   const edition=entry.historical?'(?:'+space+'+'+historicalDesignation+')?':'(?!'+space+'+'+historicalDesignation+')';
   alternatives.push(marker+space+'*'+escape(entry.number)+'(?![0-9a-z])'+tail+space+'*'+law+edition+'(?![\\p{L}\\p{N}])');
  }else if(entry.kind==='term')alternatives=(entry.aliases??[]).map(escape);
  for(const pattern of alternatives)patterns.push({entry,regex:new RegExp('(?<![\\p{L}\\p{N}])(?:'+pattern+')(?![\\p{L}\\p{N}])','giu')});
 }
 return patterns;
}
export function referenceMatches(text,index){
 const candidates=[],webLinks=[...text.matchAll(/https?:\/\/[^\s<>]+/giu)].map(m=>({start:m.index,end:m.index+m[0].length}));
 for(const {entry,regex} of index){regex.lastIndex=0;for(const match of text.matchAll(regex)){const hit={start:match.index,end:match.index+match[0].length,entry};const suffix=text.slice(hit.end),lawWords=(entry.law??'').split(/\s+/u).filter(Boolean);const historicalTails=['',...lawWords.slice(1).map((_,i)=>lawWords.slice(i+1).map(escape).join('\\s+'))];const historical=/(?:damalig|früher|historisch)\p{L}*\s*$/iu.test(text.slice(Math.max(0,hit.start-45),hit.start))||historicalTails.some(tail=>new RegExp('^\\s*'+(tail?tail+'\\s+':'')+historicalDesignation,'iu').test(suffix))||new RegExp(historicalDesignation+'$','iu').test(match[0]);const editionMatches=entry.kind!=='norm'||historical===Boolean(entry.historical);if(editionMatches&&!webLinks.some(url=>url.start<hit.end&&url.end>hit.start))candidates.push(hit);}}
 candidates.sort((a,b)=>a.start-b.start||(b.end-b.start)-(a.end-a.start)||(a.entry.kind==='norm'?0:1)-(b.entry.kind==='norm'?0:1)||a.entry.id.localeCompare(b.entry.id));
 const result=[];for(const candidate of candidates){const nearby=text.slice(Math.max(0,candidate.start-90),candidate.end+90);const editions=candidate.entry.editionYears??[candidate.entry.edition];const wrongEdition=candidate.entry.historical&&[...nearby.matchAll(/Fassung\s+(?:(?:von|vom)\s+)?(?:\d{1,2}\.\d{1,2}\.\s*)?(\d{4})/giu)].some(m=>!editions.includes(m[1]));if(!wrongEdition&&candidate.start>=(result.at(-1)?.end??0))result.push(candidate);}
 return result;
}

const dialogIndexes=new WeakMap();
export function openReferenceDialog(owner,entry,catalog=[]){
 const doc=owner.ownerDocument,dialog=doc.createElement('dialog');dialog.className='context-dialog';
 const header=doc.createElement('div');header.className='context-dialog-header';
 const title=doc.createElement('h2');title.textContent=protectReferences(entry.title);title.id='context-reference-title';dialog.setAttribute('aria-labelledby',title.id);
 const close=doc.createElement('button');close.type='button';close.textContent='Schließen ×';close.onclick=()=>dialog.close();header.append(title,close);dialog.append(header);
 const kind=doc.createElement('p');kind.className='section-number';kind.textContent=entry.kind==='norm'?'NORM NACHSCHLAGEN':'KURZ ERKLÄRT';dialog.append(kind);
 let index=dialogIndexes.get(catalog);if(!index){index=referenceIndex(catalog);dialogIndexes.set(catalog,index);}
 for(const paragraph of entry.body.split(/\n\s*\n/).filter(p=>p.trim())){
  const p=doc.createElement('p'),text=protectReferences(paragraph);let at=0;
  for(const hit of referenceMatches(text,index).filter(h=>h.entry.id!==entry.id)){
   p.append(doc.createTextNode(text.slice(at,hit.start)));const b=doc.createElement('button');b.type='button';b.className='context-reference';b.textContent=text.slice(hit.start,hit.end);b.setAttribute('aria-haspopup','dialog');b.onclick=()=>openReferenceDialog(b,hit.entry,catalog);p.append(b);at=hit.end;
  }
  p.append(doc.createTextNode(text.slice(at)));dialog.append(p);
 }
 if(entry.relatedIds?.length){
  const box=doc.createElement('section');box.className='context-related';const h=doc.createElement('h3');h.textContent='Vertiefen & anwenden';box.append(h);
  for(const id of entry.relatedIds){const a=doc.createElement('a');a.href='#material/'+encodeURIComponent('atlas:'+id);a.textContent=(entry.relatedMaterials?.find(m=>m.id===id)?.title??'Passende Vertiefung')+' öffnen';a.className='button secondary';a.dataset.relatedMaterial=id;a.onclick=()=>dialog.close();box.append(a);}dialog.append(box);
 }
 if(entry.kind==='norm'){
  let norms=(entry.targetNormIds??[]).map(id=>catalog.find(e=>e.id===id)).filter(Boolean);if(!norms.length)norms=[entry];
  const h=doc.createElement('h3');h.textContent=entry.textLabel||(norms.length>1?'Gesetzestexte':'Gesetzestext');dialog.append(h);
  for(const norm of norms){if(norms.length>1){const heading=doc.createElement('h4');heading.textContent=protectReferences(norm.title);dialog.append(heading);}const text=doc.createElement('div');text.className='context-norm-text';text.textContent=protectReferences(norm.text||'Der Gesetzestext ist hier noch nicht offline hinterlegt. Die genaue Quelle können Sie unten öffnen.');dialog.append(text);}
  if(entry.retrievedAt){const date=doc.createElement('p');date.className='subtle';date.textContent=(entry.sourceLabel||'Gesetze im Internet')+' · Abruf: '+entry.retrievedAt;dialog.append(date);}
 }
 for(const source of entry.sources??[]){try{const url=new URL(source.url);if(url.protocol!=='https:')continue;const a=doc.createElement('a');a.href=url.href;a.textContent=source.title+'';a.target='_blank';a.rel='noopener noreferrer';a.className='context-source';dialog.append(a);}catch{}}
 dialog.addEventListener('close',()=>{dialog.remove();if(owner.isConnected)owner.focus({preventScroll:true});},{once:true});
 doc.body.append(dialog);dialog.showModal();close.focus();return dialog;
}

export function installContextHelp(root,{load=()=>fetch(new URL('./reference-help.json'+new URL(import.meta.url).search,import.meta.url)).then(r=>{if(!r.ok)throw Error('reference-help unavailable');return r.json();})}={}){
 let stopped=false,index=[],catalog=[],scheduled=false;const checked=new WeakMap();
 const excluded='a,button,input,textarea,select,label,summary,nav,h1,h2,h3,h4,h5,h6,code,pre,script,style,[data-no-reference-help],.context-dialog';
 function decorate(){
  scheduled=false;if(stopped||!index.length)return;
  const doc=root.ownerDocument,walker=doc.createTreeWalker(root,4),nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
  for(const textNode of nodes){
   if(!textNode.parentElement||textNode.parentElement.closest(excluded)||checked.get(textNode)===textNode.data)continue;
   checked.set(textNode,textNode.data);const text=textNode.data,matches=referenceMatches(text,index);if(!matches.length)continue;
   const fragment=doc.createDocumentFragment();let at=0;
   for(const match of matches){fragment.append(doc.createTextNode(text.slice(at,match.start)));const button=doc.createElement('button');button.type='button';button.className='context-reference';button.textContent=text.slice(match.start,match.end);button.title=(match.entry.body||match.entry.text||match.entry.title).slice(0,300);button.setAttribute('aria-haspopup','dialog');button.onclick=()=>openReferenceDialog(button,match.entry,catalog);fragment.append(button);at=match.end;}
   fragment.append(doc.createTextNode(text.slice(at)));textNode.replaceWith(fragment);
  }
 }
 const schedule=()=>{if(!scheduled){scheduled=true;requestAnimationFrame(decorate);}};
 const observer=new MutationObserver(schedule);observer.observe(root,{subtree:true,childList:true,characterData:true});
 const ready=load().then(data=>{if(stopped)return;catalog=data.entries??[];index=referenceIndex(catalog);schedule();}).catch(()=>{});
 return {ready,stop(){stopped=true;observer.disconnect();}};
}
