// Session-only UI state: no lesson text, answers, credentials or purchase data.
// Access is always rechecked before a rebuilt view is attached.
export function readingViewState(limit=24){
 let context=null,current=null;
 const saved=new Map();
 return {
  setContext(value){if(value!==context){saved.clear();current=null;context=value;}},
  capture(root,y){
   if(!current||current.root!==root||current.context!==context)return;
   const details=[...root.querySelectorAll('details[data-reading-key]')];
   saved.delete(current.key);
   const controls=[...root.querySelectorAll('[data-reading-control]')].map(row=>[row.dataset.readingControl,row.value]);
   saved.set(current.key,{open:details.filter(row=>row.open).map(row=>row.dataset.readingKey),controls,y:Number.isFinite(y)?Math.max(0,y):0});
   while(saved.size>limit)saved.delete(saved.keys().next().value);
  },
  detach(){current=null;},
  restore(root,key,scroll){
   current={root,key,context};const state=saved.get(key);
   if(!state)return false;
   const open=new Set(state.open);
   for(const detail of root.querySelectorAll('details[data-reading-key]'))detail.open=open.has(detail.dataset.readingKey);
   const values=new Map(state.controls);
   for(const field of root.querySelectorAll('[data-reading-control]'))if(values.has(field.dataset.readingControl))field.value=values.get(field.dataset.readingControl);
   for(const group of root.querySelectorAll('[data-reading-restorable]'))group.dispatchEvent(new Event('reading-state-restored'));
   scroll(state.y);return true;
  }
 };
}
