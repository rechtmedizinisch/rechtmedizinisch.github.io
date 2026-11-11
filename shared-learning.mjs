// Portable Web/App format. Sync bookkeeping is local; only _resetEpoch is wire data.
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v)&&[Object.prototype,null].includes(Object.getPrototypeOf(v));
const clone=v=>structuredClone(v);
const own=(v,k)=>Object.hasOwn(v,k);
const get=(v,k)=>own(v,k)?v[k]:undefined;
const fail=()=>{throw Error('Der gespeicherte Lernstand hat ein ungültiges Format. Die vorhandene Fassung bleibt erhalten.');};
const integer=v=>Number.isSafeInteger(v)&&v>=0&&v<=10000;
export function sharedPayloadFromCache(value){
 if(!object(value))fail();
 const localKeys=new Set(['_sync','_optionalPending','_syncBase','_syncWriter','_branches']);
 return normalizeSharedSnapshot(Object.fromEntries(Object.entries(value).filter(([k])=>!localKeys.has(k))));
}
function bounded(value,depth=0,identifierMap=false){
 if(depth>32)fail();
 if(Array.isArray(value)){if(value.length>10000)fail();for(const v of value)bounded(v,depth+1);}
 else if(object(value)){if(Object.keys(value).length>1000)fail();for(const [k,v]of Object.entries(value)){if(!identifierMap&&['__proto__','constructor','prototype'].includes(k))fail();bounded(v,depth+1,depth===0&&['courses','casework'].includes(k));}}
 else if(!['string','boolean','number'].includes(typeof value)&&value!==null)fail();
 else if(typeof value==='number'&&!Number.isFinite(value))fail();
}
const ids=value=>{if(!Array.isArray(value)||value.some(v=>typeof v!=='string'||!v.length||v.length>120))fail();return [...new Set(value)].sort();};
const indices=value=>{if(!Array.isArray(value)||value.some(v=>!integer(v)))fail();return [...new Set(value)].sort((a,b)=>a-b);};
function normalizeCourse(value){
 if(!object(value))fail();const result=clone(value);
 for(const k of ['materialsRead','readingOpened','transferChoices'])result[k]=indices(own(value,k)?value[k]:[]);
 for(const k of ['caseChoice','quizChoice']){const v=value[k]??null;if(v!==null&&!integer(v))fail();result[k]=v;}
 for(const k of ['decisionOpened','transferSubmitted','podcastOpened']){if(own(value,k)&&typeof value[k]!=='boolean')fail();result[k]=value[k]??false;}
 for(const k of ['completedUnits','totalUnits'])if(own(value,k)&&!integer(value[k]))fail();
 if(own(value,'completedUnits')&&own(value,'totalUnits')&&value.completedUnits>value.totalUnits)fail();
 return result;
}
export function normalizeSharedSnapshot(value){
 if(!object(value))fail();bounded(value);if(new TextEncoder().encode(JSON.stringify(value)).length>131072)fail();
 const result=clone(value);
 for(const k of ['_sync','_optionalPending','_syncBase','_syncWriter','_branches'])delete result[k];
 if(own(value,'courses')&&!object(value.courses))fail();
 result.courses=Object.fromEntries(Object.entries(value.courses??{}).map(([id,v])=>{if(!id.length||id.length>120)fail();return [id,normalizeCourse(v)];}));
 if(own(value,'certificateName')&&(typeof value.certificateName!=='string'||[...value.certificateName].length>120))fail();
 result.certificateName=value.certificateName??'';
 for(const k of ['practiceMistakes','completedCareerTopics','completedCasefileVariants'])result[k]=ids(own(value,k)?value[k]:[]);
 if(result.completedCasefileVariants.some(v=>!(/^[A-Z0-9_-]{1,40}$/).test(v)))fail();
 if(own(value,'casework')&&!object(value.casework))fail();
 result.casework=Object.fromEntries(Object.entries(value.casework??{}).map(([id,v])=>{
  if(!id.length||id.length>120||!object(v)||!Number.isInteger(v.step)||v.step<0||v.step>2||typeof v.completed!=='boolean')fail();
  for(const k of ['decisionSeen','completionConfirmed'])if(own(v,k)&&typeof v[k]!=='boolean')fail();
  const confirmed=v.completed&&v.completionConfirmed===true;
  return [id,{...v,decisionSeen:v.decisionSeen===true||v.step===2||v.completed,completionConfirmed:confirmed,completed:confirmed}];
 }));
 const epoch=own(value,'_resetEpoch')?value._resetEpoch:'';if(typeof epoch!=='string'||(epoch!==''&&!/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(epoch)))fail();
 result._resetEpoch=epoch.toLowerCase();bounded(result);
 if(new TextEncoder().encode(JSON.stringify(result)).length>131072)fail();
 return result;
}
const canonical=v=>Array.isArray(v)?v.map(canonical):object(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
export const sameSharedValue=(a,b)=>JSON.stringify(canonical(a))===JSON.stringify(canonical(b));
export function mergeSharedSnapshots(baseValue,localValue,remoteValue){
 const base=normalizeSharedSnapshot(baseValue),local=normalizeSharedSnapshot(localValue),remote=normalizeSharedSnapshot(remoteValue);
 if(sameSharedValue(local,remote))return {ok:true,snapshot:local};
 if(sameSharedValue(local,base))return {ok:true,snapshot:remote};
 if(sameSharedValue(remote,base))return {ok:true,snapshot:local};
 if(local._resetEpoch!==base._resetEpoch||remote._resetEpoch!==base._resetEpoch)return {ok:false,conflicts:['_resetEpoch']};
 const conflicts=[],result={};
 const choose=(b,l,r,path)=>{
  if(sameSharedValue(l,r)||sameSharedValue(r,b))return clone(l);
  if(sameSharedValue(l,b))return clone(r);
  conflicts.push(path);return undefined;
 };
 for(const key of new Set([...Object.keys(base),...Object.keys(local),...Object.keys(remote)])){
  const b=get(base,key),l=get(local,key),r=get(remote,key);let next;
  if(['courses','casework'].includes(key)){
   next={};for(const id of new Set([...Object.keys(b),...Object.keys(l),...Object.keys(r)])){
    // A removal and a concurrent change is a conflict, including across courses.
    if(own(b,id)&&!own(l,id)&&!own(r,id))continue;
    if(own(b,id)&&(!own(l,id)||!own(r,id))){conflicts.push(key+'.'+id);continue;}
    const value=choose(get(b,id),get(l,id),get(r,id),key+'.'+id);if(value!==undefined)Object.defineProperty(next,id,{value,enumerable:true,writable:true,configurable:true});
   }
  }else if(['practiceMistakes','completedCareerTopics','completedCasefileVariants'].includes(key)&&!sameSharedValue(l,r)&&!sameSharedValue(l,b)&&!sameSharedValue(r,b)){
   if(b.some(id=>l.includes(id)!==r.includes(id)))conflicts.push(key);
   else next=[...new Set([...l,...r])].sort();
  }else next=choose(b,l,r,key);
  if(next!==undefined)Object.defineProperty(result,key,{value:next,enumerable:true,writable:true,configurable:true});
 }
 if(conflicts.length)return {ok:false,conflicts:[...new Set(conflicts)].sort()};
 try{return {ok:true,snapshot:normalizeSharedSnapshot(result)};}
 catch{return {ok:false,conflicts:['_capacity']};}
}
