// This worker receives the verified course script and commands, never a login token.
export async function casefileWorker(script,expectedHash,{WorkerClass=globalThis.Worker,crypto=globalThis.crypto}={}){
 if(typeof script!=='string'||new TextEncoder().encode(script).length>250000)throw Error('Die Strafakte konnte nicht geprüft werden.');
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(script)),hash=[...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('');
 if(hash!==expectedHash)throw Error('Die Strafakte wurde aktualisiert. Bitte laden Sie die Seite erneut.');
 const url=URL.createObjectURL(new Blob([script,'\nself.onmessage=function(e){try{self.postMessage({id:e.data.id,result:RMCasefile.dispatchJSON(e.data.request)});}catch(error){self.postMessage({id:e.data.id,error:"Die Fallberechnung konnte nicht beendet werden."});}};'],{type:'text/javascript'}));
 let worker;try{worker=new WorkerClass(url);}finally{URL.revokeObjectURL(url);}
 let sequence=0,closed=false;const pending=new Map();
 function close(){if(closed)return;closed=true;worker.terminate();for(const {reject,timer} of pending.values()){clearTimeout(timer);reject(Error('Akte geschlossen. Ihr gespeicherter Stand bleibt erhalten.'));}pending.clear();}
 worker.onerror=()=>close();worker.onmessage=event=>{const entry=pending.get(event.data?.id);if(!entry)return;pending.delete(event.data.id);clearTimeout(entry.timer);try{if(event.data.error)throw Error(event.data.error);if(typeof event.data.result!=='string'||event.data.result.length>2200000)throw Error('Die Antwort ist nicht lesbar.');const result=JSON.parse(event.data.result);if(!result.ok)throw Error(result.error??'Die Eingabe konnte nicht verarbeitet werden.');entry.resolve(result);}catch(error){entry.reject(error);}};
 return {close,dispatch:request=>new Promise((resolve,reject)=>{if(closed){reject(Error('Bitte öffnen Sie die Akte erneut.'));return;}const id=++sequence,timer=setTimeout(()=>close(),10000);pending.set(id,{resolve,reject,timer});worker.postMessage({id,request:JSON.stringify(request)});})};
}
