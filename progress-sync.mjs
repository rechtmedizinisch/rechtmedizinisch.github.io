import {normalizeSharedSnapshot,mergeSharedSnapshots,sameSharedValue} from './shared-learning.mjs?v=20261111-guided-learning';

const clone=value=>structuredClone(value);
const branchIdentity=branches=>branches.map(b=>({key:b.key,generation:b.generation,revision:b.revision,payload:b.payload,base:b.base,pendingOptional:b.pendingOptional,resetMissing:b.resetMissing})).sort((a,b)=>a.key.localeCompare(b.key));
function cloudRow(value){
 if(!Number.isSafeInteger(value?.revision)||value.revision<0)throw Error('Ungültiger Lernstand.');
 return {revision:value.revision,payload:normalizeSharedSnapshot(value.payload)};
}
function hydrateLegacy(branch,remote){
 const local=clone(branch.payload);
 for(const key of branch.pendingOptional){
  if(key==='casework'){
   const combined=clone(remote.casework);
   for(const [id,value]of Object.entries(local.casework)){
    const old=Object.hasOwn(combined,id)?combined[id]:null;
    Object.defineProperty(combined,id,{value:old?{...old,...value,step:Math.max(old.step,value.step),decisionSeen:old.decisionSeen||value.decisionSeen,completionConfirmed:old.completionConfirmed||value.completionConfirmed,completed:old.completed||value.completed}:value,enumerable:true,writable:true,configurable:true});
   }
   local.casework=combined;
  }else local[key]=[...new Set([...remote[key],...local[key]])];
 }
 if(branch.resetMissing)local._resetEpoch=remote._resetEpoch;
 // Fields unknown to a legacy client survive its first account upload.
 for(const [key,value]of Object.entries(remote))if(!Object.hasOwn(local,key))local[key]=clone(value);
 for(const key of ['courses','casework'])for(const [id,value]of Object.entries(local[key])){
  const old=remote[key][id];if(old)for(const [field,content]of Object.entries(old))if(!Object.hasOwn(value,field))Object.defineProperty(value,field,{value:clone(content),enumerable:true,writable:true,configurable:true});
 }
 return normalizeSharedSnapshot(local);
}

// Each write is based on the last confirmed payload; pending tabs keep their own outboxes.
export function progressSync(store,transport,owner,onState=()=>{}){
 let stopped=false,running=false,conflict=null,timer=null;
 const notify=state=>{if(!stopped)onState(state);};
 const capture=()=>({context:store.operationContext(),branches:branchIdentity(store.pendingBranches())});
 const current=context=>!stopped&&sameSharedValue(context,capture());
 function showConflict(remote,branches){conflict={remote,context:capture(),branches};notify({kind:'conflict'});}
 function schedule(){clearTimeout(timer);timer=setTimeout(()=>{timer=null;sync();},1500);}
 async function sync(){
  if(stopped||running||conflict)return;running=true;let repeat=false;notify({kind:'syncing'});
  try{
   for(let attempt=0;attempt<3;attempt++){
    store.ensureDurable();
    const remote=cloudRow(await transport.read(owner));if(stopped)return;
    // Capture after reading so an edit made while the request was in flight is included.
    store.ensureDurable();if(remote.revision<store.syncState.revision)continue;
    const branches=store.pendingBranches();let candidate=remote.payload;
    for(const branch of branches){
     if(sameSharedValue(branch.payload,candidate))continue;
     if(branch.base){
      const merged=mergeSharedSnapshots(branch.base,branch.payload,candidate);
      if(!merged.ok){showConflict(remote,branches);return;}candidate=merged.snapshot;
     }else{
      const hydrated=hydrateLegacy(branch,remote.payload);if(sameSharedValue(hydrated,candidate))continue;
      if(branch.revision!==remote.revision||!sameSharedValue(candidate,remote.payload)){showConflict(remote,branches);return;}
      candidate=hydrated;
     }
    }
    if(sameSharedValue(candidate,remote.payload)){
     store.acceptRemote(remote.payload,remote.revision,branches);repeat=store.syncState.dirty||store.pendingBranches().length>0;notify({kind:repeat?'pending':'saved'});return;
    }
    store.stageMerged(candidate,remote.revision,remote.payload);
    const generation=store.generation,sent=store.payload;
    const own=store.pendingBranches().filter(b=>b.writer===store.operationContext().writer);
    const claims=[...branches.filter(b=>!own.some(o=>o.key===b.key)),...own];
    const result=await transport.write(owner,remote.revision,sent);if(stopped)return;
    if(result?.ok===false)continue;
    if(result?.ok!==true||result.revision!==remote.revision+1)throw Error('Ungültige Bestätigung.');
    store.acknowledge(result.revision,generation,sent,claims);
    repeat=store.syncState.dirty||store.pendingBranches().length>0;notify({kind:repeat?'pending':'saved'});return;
   }
   notify({kind:'pending'});
  }catch{notify({kind:store.blocked?'invalid':'offline',message:store.error});}
  finally{running=false;if(repeat&&!stopped&&!conflict)schedule();}
 }
 const unsubscribe=store.subscribe(change=>{if(change==='local'&&!stopped)schedule();});
 const online=()=>sync();globalThis.addEventListener?.('online',online);
 return {sync,
  async resolve(useCloud){
   if(!conflict||stopped||running)return;running=true;
   try{
    const expected=conflict;const remote=cloudRow(await transport.read(owner));if(stopped)return;
    if(!current(expected.context)||remote.revision!==expected.remote.revision||!sameSharedValue(remote.payload,expected.remote.payload)){
     showConflict(remote,store.pendingBranches());return;
    }
    // Save every displaced source before removing any pending version.
    for(const branch of expected.branches)store.preserveSnapshot(branch.payload,'Vor der Auswahl eines anderen Lernstands');
    store.preserveSnapshot(remote.payload,'Vor der Auswahl eines anderen Lernstands');
    if(useCloud){store.acceptRemote(remote.payload,remote.revision,expected.branches);conflict=null;notify({kind:'saved'});return;}
    const selected=normalizeSharedSnapshot({...store.payload,_resetEpoch:crypto.randomUUID()});
    store.stageMerged(selected,remote.revision,remote.payload);
    const generation=store.generation,sent=store.payload;
    const own=store.pendingBranches().filter(b=>b.writer===store.operationContext().writer);
    const claims=[...expected.branches.filter(b=>!own.some(o=>o.key===b.key)),...own];
    const result=await transport.write(owner,remote.revision,sent);if(stopped)return;
    if(result?.ok!==true){showConflict(cloudRow(await transport.read(owner)),store.pendingBranches());return;}
    if(result.revision!==remote.revision+1)throw Error('Ungültige Bestätigung.');
    store.acknowledge(result.revision,generation,sent,claims);conflict=null;notify({kind:store.syncState.dirty?'pending':'saved'});if(store.syncState.dirty)schedule();
   }catch{notify({kind:'offline',message:store.error});}finally{running=false;}
  },
  stop(){stopped=true;clearTimeout(timer);unsubscribe();globalThis.removeEventListener?.('online',online);}
 };
}
