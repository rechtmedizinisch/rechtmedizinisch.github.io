import {renderSource} from './source-links.mjs?v=20260930s';
import {protectReferences,readingParts,emphasisRanges,slideSections,headingStyle,layoutForSlide} from './presentation-theme.mjs?v=20260930s';
export function richText(parent,text){const doc=parent.ownerDocument;let cursor=0;for(const r of emphasisRanges(text)){parent.append(doc.createTextNode(text.slice(cursor,r.start)));const strong=doc.createElement('strong');strong.textContent=text.slice(r.start,r.end);parent.append(strong);cursor=r.end;}parent.append(doc.createTextNode(text.slice(cursor)));}
export function formatSlideText(parent,text){
 const parts=readingParts(text),doc=parent.ownerDocument;
 if(parts.kind==='bullets'||parts.kind==='steps'){const list=doc.createElement(parts.kind==='steps'?'ol':'ul');list.className=parts.kind==='steps'?'slide-steps':'slide-points';if(parts.start)list.start=parts.start;for(const part of parts.items){const item=doc.createElement('li');richText(item,part);list.append(item);}parent.append(list);}else for(const part of parts.items){const p=doc.createElement('p');if(/^(Praxis|Lehrtransfer|Heutiger Lehrtransfer):/.test(part))p.className='practice-callout';richText(p,part);parent.append(p);}

}
export async function downloadSlides(auth,freeSlides,full){
 const available=full?await auth.getSlides():freeSlides.filter(e=>e.free).map(e=>e.content);const byId=new Map(available.filter(c=>c?.blocks).map(c=>[String(c.id),c]));const slides=freeSlides.map(e=>byId.get(String(e.nativeId))).filter(Boolean);
 if(!slides.length)throw Error('Keine Folien verfügbar');
 const doc=document.implementation.createHTMLDocument('Recht Medizinisch – Kursfolien');doc.documentElement.lang='de';
 const style=doc.createElement('style');const response=await fetch('./presentation-export.css');if(!response.ok)throw Error('Exportgestaltung nicht verfügbar');style.textContent=await response.text();doc.head.append(style);
 const imageCache=new Map();
 async function embed(name,c){if(imageCache.has(name))return imageCache.get(name);let url=c.publicAssets?.[name];if(!url){const asset=await auth.getCourse('asset-v3:slides:'+name);if(!asset?.path)throw Error('Grafikzugang nicht verfügbar');url=await auth.getGraphic(asset.path);}const r=await fetch(url);if(!r.ok)throw Error('Grafikdownload fehlgeschlagen');const blob=await r.blob();if(!blob.type.startsWith('image/'))throw Error('Ungültige Grafik');const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob);});imageCache.set(name,data);return data;}
 for(const c of slides){
  const article=doc.createElement('article'),label=doc.createElement('small'),h=doc.createElement('h1');article.className='layout-'+layoutForSlide(c)+' slide-variant-'+((Number(c.id)-1)%4);label.textContent='Recht Medizinisch · Folie '+c.id+' · '+(c.eyebrow??'');h.textContent=c.title;article.append(label,h);
  const {sections,sources}=slideSections(c.blocks);const grid=doc.createElement('div');grid.className='slide-sections';article.append(grid);
  for(const part of sections){const theme=headingStyle(part.title),section=doc.createElement('section');section.className='slide-block tone-'+theme.tone;if(part.title){const heading=doc.createElement('h2');if(theme.symbol){const symbol=doc.createElement('span');symbol.className=theme.step?'step-number':'section-symbol';symbol.textContent=theme.symbol;heading.append(symbol);}heading.append(doc.createTextNode(' '+theme.title));section.append(heading);}
   for(const block of part.blocks){if(block.image){const img=doc.createElement('img');img.src=await embed(block.image,c);img.alt='Originalgrafik: '+c.title;section.append(img);}if(block.text)formatSlideText(section,block.text);for(const l of block.links??[]){const url=typeof l==='string'?l:l.url;if(!/^https:\/\//.test(url??''))continue;const p=doc.createElement('p'),a=doc.createElement('a');a.href=url;a.textContent=typeof l==='string'?'Quelle':l.label??'Quelle';p.append(a);section.append(p);}}grid.append(section);
  }
  if(sources.length){const box=doc.createElement('aside'),title=doc.createElement('h3');title.textContent='📚 Quellen & Fundstellen';box.append(title);for(const text of sources){const p=doc.createElement('p');renderSource(p,text);box.append(p);}article.append(box);}doc.body.append(article);
 }
 const blob=new Blob(['<!doctype html>'+doc.documentElement.outerHTML],{type:'text/html;charset=utf-8'}),url=URL.createObjectURL(blob);
 return {url,filename:full?'Recht-Medizinisch-Kursfolien.html':'Recht-Medizinisch-Kostenlose-Folien.html'};
}
