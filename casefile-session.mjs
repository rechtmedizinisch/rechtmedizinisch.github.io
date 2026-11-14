export function casefileSession({owner,variant,store,worker,isCurrent,onView=()=>{}}){
 let revision=0,savedRevision=0,busy=false,closed=false,view=null;
 const active=()=>!closed&&isCurrent();
 const requireActive=()=>{if(!active())throw Error('Die Akte ist nicht mehr geöffnet. Ihr gespeicherter Stand bleibt erhalten.');};
 async function accept(result,review=false){
  requireActive();if(result.checkpoint?.variant!==variant||result.view?.variant!==variant)throw Error('Die Fallvariante hat sich geändert.');
  const saved=await store.save(owner,variant,savedRevision,JSON.stringify(result.checkpoint),{review,isCurrent:active});
  requireActive();if(result.view.studySummary&&store.saveSummary)await store.saveSummary(owner,variant,saved.revision,result.view.studySummary,{isCurrent:active}).catch(()=>{});requireActive();savedRevision=saved.revision;revision=result.revision;view=result.view;onView(view);return view;
 }
 async function guarded(action){
  requireActive();if(busy)throw Error('Bitte warten Sie, bis der laufende Schritt gesichert ist.');busy=true;
  try{return await action();}catch(error){closed=true;worker.close();throw error;}finally{busy=false;}
 }
 return {
  get ready(){return !closed&&view!==null;},get view(){return view;},get busy(){return busy;},
  open:()=>guarded(async()=>{
   const saved=await store.read(owner,variant);requireActive();savedRevision=saved.revision;
   let checkpoint;const absent=saved.revision===0&&saved.json===null;if(!absent){if(!Number.isSafeInteger(saved.revision)||saved.revision<1||typeof saved.json!=='string'||!saved.json.trim())throw Error('Die gespeicherte Akte ist beschädigt. Sie bleibt unverändert erhalten.');checkpoint=JSON.parse(saved.json);if(checkpoint?.variant!==variant)throw Error('Die gespeicherte Akte gehört zu einer anderen Variante. Sie bleibt unverändert erhalten.');}
   let result=await worker.dispatch(checkpoint?{op:'beginRestore',checkpoint}:{op:'initialize',variant}),batches=0;
   while(result.restoring){requireActive();if(++batches>252)throw Error('Die Wiederherstellung konnte nicht beendet werden. Die Sicherung bleibt erhalten.');await new Promise(resolve=>setTimeout(resolve,0));requireActive();result=await worker.dispatch({op:'continueRestore',restoreToken:result.restoreToken});}
   return accept(result);
  }),
  apply:(op,args={},kind='command')=>guarded(async()=>{
   if(kind==='review'){
    if(op==='restoreSaved'){const previous=await store.previous(owner,variant);requireActive();if(!previous.json)throw Error('Es ist kein früherer Stand gesichert.');args={checkpoint:JSON.parse(previous.json)};}
    await store.archive(owner,variant,savedRevision,{isCurrent:active});requireActive();
   }
   let result=await worker.dispatch({op:'apply',revision,action:{kind,op,args}}),batches=0;
   while(result.restoring){requireActive();if(++batches>252)throw Error('Die Wiederholung konnte nicht beendet werden. Ihr bisheriger Stand bleibt erhalten.');await new Promise(resolve=>setTimeout(resolve,0));result=await worker.dispatch({op:'continueRestore',restoreToken:result.restoreToken});}
   return accept(result,kind==='review');
  }),
  history:page=>guarded(async()=>accept(await worker.dispatch({op:'inspect',revision,logPage:page}))),
  export:async()=>{requireActive();const saved=await store.read(owner,variant);requireActive();if(!saved.json)throw Error('Es ist noch kein gesicherter Aktenstand vorhanden.');return saved.json;},
  close:()=>{closed=true;store.cancelPending?.();worker.close();}
 };
}
