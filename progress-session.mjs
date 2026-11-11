// A lease ends on explicit reauthentication, including A → B → A.
// Token renewal within the same server session keeps that lease.
export function progressSession(){
 let initialized=false,epoch=0,identity='',controller=new AbortController();
 function fingerprint(session){
  if(!session)return '';
  let sessionID='';try{const encoded=session.access_token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');sessionID=JSON.parse(atob(encoded)).session_id??'';}catch{}
  return session.user.id+':'+(sessionID||session.access_token);
 }
 function change(session){controller.abort();controller=new AbortController();identity=fingerprint(session);initialized=true;epoch++;}
 return {
  observe(event,session){const next=fingerprint(session);if(!initialized||next!==identity||event==='SIGNED_OUT'){change(session);return true;}return false;},
  capture(){return {epoch,identity,signal:controller.signal};},
  isCurrent(lease){return lease.epoch===epoch&&lease.identity===identity&&!lease.signal.aborted;},
  assert(lease,session,owner){if(!this.isCurrent(lease)||session?.user?.id!==owner||fingerprint(session)!==identity)throw Error('Das Konto wurde geändert.');},
  get initialized(){return initialized;}
 };
}
