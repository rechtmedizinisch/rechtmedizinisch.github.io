// Auth callbacks stay synchronous. Requests run after Supabase releases its lock.
// A later sign-in/out invalidates every older response, including pending grants.
export function sessionCoordinator({readUser,readGrants,apply,onError=()=>{},schedule=fn=>setTimeout(fn,0)}){
 let revision=0,stopped=false;
 async function load(ticket){
  if(stopped||ticket!==revision)return false;
  try{
   const user=await readUser();if(stopped||ticket!==revision)return false;
   let grants=[],grantsError=null;
   if(user)try{grants=await readGrants(user.id);}catch(error){grantsError=error;}
   if(stopped||ticket!==revision)return false;
   await apply({user,grants,grantsError});return true;
  }catch(error){if(!stopped&&ticket===revision)onError(error);return false;}
 }
 return {
  refresh(){return load(++revision);},
  notify(){const ticket=++revision;schedule(()=>{load(ticket);});},
  stop(){stopped=true;revision++;}
 };
}
export function grantDetails(grants){return JSON.stringify(grants.map(g=>[g.scope,g.starts_at,g.expires_at,g.revoked_at??null]).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b))));}
