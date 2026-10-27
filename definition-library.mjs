import {openReferenceDialog} from './context-help.mjs?v=20261027-parity54';
const node=(tag,text,cls)=>{const e=document.createElement(tag);if(text!=null)e.textContent=text;if(cls)e.className=cls;return e;};
export async function renderDefinitions(main,isCurrent){
 const response=await fetch(new URL('./reference-help.json'+new URL(import.meta.url).search,import.meta.url));if(!response.ok)throw Error('reference-help unavailable');
 const {entries:catalog}=await response.json();if(!isCurrent())return;
 const entries=catalog.filter(e=>e.kind==='term').sort((a,b)=>a.title.localeCompare(b.title,'de'));
 main.append(node('h1','📖 Begriffe A–Z'),node('p',`${entries.length} kostenlose Erklärungen. Begriff öffnen, kurz nachschlagen und an derselben Stelle weiterlesen.`));
 const search=node('input');search.type='search';search.placeholder='Aufklärung, Indikation, Einwilligung …';search.setAttribute('aria-label','Begriffe durchsuchen');
 const list=node('div',null,'definition-grid');main.append(search,list);
 const normalized=value=>value.normalize('NFKD').replace(/\p{M}/gu,'').toLocaleLowerCase('de');
 const index=entries.map(entry=>({entry,text:normalized([entry.title,entry.body,...entry.aliases].join(' '))}));
 const render=()=>{list.replaceChildren();const q=normalized(search.value).trim();for(const {entry} of index.filter(row=>!q||row.text.includes(q))){const button=node('button',entry.title+' ⓘ','button secondary');button.type='button';button.dataset.definitionId=entry.id;button.onclick=()=>openReferenceDialog(button,entry,catalog);list.append(button);}if(!list.children.length)list.append(node('p','Kein passender Begriff.'));};
 search.oninput=render;render();
}
