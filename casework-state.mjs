// Pure state shared by the editorial preview and future native acceptance fixtures.
export function initialState(id) { return {id,step:0,completed:false,decisionSeen:false,completionConfirmed:false}; }
export function transition(state,action) {
  const delta=action==='next'?1:action==='back'?-1:0;
  const step=Math.max(0,Math.min(2,state.step+delta));
  const confirmed=state.completionConfirmed||(action==='complete'&&state.step===2);
  return {...state,step,decisionSeen:state.decisionSeen||step===2,completionConfirmed:confirmed,completed:confirmed};
}
export function visibleCase(entry,state) {
  const visible={id:entry.id,facts:entry.facts};
  if(state.step>=1)visible.questions=entry.questions;
  if(state.step>=2){visible.decision=entry.decision;visible.original=entry.original;}
  return visible;
}
export function restore(raw,knownIds) {
  let stored;try{stored=JSON.parse(raw);}catch{return {};}
  if(!stored||typeof stored!=='object'||Array.isArray(stored))return {};
  const result={};
  for(const id of knownIds){
    const value=stored[id];
    if(value&&Number.isInteger(value.step)&&value.step>=0&&value.step<=2&&typeof value.completed==='boolean'){
      // Early editorial previews used "completed" for merely opening the
      // decision. Preserve that reading position, without inventing a new
      // explicit completion that the learner never confirmed.
      const confirmed=value.completed&&value.completionConfirmed===true;
      Object.defineProperty(result,id,{value:{step:value.step,completed:confirmed,decisionSeen:value.decisionSeen===true||value.step===2||value.completed,completionConfirmed:confirmed},enumerable:true,writable:true,configurable:true});
    }
  }
  return result;
}
export function matchingCases(cases,query='',cluster='') {
  const needle=query.toLocaleLowerCase('de').trim();
  return cases.filter(c=>(!cluster||c.cluster===cluster)&&(!needle||(c.title+' '+c.source.docket+' '+c.cluster).toLocaleLowerCase('de').includes(needle)));
}
export function nextCaseId(cases,currentId,query='',cluster='') {
  const matches=matchingCases(cases,query,cluster),index=matches.findIndex(c=>c.id===currentId);
  return matches[index+1]?.id??null;
}
