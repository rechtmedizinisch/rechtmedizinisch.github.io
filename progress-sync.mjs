// Optimistic concurrency: never overwrite a newer cloud revision silently.
export function progressSync(store,transport,owner,onState=()=>{}){
  let stopped=false,running=false,conflict=null,timer=null;
  const notify=(state)=>{if(!stopped)onState(state);};
  const payload=()=>({courses:store.snapshot.courses,certificateName:store.snapshot.certificateName??'',completedCareerTopics:store.snapshot.completedCareerTopics??[]});
  async function sync(){
    if(stopped||running||conflict)return;running=true;let repeat=false;notify({kind:'syncing'});
    try{
      const cloud=await transport.read(owner);if(stopped)return;
      const local=store.syncState;
      if(local.dirty&&cloud.revision!==local.revision){conflict=cloud;notify({kind:'conflict'});return;}
      if(!local.dirty){store.acceptRemote(cloud.payload,cloud.revision);notify({kind:'saved'});return;}
      const sent=payload(),generation=store.generation;
      const result=await transport.write(owner,local.revision,sent);if(stopped)return;
      if(!result.ok){conflict=await transport.read(owner);notify({kind:'conflict'});return;}
      store.acknowledge(result.revision,generation);repeat=store.syncState.dirty;notify({kind:repeat?'pending':'saved'});
    }catch{notify({kind:'offline'});}finally{running=false;if(repeat&&!stopped&&!conflict)schedule();}
  }
  function schedule(){clearTimeout(timer);timer=setTimeout(()=>{timer=null;sync();},1500);}
  const unsubscribe=store.subscribe(change=>{if(change==='local'&&!stopped)schedule();});
  return {sync,
    async resolve(useCloud){if(!conflict||stopped)return;const remote=conflict;conflict=null;
      if(useCloud){store.acceptRemote(remote.payload,remote.revision);notify({kind:'saved'});}
      else {store.rebase(remote.revision);await sync();}
    },
    stop(){stopped=true;clearTimeout(timer);unsubscribe();}
  };
}
