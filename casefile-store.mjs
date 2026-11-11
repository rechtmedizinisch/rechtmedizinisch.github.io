const LIMIT=620000;
const bytes=value=>new TextEncoder().encode(value).length;
const valid=(owner,variant)=>typeof owner==='string'&&owner.length>0&&owner.length<=200&&['A','B','C','THERAPY_A','THERAPY_B','THERAPY_C','INFUSION_A','INFUSION_B','INFUSION_C'].includes(variant);
export function casefileStore(factory=globalThis.indexedDB){
 let connection;
 async function database(){
  if(!factory)throw Error('Ihr Browser erlaubt gerade keine dauerhafte Akten-Speicherung. Bitte prüfen Sie die Browsereinstellungen.');
  if(!connection)connection=new Promise((resolve,reject)=>{const request=factory.open('rm-casefiles-v1',1);request.onupgradeneeded=()=>request.result.createObjectStore('checkpoints');request.onsuccess=()=>{const db=request.result;db.onversionchange=()=>{db.close();connection=null;};resolve(db);};request.onerror=()=>{connection=null;reject(request.error);};request.onblocked=()=>{connection=null;reject(Error('Bitte schließen Sie ältere Fenster der Strafakte und versuchen Sie es erneut.'));};});
  return connection;
 }
 async function transaction(owner,variant,mode,change){
  if(!valid(owner,variant))throw Error('Die Fallvariante oder das Lernkonto ist ungültig.');
  const db=await database(),key=JSON.stringify([owner,variant]);
  return new Promise((resolve,reject)=>{
   const tx=db.transaction('checkpoints',mode),store=tx.objectStore('checkpoints');let result,failure;
   tx.oncomplete=()=>resolve(result);tx.onerror=tx.onabort=()=>reject(failure??tx.error??Error('Der Aktenstand konnte nicht gespeichert werden. Ihr bisheriger Stand bleibt erhalten.'));
   const request=store.get(key);request.onsuccess=()=>{
    try{const missing=request.result===undefined,old=missing?{revision:0,json:null}:request.result;if(!missing&&(!old||!Number.isSafeInteger(old.revision)||old.revision<1||typeof old.json!=='string'||!old.json.trim()||bytes(old.json)>LIMIT))throw Error('Die vorhandene Sicherung ist nicht lesbar. Sie bleibt unverändert erhalten.');
     const next=change(old);result=next;if(mode==='readwrite'&&next!==old)store.put(next,key);
    }catch(error){failure=error;tx.abort();}
   };
  });
 }
 return {
  read:(owner,variant)=>transaction(owner,variant,'readonly',old=>old),
  save:(owner,variant,expected,json)=>transaction(owner,variant,'readwrite',old=>{
   if(typeof json!=='string'||!json.trim()||bytes(json)>LIMIT)throw Error('Die Akte ist zu umfangreich. Ihr bisheriger Stand bleibt erhalten.');
   if(old.revision!==expected)throw Error('Der Aktenstand wurde in einem anderen Fenster aktualisiert. Bitte öffnen Sie die Akte erneut.');
   return old.json===json?old:{revision:old.revision+1,json};
  }),
  close:async()=>{const opening=connection;connection=null;if(opening)try{(await opening).close();}catch{} }
 };
}
