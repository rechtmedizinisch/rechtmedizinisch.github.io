const LIMIT=620000;
const bytes=value=>new TextEncoder().encode(value).length;
const valid=(owner,variant)=>typeof owner==='string'&&owner.length>0&&owner.length<=200&&['A','B','C','THERAPY_A','THERAPY_B','THERAPY_C','INFUSION_A','INFUSION_B','INFUSION_C'].includes(variant);
export function casefileStore(factory=globalThis.indexedDB){
 let connection,epoch=0;const pending=new Set();
 const cancelPending=()=>{epoch++;for(const tx of pending)try{tx.abort();}catch{};};
 async function database(){
  if(!factory)throw Error('Ihr Browser erlaubt gerade keine dauerhafte Akten-Speicherung. Bitte prüfen Sie die Browsereinstellungen.');
  if(!connection)connection=new Promise((resolve,reject)=>{const request=factory.open('rm-casefiles-v1',1);request.onupgradeneeded=()=>request.result.createObjectStore('checkpoints');request.onsuccess=()=>{const db=request.result;db.onversionchange=()=>{db.close();connection=null;};resolve(db);};request.onerror=()=>{connection=null;reject(request.error);};request.onblocked=()=>{connection=null;reject(Error('Bitte schließen Sie ältere Fenster der Strafakte und versuchen Sie es erneut.'));};});
  return connection;
 }
 async function transaction(owner,variant,mode,change,slot=null,isCurrent=()=>true){
  if(!valid(owner,variant))throw Error('Die Fallvariante oder das Lernkonto ist ungültig.');
  const ticket=epoch;const requireCurrent=()=>{if(ticket!==epoch||!isCurrent())throw Error('Akte geschlossen. Ihr bisheriger Stand bleibt erhalten.');};
  requireCurrent();const db=await database();requireCurrent();const key=JSON.stringify(slot?[owner,variant,slot]:[owner,variant]);
  return new Promise((resolve,reject)=>{
   const tx=db.transaction('checkpoints',mode),store=tx.objectStore('checkpoints');pending.add(tx);let result,failure;
   tx.oncomplete=()=>{pending.delete(tx);resolve(result);};tx.onerror=tx.onabort=()=>{pending.delete(tx);reject(failure??tx.error??Error('Der Aktenstand konnte nicht gespeichert werden. Ihr bisheriger Stand bleibt erhalten.'));};
   const request=store.get(key);request.onsuccess=()=>{
    try{requireCurrent();const missing=request.result===undefined,old=missing?{revision:0,json:null}:request.result;if(!missing&&(!old||!Number.isSafeInteger(old.revision)||old.revision<1||typeof old.json!=='string'||!old.json.trim()||bytes(old.json)>LIMIT))throw Error('Die vorhandene Sicherung ist nicht lesbar. Sie bleibt unverändert erhalten.');
     const next=change(old,store);result=next;if(mode==='readwrite'&&next!==old)store.put(next,key);
    }catch(error){failure=error;tx.abort();}
   };
  });
 }
 return {
  read:(owner,variant)=>transaction(owner,variant,'readonly',old=>old),
  save:(owner,variant,expected,json,{review=false,isCurrent=()=>true}={})=>transaction(owner,variant,'readwrite',(old,store)=>{
   if(typeof json!=='string'||!json.trim()||bytes(json)>LIMIT)throw Error('Die Akte ist zu umfangreich. Ihr bisheriger Stand bleibt erhalten.');
   if(old.revision!==expected)throw Error('Der Aktenstand wurde in einem anderen Fenster aktualisiert. Bitte öffnen Sie die Akte erneut.');
   if(review&&old.json!==json&&old.json)store.put(old,JSON.stringify([owner,variant,'previous']));
   return old.json===json?old:{revision:old.revision+1,json};
  },null,isCurrent),
  archive:(owner,variant,expected,{isCurrent=()=>true}={})=>transaction(owner,variant,'readwrite',(old,store)=>{
   if(old.revision!==expected||!old.json)throw Error('Der Aktenstand hat sich geändert. Bitte öffnen Sie ihn erneut.');
   store.put(old,JSON.stringify([owner,variant,'archive-'+old.revision]));return old;
  },null,isCurrent),
  previous:(owner,variant)=>transaction(owner,variant,'readonly',old=>old,'previous'),
  saveSummary:(owner,variant,checkpointRevision,summary,{isCurrent=()=>true}={})=>transaction(owner,variant,'readwrite',(old,store)=>{if(old.revision===checkpointRevision)store.put({revision:1,json:JSON.stringify({checkpointRevision,summary})},JSON.stringify([owner,variant,'summary']));return old;},null,isCurrent),
  status:async(owner,variant)=>{const [saved,meta]=await Promise.all([transaction(owner,variant,'readonly',old=>old),transaction(owner,variant,'readonly',old=>old,'summary')]);if(!saved.json)return null;const record=meta.json?JSON.parse(meta.json):null;return record?.checkpointRevision===saved.revision?record.summary:{needsHydration:true,saved};},
  cancelPending,
  close:async()=>{cancelPending();const opening=connection;connection=null;if(opening)try{(await opening).close();}catch{} }
 };
}
