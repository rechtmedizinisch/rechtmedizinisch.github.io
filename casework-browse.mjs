// Public metadata only; never indexes paid facts or solutions.
export const caseAreas=Object.freeze({civil:'Zivilrecht',criminal:'Strafrecht',professional:'Berufsrecht & Grundrechte'});
export const caseArea=entry=>entry.legalArea??'civil';
export const caseAreaLabel=entry=>caseAreas[caseArea(entry)]??'Weitere Fälle';
export const caseCode=entry=>entry.displayCode??String(entry.number).padStart(2,'0');
const normalized=value=>String(value).normalize('NFKD').replace(/\p{M}/gu,'').toLocaleLowerCase('de').replace(/\s+/g,'');
export function matchesWorkshopCase(entry,{area='',topic='',query=''}={}){
 if(area&&caseArea(entry)!==area||topic&&entry.cluster!==topic)return false;
 const haystack=[caseCode(entry),entry.title,entry.cluster,entry.source.court,entry.source.date,entry.source.docket,caseAreaLabel(entry)].join(' ');
 return !query.trim()||normalized(haystack).includes(normalized(query.trim()));
}
