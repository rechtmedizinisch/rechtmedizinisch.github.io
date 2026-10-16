import {config} from './config.js?v=20261014-shared1';
import {sandboxContext} from './auth-client.mjs';
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!=null)n.textContent=text;if(cls)n.className=cls;return n;};
const active=g=>!g.revoked_at&&Date.parse(g.starts_at)<=Date.now()&&Date.parse(g.expires_at)>Date.now();
export async function billingRequest(auth,action,extra={}){
 const {data,error}=await auth.client.functions.invoke(sandboxContext?'billing-sandbox':(config.billingFunction??'billing-live'),{body:{action,...extra}});
 if(error){let detail;try{detail=await error.context?.json();}catch{}throw Error(detail?.error??'billing_unavailable');}
 if(data?.error)throw Error(data.error);return data;
}
function destination(value,host){const u=new URL(value);if(u.protocol!=='https:'||u.hostname!==host)throw Error('unexpected_url');return u.href;}
export async function billingPanel(auth,{signedIn=true,grants:knownGrants=[]}={}){
 let state={grants:knownGrants,environment:'live'};
 let unavailable=false;
 if(signedIn&&config.billingLiveEnabled){try{state=await billingRequest(auth,'status');}catch{unavailable=true;}}
 const response=await fetch(new URL('./billing-offers.json?v=20261014-shared1',import.meta.url));if(!response.ok)return null;
 const offers=await response.json();
 const section=el('section',null,'card billing-panel');
 if(sandboxContext)section.append(el('p','Sandbox-Testzugang · keine echten Zahlungen','notice'));
 section.append(el('span','IHR WEB-ZUGANG','badge'),el('h2','✨ So lernen Sie weiter'),el('p','Wählen Sie den Zugang, der zu Ihrem Lernen passt. Kurse 1 und 2 bleiben kostenlos. Ein gültiger Freischaltcode ist weiterhin eine Alternative.'));
 if(!config.billingLiveEnabled)section.append(el('p','Die Online-Zahlung wird gerade eingerichtet. Freischaltcodes können Sie bereits unter „Mein Zugang“ einlösen.','notice'));
 if(unavailable)section.append(el('p','Der Zahlungsdienst ist derzeit nicht erreichbar. Bitte versuchen Sie es später erneut.','notice'));
 const status=el('p','','status');status.role='status';
 const buttons=[];
 const explain={premium_already_active:'Premium ist bereits aktiv. Ein zusätzlicher Kauf ist nicht nötig.',already_owned:'Dieser Inhalt ist bereits freigeschaltet.',confirmation_pending:'Ihre Zahlung wurde geprüft. Die Vertragsbestätigung wird noch zugestellt. Bitte kaufen Sie nicht erneut und aktualisieren Sie den Zugang gleich noch einmal.',verified_email_required:'Bitte bestätigen Sie zuerst die E-Mail-Adresse Ihres Web-Kontos.',billing_unavailable:'Die Kaufprüfung ist derzeit nicht verfügbar. Es wurde hier kein neuer Zugang freigeschaltet.'};
 if(state.confirmation_pending)section.append(el('p',explain.confirmation_pending,'notice'));
 async function navigate(action,extra,host){
  buttons.forEach(b=>b.disabled=true);status.textContent='Zahlungszugang wird sicher vorbereitet …';
  try{const result=await billingRequest(auth,action,extra);location.assign(destination(result.url,host));}
  catch(error){status.textContent=explain[error.message]??'Der Vorgang konnte nicht gestartet werden. Bitte aktualisieren Sie den Zugang und versuchen Sie es erneut.';buttons.forEach(b=>b.disabled=b.dataset.owned==='true'||!config.billingLiveEnabled);}
 }
 const refresh=el('button','↻ Freischaltungen aktualisieren','secondary');refresh.type='button';refresh.onclick=async()=>{refresh.disabled=true;try{await billingRequest(auth,'status');location.reload();}catch{status.textContent='Die Freischaltungen konnten nicht aktualisiert werden.';refresh.disabled=false;}};
 const manage=el('button','Web-Abonnement verwalten ↗','secondary');manage.type='button';manage.onclick=()=>navigate('portal',{},'billing.stripe.com');buttons.push(manage);
 const controls=el('div',null,'row');controls.append(refresh,manage);if(signedIn&&config.billingLiveEnabled&&!unavailable)section.append(controls);
 const grants=state.grants.filter(active),premium=grants.some(g=>g.scope==='all');
 const grid=el('div',null,'billing-grid'),graphicBox=el('details'),graphicTitle=el('summary','🖼 Einzelne Schaubilder · je 0,99 €');graphicBox.append(graphicTitle);
 for(const offer of offers){
  const card=el('article',null,'billing-offer');card.append(el('h3',offer.title));
  const price=(offer.cents/100).toLocaleString('de-DE',{style:'currency',currency:'EUR'});
  card.append(el('p',price+(offer.interval==='month'?' / Monat':offer.interval==='year'?' / Jahr':' einmalig'),'billing-price'));
  card.append(el('p',offer.interval?'Alle Premium-Inhalte während der Laufzeit. Automatische Verlängerung; im Kundenportal kündbar.':offer.key==='course-edition'?'Dauerhafter Zugriff auf die 15 Kurse. Premium-Werkzeuge und Schaubilder sind nicht enthalten.':'Dauerhafter Zugriff und Download ausschließlich für dieses Schaubild.','subtle'));
  const owned=premium||(!offer.interval&&offer.scopes.every(s=>grants.some(g=>g.scope===s)));
  const buy=el('button',owned?'✓ Bereits freigeschaltet':state.confirmation_pending?'Bestätigung wird zugestellt':!signedIn?'Anmelden und auswählen →':!config.billingLiveEnabled?'Zahlung in Vorbereitung':offer.interval?'Abo auswählen →':'Einmalig kaufen →');buy.type='button';buy.disabled=owned||state.confirmation_pending||(!config.billingLiveEnabled&&signedIn)||unavailable;buy.dataset.owned=String(owned||state.confirmation_pending);buy.onclick=()=>{if(!signedIn){location.hash='#account';return;}navigate('checkout',{offer:offer.key},'checkout.stripe.com');};buttons.push(buy);card.append(buy);
  if(offer.scopes[0].startsWith('diagram:'))graphicBox.append(card);else grid.append(card);
 }
 section.append(grid,graphicBox);const legal=el('p',null,'billing-legal');for(const [text,href] of [['Nutzungsbedingungen & Widerruf','#terms'],['Datenschutz','#privacy']]){const a=el('a',text+' ↗');a.href=href;legal.append(a,document.createTextNode(' · '));}section.append(legal,el('p','Endpreise in Euro. Keine gesonderte Umsatzsteuer nach § 19 UStG. Abos verlängern sich automatisch; das Jahresabo wird jährlich im Voraus bezahlt. Nach der ersten vereinbarten Laufzeit können Verbraucher mit höchstens einem Monat Frist kündigen. Ein nicht verbrauchter vorausbezahlter Zeitraum wird bei vorzeitiger Beendigung anteilig erstattet.','subtle'),el('p','Ein Konto für App und Website: Gemeinsamer Zugriff ab App-Version 1.1. Bis das Update im App Store verfügbar ist, nutzen Sie Ihren Kauf bereits hier.','notice'),el('p','Einmalige Downloads dürfen Sie für sich behalten; ein Premium-Abo eröffnet den Online-Zugriff nur während der Laufzeit. Kaufstatus wird serverseitig beim Zahlungsanbieter geprüft.','subtle'),status);
 return section;
}
