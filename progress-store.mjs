import {normalizeSharedSnapshot,sharedPayloadFromCache,mergeSharedSnapshots,sameSharedValue} from './shared-learning.mjs?v=20261111-guided-learning';
import {progressJournal} from './progress-journal.mjs?v=20261111-guided-learning';
import {initialState,restore,transition} from './casework-state.mjs?v=20261111-guided-learning';
import {emptyCourseProgress} from './progress-engine.mjs?v=20261111-guided-learning';
import {resumeStore} from './learning-resume.mjs?v=20261111-guided-learning';
export const progressKey=owner=>'rm-web-learning-v1:'+(owner||'guest');
const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
function normalizeCourse(value){
  const result=emptyCourseProgress();
  if(!object(value))return result;
  for(const key of ['materialsRead','transferChoices','readingOpened'])
    result[key]=Array.isArray(value[key])?[...new Set(value[key].filter(n=>Number.isSafeInteger(n)&&n>=0))]:[];
  for(const key of ['caseChoice','quizChoice'])result[key]=Number.isSafeInteger(value[key])&&value[key]>=0?value[key]:null;
  for(const key of ['decisionOpened','transferSubmitted','podcastOpened'])result[key]=value[key]===true;
  for(const key of ['completedUnits','totalUnits'])if(Number.isSafeInteger(value[key])&&value[key]>=0)result[key]=value[key];
  return result;
}
function normalizeSnapshot(value){
  const wire=sharedPayloadFromCache(value);
  const validSync=object(value?._sync)&&Number.isSafeInteger(value._sync.revision)&&value._sync.revision>=0&&typeof value._sync.dirty==='boolean';
  const hasWork=Object.keys(wire.courses).length>0||wire.certificateName.length>0||wire.completedCareerTopics.length>0||wire.practiceMistakes.length>0||Object.keys(wire.casework).length>0||wire.completedCasefileVariants.length>0;
  return {...wire,_sync:validSync?{revision:value._sync.revision,dirty:value._sync.dirty}:{revision:0,dirty:hasWork}};
}
function legacyReadableSnapshot(value){
  const courses=Object.fromEntries(Object.entries(object(value?.courses)?value.courses:{}).map(([id,course])=>[id,normalizeCourse(course)]));
  const certificateName=typeof value?.certificateName==='string'?value.certificateName:'';
  const validSync=object(value?._sync)&&Number.isSafeInteger(value._sync.revision)&&value._sync.revision>=0&&typeof value._sync.dirty==='boolean';
  const completedCareerTopics=Array.isArray(value?.completedCareerTopics)?[...new Set(value.completedCareerTopics.filter(id=>typeof id==='string'&&id.length<=120))]:[];
  const practiceMistakes=Array.isArray(value?.practiceMistakes)?[...new Set(value.practiceMistakes.filter(id=>typeof id==='string'&&id.length<=120))]:[];
  const completedCasefileVariants=Array.isArray(value?.completedCasefileVariants)?[...new Set(value.completedCasefileVariants.filter(id=>typeof id==='string'&&/^[A-Z0-9_-]{1,40}$/.test(id)))]:[];
  const raw=object(value?.casework)?value.casework:{};
  const casework=restore(JSON.stringify(raw),Object.keys(raw).filter(id=>id.length<=120));
  return {courses,certificateName,completedCareerTopics,practiceMistakes,casework,completedCasefileVariants,_sync:validSync?{revision:value._sync.revision,dirty:value._sync.dirty}:{revision:0,dirty:Object.keys(courses).length>0||certificateName.length>0||completedCareerTopics.length>0||practiceMistakes.length>0||Object.keys(casework).length>0||completedCasefileVariants.length>0}};
}
export function progressStore(owner,storage=localStorage,options={}){
  const key=progressKey(owner),journal=progressJournal(owner,storage,options);
  let base=null,blocked=false,savedValue=null,retired=false,lastAdoption=null,observedCacheRaw=null;
  const resume=resumeStore(owner,storage);
  let snapshot={courses:{},certificateName:'',completedCareerTopics:[],practiceMistakes:[],casework:{},completedCasefileVariants:[],_sync:{revision:0,dirty:false}},error=null,generation=0,contextGeneration=0;
  const optionalKeys=['casework','completedCasefileVariants','completedCareerTopics','practiceMistakes'];let pendingOptional=new Set(optionalKeys),resetMissing=true;
  try{observedCacheRaw=storage.getItem(key);const saved=JSON.parse(observedCacheRaw||'null');savedValue=saved;if(saved){snapshot=normalizeSnapshot(saved);pendingOptional=new Set(Array.isArray(saved._optionalPending)?saved._optionalPending.filter(k=>optionalKeys.includes(k)):optionalKeys.filter(k=>!Object.hasOwn(saved,k)));}
    if(saved?._syncBase)base=normalizeSharedSnapshot(saved._syncBase);else if(saved&&snapshot._sync.dirty===false&&snapshot._sync.revision>0)base=normalizeSharedSnapshot(snapshot);
    resetMissing=!Object.hasOwn(saved??{},'_resetEpoch');
    if(owner&&!Object.hasOwn(saved??{},'practiceMistakes')){const legacy=JSON.parse(storage.getItem('rm-web-practice-v1:'+owner)||'[]');const migrated=normalizeSnapshot({practiceMistakes:legacy}).practiceMistakes;if(migrated.length){snapshot.practiceMistakes=migrated;snapshot._sync.dirty=true;}}
  }catch{if(object(savedValue))snapshot=legacyReadableSnapshot(savedValue);blocked=true;error='Der gespeicherte Lernstand konnte nicht gelesen werden. Die vorhandene Fassung bleibt erhalten.';}
  const listeners=new Set();
  return {
    get resumeLocation(){return resume.location;},
    rememberLocation(location){return resume.remember(location);},
    get error(){return error;},get blocked(){return blocked;},get snapshot(){return structuredClone(snapshot);},get generation(){return generation;},
    retire(){retired=true;listeners.clear();},
    operationContext(){return {writer:journal.writer,generation,contextGeneration,revision:this.syncState.revision};},
    isCurrent(context){return !retired&&context?.writer===journal.writer&&context.generation===generation&&context.contextGeneration===contextGeneration&&context.revision===this.syncState.revision;},
    get payload(){return sharedPayloadFromCache(snapshot);},get baseSnapshot(){return base?structuredClone(base):null;},
    pendingBranches(){return journal.pending();},
    savedSnapshots(){return journal.saved();},
    preserveSnapshot(payload,reason){return journal.preserve(payload,reason);},
    consumeBranches(claims){journal.consume(claims);},
    ensureDurable(){if(blocked)throw Error(error);if(!this.save('remote'))throw Error(error);},
    stageMerged(payload,revision,confirmedBase){if(retired)throw Error('Das Konto wurde geändert.');if(revision<this.syncState.revision)throw Error('Die Kontofassung wurde inzwischen aktualisiert.');if(!sameSharedValue(this.payload,normalizeSharedSnapshot(payload)))contextGeneration++;base=normalizeSharedSnapshot(confirmedBase);snapshot=normalizeSnapshot({...payload,_sync:{revision,dirty:true}});pendingOptional.clear();resetMissing=false;if(!this.save('remote'))throw Error(error);},
    get syncState(){return {...(snapshot._sync??{revision:0,dirty:Object.keys(snapshot.courses).length>0})};},
    course(id){return normalizeCourse(snapshot.courses[id]);},
    update(id,patch){snapshot.courses[id]={...(snapshot.courses[id]??{}),...this.course(id),...structuredClone(patch)};this.save();},
    recordStatus(id,status){if(!snapshot.courses[id]&&status.completedUnits===0)return;const before=this.course(id);if(before.completedUnits===status.completedUnits&&before.totalUnits===status.totalUnits)return;snapshot.courses[id]={...snapshot.courses[id],...before,completedUnits:status.completedUnits,totalUnits:status.totalUnits};this.save();},
    caseworkState(id){return {...initialState(id),...(Object.hasOwn(snapshot.casework,id)?snapshot.casework[id]:{})};},
    caseworkAction(id,action){if(typeof id!=='string'||id.length>120)return;Object.defineProperty(snapshot.casework,id,{value:transition(this.caseworkState(id),action),enumerable:true,writable:true,configurable:true});this.save();},
    markCasefileComplete(id){if(typeof id!=='string'||!(/^[A-Z0-9_-]{1,40}$/).test(id)||snapshot.completedCasefileVariants.includes(id))return;snapshot.completedCasefileVariants.push(id);this.save();},
    recordPracticeAnswer(id,right){snapshot.practiceMistakes=snapshot.practiceMistakes.filter(x=>x!==id);if(!right)snapshot.practiceMistakes.push(id);this.save();},
    markCareerRead(id){if(snapshot.completedCareerTopics.includes(id))return;snapshot.completedCareerTopics.push(id);this.save();},
    setCertificateName(name){snapshot.certificateName=name;this.save();},
    replaceLearning(payload,context=this.operationContext()){
      if(!this.isCurrent(context))throw Error('Der Lernstand hat sich geändert. Bitte öffnen Sie die Auswahl erneut.');
      const replacement=normalizeSnapshot({...snapshot,...payload,_resetEpoch:crypto.randomUUID()});
      journal.preserve(this.payload,'Vor einer bewussten Übernahme');
      for(const key of optionalKeys)if(Object.hasOwn(payload,key))pendingOptional.delete(key);
      resetMissing=false;replacement._sync=this.syncState;snapshot=replacement;this.save();
    },
    resetLearning(context=this.operationContext()){this.replaceLearning({courses:{},certificateName:'',completedCareerTopics:[],practiceMistakes:[],casework:{},completedCasefileVariants:[]},context);if(!this.error)resume.clear();},
    acceptRemote(payload,revision,claims=[]){if(blocked||retired)throw Error(error??'Das Konto wurde geändert.');if(revision<this.syncState.revision)throw Error('Die Kontofassung wurde inzwischen aktualisiert.');if(!sameSharedValue(this.payload,normalizeSharedSnapshot(payload)))contextGeneration++;base=normalizeSharedSnapshot(payload);pendingOptional.clear();resetMissing=false;snapshot=normalizeSnapshot({...payload,_sync:{revision,dirty:false}});if(!this.save('remote'))throw Error(error);journal.consume(claims,revision,payload);},
    hydrateOptional(payload){
      if(!pendingOptional.size)return;
      const remote=normalizeSnapshot(payload);
      if(pendingOptional.has('casework')){
        const combined=structuredClone(remote.casework);
        for(const [id,local] of Object.entries(snapshot.casework)){
          const old=Object.hasOwn(combined,id)?combined[id]:null;
          const value=old?{step:Math.max(old.step,local.step),decisionSeen:old.decisionSeen||local.decisionSeen,completionConfirmed:old.completionConfirmed||local.completionConfirmed,completed:old.completed||local.completed}:local;
          Object.defineProperty(combined,id,{value,enumerable:true,writable:true,configurable:true});
        }
        snapshot.casework=combined;
      }
      if(pendingOptional.has('completedCasefileVariants'))snapshot.completedCasefileVariants=[...new Set([...remote.completedCasefileVariants,...snapshot.completedCasefileVariants])];
      pendingOptional.clear();this.save('remote');
    },
    acknowledge(revision,sentGeneration,sentPayload=this.payload,claims=[]){if(retired)throw Error('Das Konto wurde geändert.');base=normalizeSharedSnapshot(sentPayload);snapshot._sync={revision,dirty:generation!==sentGeneration};if(!this.save('remote'))throw Error(error);journal.consume(claims,revision,sentPayload);},
    rebase(revision){snapshot._sync={revision,dirty:true};this.save('remote');},
    save(origin='local'){
      if(blocked||retired)return false;
      if(origin==='local'){generation++;snapshot._sync={revision:this.syncState.revision,dirty:true};}
      try{
        const adoption=journal.adoption();
        const adoptionVersion=adoption?adoption.revision+':'+adoption.serialized:null;
        if(adoption&&adoptionVersion!==lastAdoption){
          if(adoption.revision>=this.syncState.revision){
            const merged=mergeSharedSnapshots(adoption.payload,this.payload,adoption.confirmed);
            if(merged.ok){if(!sameSharedValue(this.payload,merged.snapshot))contextGeneration++;base=adoption.confirmed;snapshot=normalizeSnapshot({...merged.snapshot,_sync:{revision:adoption.revision,dirty:!sameSharedValue(merged.snapshot,adoption.confirmed)}});pendingOptional.clear();resetMissing=false;}
          }
          lastAdoption=adoptionVersion;
        }
        sharedPayloadFromCache(snapshot);
        const old=storage.getItem(key);let oldWriter;try{oldWriter=JSON.parse(old??'null')?._syncWriter;}catch{}
        journal.validateCache(old);
        if(old!==observedCacheRaw&&oldWriter!==journal.writer)journal.preserveLegacy(old);
        if(this.syncState.dirty)journal.record(snapshot,base,this.syncState.revision,generation,{pendingOptional,resetMissing});
        const next=JSON.stringify({...snapshot,_syncBase:base,_syncWriter:journal.writer,_optionalPending:[...pendingOptional]});storage.setItem(key,next);observedCacheRaw=next;error=null;
      }catch{error='Der Lernstand konnte nicht dauerhaft gespeichert werden. Vorhandene Fassungen bleiben erhalten. Bitte prüfen Sie Speicher und Browsereinstellungen.';return false;}
      for(const listener of listeners)listener(origin);return true;
    },
    subscribe(listener){listeners.add(listener);return ()=>listeners.delete(listener);}
  };
}
