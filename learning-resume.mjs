// Local reading position, kept separate for the guest and each signed-in user.
// Opening it always goes through the usual content/access checks.
export const resumeKey=owner=>'rm-web-resume-v1:'+(owner||'guest');
export function normalizeResumeLocation(value){
 if(!value||typeof value.title!=='string'||!value.title.trim()||value.title.length>300)return null;
 const valid=value.kind==='course'?/^tag-(0[1-9]|1[0-5])$/.test(value.id):value.kind==='slide'&&/^slides:[1-9]\d{0,3}$/.test(value.id);
 if(!valid)return null;
 return {kind:value.kind,id:value.id,title:value.title.trim()};
}
export function resumeStore(owner,storage=localStorage){
 let location=null;
 try{location=normalizeResumeLocation(JSON.parse(storage.getItem(resumeKey(owner))||'null'));}catch{}
 return {
  get location(){return location?{...location}:null;},
  remember(value){const next=normalizeResumeLocation(value);if(!next)return false;try{storage.setItem(resumeKey(owner),JSON.stringify(next));location=next;return true;}catch{return false;}},
  clear(){location=null;try{storage.setItem(resumeKey(owner),'null');}catch{}}
 };
}
export function resumeHref(location){
 const value=normalizeResumeLocation(location);if(!value)return null;
 return value.kind==='course'?'#course/'+value.id:'#material/'+encodeURIComponent(value.id);
}
