import {client,sandboxContext} from './auth-client.mjs';
import {requestDeadline} from './request-deadline.mjs';
export {client,sandboxContext};
import {config} from './config.js?v=20261027-update51b';
import {prepareAppleRequest,completeAppleLogin,isAppleCancellation} from './apple-login.mjs?v=20261027-update51b';
export {isAppleCancellation};
export function prepareAppleLogin(){return prepareAppleRequest({clientID:config.appleClientID,redirectURI:config.appleRedirectURI});}
export function appleLogin(request){return completeAppleLogin(client,request);}
export function currentUser(){return requestDeadline(async()=>{
 const {data:stored,error:storedError}=await client.auth.getSession();if(storedError)throw storedError;if(!stored?.session)return null;
 const {data,error}=await client.auth.getUser();if(error)throw error;return data.user;
});}
export async function getGrants(owner){if(!config.backendReady)return [];const {data,error}=await requestDeadline(signal=>{let query=client.from('web_entitlements').select('scope,starts_at,expires_at,revoked_at');if(owner)query=query.eq('user_id',owner);return query.abortSignal(signal);});if(error)throw error;return data;}
export async function getCourse(id){const {data,error}=await client.from('web_content').select('payload').eq('id',id).maybeSingle();if(error)throw error;return data?.payload??null;}
export async function getSearchContent(){const rows=[];for(let start=0;;start+=200){const {data,error}=await client.from('web_content').select('id,payload').order('id').range(start,start+199);if(error)throw error;rows.push(...(data??[]));if((data??[]).length<200)return rows;}}
export async function readProgress(owner){const current=await currentUser();if(current?.id!==owner)throw Error('Account changed');const {data,error}=await client.from('web_learning_progress').select('revision,payload').eq('user_id',owner).maybeSingle();if(error)throw error;return data??{revision:0,payload:{courses:{},certificateName:''}};}
export async function writeProgress(owner,revision,payload){const {data,error}=await client.rpc('save_web_learning_progress',{owner_id:owner,expected_revision:revision,next_payload:payload});if(error)throw error;return data;}
export async function getGraphic(path,download=null){const {data,error}=await client.storage.from('web-learning-assets').createSignedUrl(path,120,download?{download}:undefined);if(error)throw error;return data.signedUrl;}
export async function redeem(code){const {data,error}=await requestDeadline(signal=>client.rpc('redeem_web_code',{code}).abortSignal(signal));if(error)throw error;return data;}
export function deleteAccount(confirmation,appleRequest){
 if(confirmation!=='KONTO LÖSCHEN')return Promise.reject(Error('confirmation_required'));
 // Start Apple's popup in the original click event, before any asynchronous work.
 const proof=appleRequest?appleRequest.start().then(value=>({value}),error=>({error})):null;
 return (async()=>{
  const owner=await currentUser();if(!owner)throw Error('authentication_required');
  const usesApple=owner.identities?.some(identity=>identity.provider==='apple');
  if(usesApple){
   if(!proof)throw Error('apple_reauthentication_required');
   const result=await proof;if(result.error)throw result.error;const identity=result.value;
   const {data,error}=await client.functions.invoke('delete-account',{body:{identity_token:identity.identityToken,nonce:identity.nonce,authorization_code:identity.authorizationCode}});
   if(error)throw error;if(data?.deleted!==true)throw Error('account_deletion_failed');
  }else{
   if(proof)throw Error('account_changed');
   const {data,error}=await client.rpc('delete_own_web_account',{confirmation});
   if(error)throw error;if(!data)throw Error('account_deletion_failed');
  }
  try{localStorage.removeItem('rm-web-practice-v1:'+owner.id);localStorage.removeItem('rm-web-learning-v1:'+owner.id);}catch{}
  await client.auth.signOut({scope:'local'});
 })();
}
export async function emailLogin(email){if(!config.emailEnabled)throw Error('Der E-Mail-Versand wird noch eingerichtet.');const {error}=await client.auth.signInWithOtp({email,options:{emailRedirectTo:new URL('./index.html',location.href).href}});if(error)throw error;}
export async function verifyEmailCode(email,token){const {error}=await client.auth.verifyOtp({email,token,type:'email'});if(error)throw error;}
export async function googleLogin(){if(!config.googleEnabled)throw Error('Google-Anmeldung wird noch eingerichtet.');const {error}=await client.auth.signInWithOAuth({provider:'google',options:{redirectTo:new URL('./index.html',location.href).href}});if(error)throw error;}

export async function getSlides(){const {data,error}=await client.from("web_content").select("payload").eq("scope","slides").order("id");if(error)throw error;return (data??[]).map(r=>r.payload).sort((a,b)=>Number(a.id)-Number(b.id));}

export async function passwordLogin(email,password){const {error}=await client.auth.signInWithPassword({email,password});if(error)throw error;}
