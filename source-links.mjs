// Same citation labels as the native presentation, without discarding source text.
export function sourceLabel(value){
 const url=new URL(value),domain=url.hostname.replace(/^www\./,'');
 const statutes={bgb:'BGB',vvg_2008:'VVG',stpo:'StPO',stgb:'StGB',mpamiv:'MPAMIV',sgb_5:'SGB V'};
 const match=url.pathname.match(/^\/([^/]+)\/__(\d+[a-z]?)\.html$/);
 return domain==='gesetze-im-internet.de'&&match&&statutes[match[1]]?`§\u00a0${match[2]} ${statutes[match[1]]} öffnen`:`Quelle öffnen (${domain})`;
}
export function sourceParts(text){
 const parts=[];let cursor=0;
 for(const match of text.matchAll(/https?:\/\/[^\s<>]+/g)){
  let value=match[0].replace(/[.,;!]+$/,'');
  while(value.endsWith(')')&&(value.match(/\)/g)?.length??0)>(value.match(/\(/g)?.length??0))value=value.slice(0,-1);
  try{const url=new URL(value);if(!url.hostname||url.username||url.password)continue;parts.push({text:text.slice(cursor,match.index)},{text:sourceLabel(value),url:url.href});cursor=match.index+value.length;}catch{}
 }
 parts.push({text:text.slice(cursor)});return parts;
}
export function renderSource(parent,text){
 for(const part of sourceParts(text)){if(part.url){const a=parent.ownerDocument.createElement('a');a.href=part.url;a.textContent=part.text+' ↗';a.target='_blank';a.rel='noopener noreferrer';parent.append(a);}else parent.append(parent.ownerDocument.createTextNode(part.text));}
}
