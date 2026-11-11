import {normalizeSharedSnapshot,sharedPayloadFromCache,sameSharedValue} from './shared-learning.mjs?v=20261111-guided-learning';

// Every substantive version gets its own immutable key. localStorage has no CAS:
// acknowledging an old key must never remove a newer version written meanwhile.
export function progressJournal(owner,storage,{id=crypto.randomUUID()}={}){
 const identity=owner??'guest',prefix='rm-web-learning-outbox-v1:'+encodeURIComponent(identity)+':';
 const savedPrefix='rm-web-learning-saved-v1:'+encodeURIComponent(identity)+':';
 const acceptedPrefix='rm-web-learning-accepted-v1:'+encodeURIComponent(identity)+':';
 let current=null,ownAcceptance=null;
 const invalid=()=>{throw Error('Ein gespeicherter Lernstand aus einem anderen Fenster konnte nicht gelesen werden. Er bleibt erhalten.');};
 const keys=()=>{const result=[];if(Number.isInteger(storage.length)&&typeof storage.key==='function')for(let i=0;i<storage.length;i++){const k=storage.key(i);if(typeof k==='string')result.push(k);}return result;};
 function read(k,raw){
  if(typeof raw!=='string'||raw.length>400000)invalid();let record;try{record=JSON.parse(raw);}catch{invalid();}
  if(record?.version!==1||record.owner!==identity||!Number.isSafeInteger(record.revision)||record.revision<0||!Number.isSafeInteger(record.generation)||record.generation<0)invalid();
  const pendingOptional=record.pendingOptional??[],writer=record.writer??k.slice(prefix.length).split(':')[0];
  if(typeof writer!=='string'||!writer.length||!Array.isArray(pendingOptional)||pendingOptional.some(k=>!['casework','completedCasefileVariants','completedCareerTopics','practiceMistakes'].includes(k))||(record.resetMissing!==undefined&&typeof record.resetMissing!=='boolean'))invalid();
  return {...record,writer,key:k,serialized:raw,pendingOptional,resetMissing:record.resetMissing===true,payload:normalizeSharedSnapshot(record.payload),base:record.base===null?null:normalizeSharedSnapshot(record.base)};
 }
 function acceptedKey(branchKey){return acceptedPrefix+branchKey.slice(prefix.length);}
 function readAcceptance(k){
  const raw=storage.getItem(k);if(!raw)return null;let row;try{row=JSON.parse(raw);}catch{invalid();}
  if(row.owner!==identity||typeof row.writer!=='string'||!Number.isSafeInteger(row.revision)||row.revision<0||typeof row.serialized!=='string')invalid();
  return {...row,payload:normalizeSharedSnapshot(row.payload),confirmed:normalizeSharedSnapshot(row.confirmed)};
 }
 const versionValue=r=>({version:r.version,owner:r.owner,writer:r.writer,revision:r.revision,generation:r.generation,payload:r.payload,base:r.base,pendingOptional:r.pendingOptional,resetMissing:r.resetMissing});
 return {
  writer:id,
  adoption(){
   const accepted=keys().filter(k=>k.startsWith(acceptedPrefix)).map(k=>({key:k,row:readAcceptance(k)})).filter(v=>v.row?.writer===id);
   if(ownAcceptance)accepted.push({key:null,row:ownAcceptance});accepted.sort((a,b)=>b.row.revision-a.row.revision);
   const latest=accepted[0]?.row??null;
   // Only this writer cleans its superseded acknowledgments, after observing a
   // later confirmed server revision. Other writers never modify these keys.
   for(const item of accepted.slice(1))if(item.key&&item.row.revision<latest.revision)storage.removeItem?.(item.key);
   return latest;
  },
  validateCache(raw){
   if(raw===null)return;let value;try{value=JSON.parse(raw);}catch{invalid();}sharedPayloadFromCache(value);
   if(value._sync!==undefined&&(!Number.isSafeInteger(value._sync?.revision)||value._sync.revision<0||typeof value._sync.dirty!=='boolean'))invalid();
   if(value._syncBase!=null)normalizeSharedSnapshot(value._syncBase);
  },
  record(payload,base,revision,generation,{pendingOptional=[],resetMissing=false}={}){
   const record={version:1,owner:identity,writer:id,revision,generation,payload:sharedPayloadFromCache(payload),base:base===null?null:normalizeSharedSnapshot(base),pendingOptional:[...pendingOptional],resetMissing,createdAt:Date.now(),immutable:true};
   if(current&&sameSharedValue(versionValue(record),versionValue(current)))return {...current};
   const previous=current,key=prefix+id+':'+crypto.randomUUID(),serialized=JSON.stringify(record);
   // Persist the replacement first. If cleanup fails, both versions survive.
   storage.setItem(key,serialized);current=read(key,serialized);
   if(previous?.immutable)storage.removeItem?.(previous.key);
   return {...current};
  },
  pending(){
   const result=keys().filter(k=>k.startsWith(prefix)).map(k=>read(k,storage.getItem(k)));
   if(current&&!result.some(r=>r.key===current.key))result.push({...current});
   return result.filter(r=>readAcceptance(acceptedKey(r.key))?.serialized!==r.serialized);
  },
  consume(claims,revision=0,confirmed={}){
   for(const claim of claims){
    if(claim.owner!==identity||!claim.key.startsWith(prefix))throw Error('Das Konto wurde geändert.');
    const acknowledgment={owner:identity,writer:claim.writer,serialized:claim.serialized,payload:claim.payload,confirmed:normalizeSharedSnapshot(confirmed),revision};
    storage.setItem(acceptedKey(claim.key),JSON.stringify(acknowledgment));if(claim.writer===id)ownAcceptance=acknowledgment;
    // New version keys are never reused. Removing one cannot remove a later edit.
    if(claim.immutable)storage.removeItem?.(claim.key);
    if(current?.key===claim.key&&current.serialized===claim.serialized)current=null;
   }
  },
  preserveLegacy(raw){
   if(!raw)return;this.validateCache(raw);const cached=JSON.parse(raw);if(cached?._sync?.dirty!==true)return;
   const payload=sharedPayloadFromCache(cached),base=cached._syncBase?normalizeSharedSnapshot(cached._syncBase):null,revision=cached._sync.revision;
   if(this.pending().some(r=>sameSharedValue(r.payload,payload)&&r.revision===revision))return;
   const pendingOptional=Array.isArray(cached._optionalPending)?cached._optionalPending:['casework','completedCasefileVariants','completedCareerTopics','practiceMistakes'].filter(k=>!Object.hasOwn(cached,k));
   const writer='legacy-'+crypto.randomUUID(),record={version:1,owner:identity,writer,revision,generation:0,payload,base,pendingOptional,resetMissing:!Object.hasOwn(cached,'_resetEpoch'),createdAt:Date.now(),immutable:true};
   storage.setItem(prefix+writer+':'+crypto.randomUUID(),JSON.stringify(record));
  },
  preserve(payload,reason='Vorheriger Lernstand'){
   const record={owner:identity,createdAt:Date.now(),reason,payload:normalizeSharedSnapshot(payload)};
   const savedKey=savedPrefix+crypto.randomUUID();storage.setItem(savedKey,JSON.stringify(record));return savedKey;
  },
  saved(){return keys().filter(k=>k.startsWith(savedPrefix)).map(k=>{let r;try{r=JSON.parse(storage.getItem(k));}catch{invalid();}if(r.owner!==identity)invalid();return {...r,key:k,payload:normalizeSharedSnapshot(r.payload)};}).sort((a,b)=>b.createdAt-a.createdAt);}
 };
}
