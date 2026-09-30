import {createClient} from './assets/supabase.bundle.mjs';
import {config} from './config.js?v=20260930k';
export const client=createClient(config.url,config.key,{auth:{flowType:'pkce',persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:'rm-web-auth-v2'}});
export async function currentUser(){const {data,error}=await client.auth.getUser();if(error)return null;return data.user;}
export async function getGrants(){if(!config.backendReady)return [];const {data,error}=await client.from('web_entitlements').select('scope,starts_at,expires_at,revoked_at');if(error)throw error;return data;}
export async function getCourse(id){const {data,error}=await client.from('web_content').select('payload').eq('id',id).maybeSingle();if(error)throw error;return data?.payload??null;}
export async function getGraphic(path){const {data,error}=await client.storage.from('web-learning-assets').createSignedUrl(path,120);if(error)throw error;return data.signedUrl;}
export async function redeem(code){const {data,error}=await client.rpc('redeem_web_code',{code});if(error)throw error;return data;}
export async function deleteAccount(confirmation){const owner=await currentUser();const {data,error}=await client.rpc('delete_own_web_account',{confirmation});if(error)throw error;if(!data)throw Error('Konto konnte nicht gelöscht werden.');try{if(owner)localStorage.removeItem('rm-web-practice-v1:'+owner.id);}catch{}await client.auth.signOut({scope:'local'});}
export async function emailLogin(email){if(!config.emailEnabled)throw Error('Der E-Mail-Versand wird noch eingerichtet.');const {error}=await client.auth.signInWithOtp({email,options:{emailRedirectTo:new URL('./index.html',location.href).href}});if(error)throw error;}
export async function verifyEmailCode(email,token){const {error}=await client.auth.verifyOtp({email,token,type:'email'});if(error)throw error;}
export async function googleLogin(){if(!config.googleEnabled)throw Error('Google-Anmeldung wird noch eingerichtet.');const {error}=await client.auth.signInWithOAuth({provider:'google',options:{redirectTo:new URL('./index.html',location.href).href}});if(error)throw error;}

export async function getSlides(){const {data,error}=await client.from("web_content").select("payload").eq("scope","slides").order("id");if(error)throw error;return (data??[]).map(r=>r.payload).sort((a,b)=>Number(a.id)-Number(b.id));}
