import {emptyCourseProgress} from './progress-engine.mjs?v=20260930ag';
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
  const courses=Object.fromEntries(Object.entries(object(value?.courses)?value.courses:{}).map(([id,course])=>[id,normalizeCourse(course)]));
  const certificateName=typeof value?.certificateName==='string'?value.certificateName:'';
  const validSync=object(value?._sync)&&Number.isSafeInteger(value._sync.revision)&&value._sync.revision>=0&&typeof value._sync.dirty==='boolean';
  const completedCareerTopics=Array.isArray(value?.completedCareerTopics)?[...new Set(value.completedCareerTopics.filter(id=>typeof id==='string'&&id.length<=120))]:[];
  const practiceMistakes=Array.isArray(value?.practiceMistakes)?[...new Set(value.practiceMistakes.filter(id=>typeof id==='string'&&id.length<=120))]:[];
  return {courses,certificateName,completedCareerTopics,practiceMistakes,_sync:validSync?{revision:value._sync.revision,dirty:value._sync.dirty}:{revision:0,dirty:Object.keys(courses).length>0||certificateName.length>0||completedCareerTopics.length>0||practiceMistakes.length>0}};
}
export function progressStore(owner,storage=localStorage){
  const key=progressKey(owner);
  let snapshot={courses:{},certificateName:'',completedCareerTopics:[],practiceMistakes:[],_sync:{revision:0,dirty:false}},error=null,generation=0;
  try{const saved=JSON.parse(storage.getItem(key)||'null');if(saved)snapshot=normalizeSnapshot(saved);
    if(owner&&!Object.hasOwn(saved??{},'practiceMistakes')){const legacy=JSON.parse(storage.getItem('rm-web-practice-v1:'+owner)||'[]');const migrated=normalizeSnapshot({practiceMistakes:legacy}).practiceMistakes;if(migrated.length){snapshot.practiceMistakes=migrated;snapshot._sync.dirty=true;}}
  }catch{error='Der gespeicherte Lernstand konnte nicht gelesen werden.';}
  const listeners=new Set();
  return {
    get error(){return error;},get snapshot(){return structuredClone(snapshot);},get generation(){return generation;},
    get syncState(){return {...(snapshot._sync??{revision:0,dirty:Object.keys(snapshot.courses).length>0})};},
    course(id){return normalizeCourse(snapshot.courses[id]);},
    update(id,patch){snapshot.courses[id]={...this.course(id),...structuredClone(patch)};this.save();},
    recordStatus(id,status){if(!snapshot.courses[id]&&status.completedUnits===0)return;const before=this.course(id);if(before.completedUnits===status.completedUnits&&before.totalUnits===status.totalUnits)return;snapshot.courses[id]={...before,completedUnits:status.completedUnits,totalUnits:status.totalUnits};this.save();},
    recordPracticeAnswer(id,right){snapshot.practiceMistakes=snapshot.practiceMistakes.filter(x=>x!==id);if(!right)snapshot.practiceMistakes.push(id);this.save();},
    markCareerRead(id){if(snapshot.completedCareerTopics.includes(id))return;snapshot.completedCareerTopics.push(id);this.save();},
    setCertificateName(name){snapshot.certificateName=name;this.save();},
    replaceLearning(payload){const sync=this.syncState;snapshot=normalizeSnapshot(payload);snapshot._sync=sync;this.save();},
    resetLearning(){this.replaceLearning({courses:{},certificateName:''});},
    acceptRemote(payload,revision){snapshot=normalizeSnapshot({...payload,_sync:{revision,dirty:false}});this.save('remote');},
    acknowledge(revision,sentGeneration){snapshot._sync={revision,dirty:generation!==sentGeneration};this.save('remote');},
    rebase(revision){snapshot._sync={revision,dirty:true};this.save('remote');},
    save(origin='local'){if(origin==='local'){generation++;snapshot._sync={revision:this.syncState.revision,dirty:true};}try{storage.setItem(key,JSON.stringify(snapshot));error=null;}catch{error='Der Lernstand konnte nicht dauerhaft gespeichert werden. Bitte prüfen Sie den freien Speicher und Ihre Browsereinstellungen.';}for(const listener of listeners)listener(origin);},
    subscribe(listener){listeners.add(listener);return ()=>listeners.delete(listener);}
  };
}
