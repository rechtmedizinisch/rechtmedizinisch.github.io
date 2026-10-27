import {createClient} from './assets/supabase.bundle.mjs?v=20261027-update51b';
import {config} from './config.js?v=20261027-update51b';
// All page modules, including differently cached auth wrappers, share this one client.
export const sandboxContext=(config.billingSandboxEnabled&&!config.billingLiveEnabled)||(typeof location!=='undefined'&&new URLSearchParams(location.search).get('reviewSandbox')==='1');
export const client=createClient(config.url,config.key,{global:{headers:sandboxContext?{'x-rm-billing-mode':'sandbox'}:{}},auth:{flowType:'pkce',persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:'rm-web-auth-v2'}});
