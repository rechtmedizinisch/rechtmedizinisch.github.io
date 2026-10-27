import {sessionCoordinator,grantDetails} from './session-coordinator.mjs';
import {notify,sessionFeedback} from './feedback.mjs';
import {createLearningUpdateNotice} from './learning-update.mjs?v=20261027-lecture52';
import {codePanel} from './code-panel.mjs?v=20261027-lecture52';
import {renderCancellation} from './cancellation.js?v=20261027-lecture52';
import {billingPanel} from './billing.js?v=20261027-lecture52';
import {replacePresentation} from './presentation-transition.mjs?v=20261027-lecture52';
import {renderLearningOffer} from './learning-offer.mjs?v=20261027-lecture52';
import {renderFreeContent} from './free-content.mjs?v=20261027-lecture52';
import {homeLearning} from './home-learning.mjs?v=20261027-lecture52';
import {progressActions} from './progress-actions.mjs?v=20261027-lecture52';
import {progressSync} from './progress-sync.mjs?v=20261027-lecture52';
import {syncPanel} from './progress-sync-ui.mjs?v=20261027-lecture52';
import {renderSearch} from './search.js?v=20261027-lecture52';
import {renderPodcast} from './podcast.js?v=20261027-lecture52';
import {renderProgress,progressBadge,catalogOverall} from './progress-overview.mjs?v=20261027-lecture52';
import {renderCourseLearning} from './course-learning.js?v=20261027-lecture52';
import {progressStore} from './progress-store.mjs?v=20261027-lecture52';
import {renderReferences} from './references.js?v=20261027-lecture52';
import {formatSlideText} from './slide-tools.js?v=20261027-lecture52';
import {loginPanel} from './email-login.js?v=20261027-lecture52';
import {renderLegal} from './legal.js?v=20261027-lecture52';
import {renderPractice} from './practice.js?v=20261027-lecture52';
import {accountTools} from './account-tools.js?v=20261027-lecture52';
import {renderLibrary,courseMaterials} from './library.js?v=20261027-lecture52';
import {readingViewState} from './reading-view-state.mjs?v=20261027-lecture52';
import {config} from './config.js?v=20261027-lecture52';
import {installContextHelp} from './context-help.mjs?v=20261027-lecture52';
import {hasAccess,shuffle,safeURL,scopeLabel,accessDuration,accessFingerprint,nextAccessChange} from './policy.mjs?v=20261027-lecture52';
const main=document.querySelector('main');
const learningUpdateNotice=createLearningUpdateNotice();
installContextHelp(main);
const returningFromLogin=new URLSearchParams(location.search).has('code')||new URLSearchParams(location.search).has('error')||new URLSearchParams(location.hash.slice(1)).has('error');
let loginReturnFailed=new URLSearchParams(location.search).has('error')||new URLSearchParams(location.hash.slice(1)).has('error'),authSettled=false;
let sessionMessage=null;
let catalog,user=null,grants=[],auth=null,routeVersion=0,expiryTimer;
let renderedAccess;
let sessionManager,sessionProblem=null,accountNotice=null;
const readingViews=readingViewState();let resetScrollOnRoute=false;
let learningOwner,learningStoreInstance,syncService,syncInfo={kind:'local'};
function learningStore(){
 const owner=user?.id??null;if(learningStoreInstance&&learningOwner===owner)return learningStoreInstance;
 syncService?.stop();learningOwner=owner;learningStoreInstance=progressStore(owner);learningStoreInstance.subscribe(refreshHeader);syncService=null;syncInfo={kind:'local'};
 if(owner&&auth?.readProgress){const active=learningStoreInstance;syncService=progressSync(active,{read:auth.readProgress,write:auth.writeProgress},owner,state=>{if(learningOwner===owner){syncInfo=state;const panel=document.querySelector('.sync-panel');if(panel&&syncService)panel.replaceWith(syncPanel(state,syncService,route));}});
 const service=syncService;service.sync().then(()=>{if(learningOwner===owner&&syncService===service){const page=location.hash.slice(1).split('/')[0];if(!['account','shop'].includes(page))route();else refreshHeader();}});}
 return learningStoreInstance;
}
function watchExpiry(){clearTimeout(expiryTimer);const next=nextAccessChange(grants);if(Number.isFinite(next))expiryTimer=setTimeout(()=>{if(accessFingerprint(grants)!==renderedAccess)route();else watchExpiry();},Math.min(next-Date.now()+50,2147483647));}
function refreshHeader(){
 const page=location.hash.slice(1).split('/')[0]||'home';
 const active=page==='course'||page==='free'?'courses':page==='material'?(location.hash.startsWith('#material/slides%3A')?'slides':'library'):page;
 let selectedNav=null;
 for(const a of document.querySelectorAll('body > header a[href^="#"]')){
  const section=a.getAttribute('href').slice(1),selected=section===active;
  a.classList.toggle('is-active',selected);
  if(selected)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
  if(selected&&a.closest('nav'))selectedNav=a;
 }
 const nav=document.querySelector('body > header nav');if(nav){if(selectedNav&&nav.scrollWidth>nav.clientWidth)nav.scrollLeft=selectedNav.offsetLeft-nav.offsetLeft-(nav.clientWidth-selectedNav.clientWidth)/2;else if(!selectedNav)nav.scrollLeft=0;}
 const value=document.getElementById('header-progress-value');
 if(value&&catalog&&learningStoreInstance)value.textContent=`${catalogOverall(catalog,learningStoreInstance.snapshot).percent} %`;
}
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&catalog){if(sessionManager)sessionManager.notify();else if(accessFingerprint(grants)!==renderedAccess)route();else watchExpiry();}});
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
const link=(text,href,cls)=>{const a=el('a',text,cls);a.href=href;return a;};
function external(text,url){const href=safeURL(url);if(!href)return el('span',text);const a=link(text,href);a.target='_blank';a.rel='noopener noreferrer';return a;}
function button(text,action,cls=''){const b=el('button',text,cls);b.type='button';b.addEventListener('click',action);return b;}
function card(title){const n=el('section',undefined,'card');if(title)n.append(el('h2',title));return n;}
function list(items){const ul=el('ul');for(const x of items??[])ul.append(el('li',x));return ul;}
function status(text){const n=el('p',text,'status');n.role='status';return n;}
function allowed(c){return c.free||hasAccess(`course:${String(c.no).padStart(2,'0')}`,grants);}
function badge(c){return el('span',c.free?'Kostenlos':allowed(c)?'✓ Freigeschaltet':'🔒 Premium',`badge ${allowed(c)?'':'lock'}`);}
const courseSymbols=['🧭','⏱','⚖','📋','🔎','🤝','🏛','⚖','🩺','🛡','💊','🔗','⚖','🗂','🏛'];
function courseCard(c){const n=card();n.classList.add('course-preview');if(c.free)n.classList.add('course-free');const top=el('div',undefined,'course-card-top'),symbol=el('span',courseSymbols[c.no-1]??'📚','course-symbol');symbol.setAttribute('aria-hidden','true');top.append(symbol,badge(c));n.append(top,el('p',`KURS ${String(c.no).padStart(2,'0')}`,'section-number'),el('h3',c.title),el('p',c.subtitle),progressBadge(c,learningStore(),catalog.courses.find(x=>x.id===c.id)),link('Kurs ansehen →',`#course/${c.id}`,'button secondary'));return n;}
function home(){const hero=el('section',undefined,'hero'),copy=el('div',undefined,'hero-copy');copy.append(el('p','Medizinrecht verstehen. Sicherer handeln.','eyebrow'));const h=el('h1','Recht haben.');h.append(el('br'),el('span','Recht bekommen.'));copy.append(h,el('p','15 fallbasierte Kurse, Urteile und Normen. Für Medizin, Recht und alle Gesundheitsberufe.'),link('Kostenlos mit Kurs 1 starten →','#course/tag-01','button'));const image=el('img');image.src='assets/login-klinik-gericht-v1.webp';image.alt='Ärztin zwischen Behandlungszimmer und Gerichtssaal';hero.append(copy,image);main.append(hero,el('p','⚠ Lehr- und Lernangebot. Keine individuelle Rechts- oder medizinische Beratung.','notice disclaimer'));const intro=card('Ihr Einstieg ist kostenlos');intro.append(el('p','Kurse 1 und 2, Urteile und Normen sind ohne Anmeldung zugänglich. Weitere Inhalte öffnen Sie mit Premium, einem passenden Einzelkauf oder einem gültigen Freischaltcode.'),link('🎁 Kostenlos entdecken →','#free','button secondary'));main.append(intro);homeLearning(main,catalog,learningStore());}
function courses(){const banner=el('section',undefined,'knowledge-banner');banner.append(el('p','VERSTEHEN · ANWENDEN · VERTIEFEN','section-number'),el('h1','Ihr Weg durch das Medizinrecht'),el('p','15 fallbasierte Kurse – von den ersten Schritten nach einem Konflikt bis zum Gerichtsbesuch.'),el('span','Kurse 1 & 2 kostenlos · ohne Anmeldung','badge'));main.append(banner);const search=el('input');search.type='search';search.placeholder='Kursnummer, Thema oder Lernziel suchen';search.setAttribute('aria-label','Kurse durchsuchen');const results=el('div'),count=el('p','','subtle');count.setAttribute('role','status');const groups=[['🧭','Kostenlos beginnen','Orientierung gewinnen und im Ernstfall die ersten Schritte kennen.',1,2],['⚖','Haftung & Verfahren','Ansprüche, Beweise und gerichtliche sowie außergerichtliche Wege verstehen.',3,8],['🩺','Verantwortung im Berufsalltag','Berufsrecht, Patientenautonomie und sichere Entscheidungen in der Versorgung.',9,13],['🏛','Wissen in die Praxis übertragen','Das Gelernte am Gesamtfall und beim Gerichtsbesuch zusammenführen.',14,15]];const render=()=>{const q=search.value.trim().toLocaleLowerCase('de'),matches=catalog.catalog.filter(c=>`${String(c.no).padStart(2,'0')} ${c.title} ${c.subtitle} ${c.goals.join(' ')}`.toLocaleLowerCase('de').includes(q));results.replaceChildren();count.textContent=q?`${matches.length} ${matches.length===1?"passender Kurs":"passende Kurse"}`:'Alle 15 Kurse · Kurse 1 & 2 kostenlos · weitere Kurse mit Premium oder Kursedition';for(const [icon,title,description,first,last] of groups){const items=matches.filter(c=>c.no>=first&&c.no<=last);if(!items.length)continue;const group=el('section',undefined,'course-group'),heading=el('h2',`${icon} ${title}`),grid=el('div',undefined,'grid');group.append(heading,el('p',description,'subtle'));grid.append(...items.map(courseCard));group.append(grid);results.append(group);}if(!matches.length)results.append(el('p','Kein passender Kurs. Versuchen Sie einen anderen Begriff.','notice'));};search.addEventListener('input',render);main.append(search,count,results);render();}
async function course(id,version){const preview=catalog.catalog.find(c=>c.id===id);main.append(link('← Kursübersicht','#courses','back'));if(!preview){main.append(el('h1','Kurs nicht gefunden'));return;}const head=card();head.classList.add('course-hero');head.append(badge(preview),el('p',`KURS ${String(preview.no).padStart(2,'0')}`,'section-number'),el('h1',preview.title),el('p',preview.subtitle));main.append(head);const goals=card();goals.classList.add('course-goals');goals.append(el('p','IHR LERNZIEL','section-number'),el('h2','🎯 Nach diesem Kurs können Sie …'),list(preview.goals));main.append(goals);let content=catalog.courses.find(c=>c.id===id);if(!content&&allowed(preview)&&auth&&config.backendReady){const loading=status('Kurszugang wird geprüft …');main.append(loading);try{content=await auth.getCourse(id);}catch{loading.textContent='Der Kurs konnte nicht geladen werden. Bitte versuchen Sie es erneut.';return;}if(version!==routeVersion)return;loading.remove();}if(!content){const gate=card('Diesen Kurs freischalten');gate.append(el('p','🔒 Die Vorschau ist frei zugänglich. Für die Kursinhalte wählen Sie Premium, die Kursedition oder lösen einen gültigen Freischaltcode ein.','notice'),link('Zugang wählen →','#shop','button'),link('Freischaltcode einlösen →','#account','button secondary'));main.append(gate);return;}learningStore().rememberLocation({kind:'course',id:preview.id,title:preview.title});renderCourseLearning(main,head,content,learningStore(),!!user);await courseMaterials(main,preview.no,()=>version===routeVersion);}
function references(type,id){renderReferences(main,type,catalog,id?decodeURIComponent(id):null);}
function sessionNotice(){
 main.querySelector('#session-problem')?.remove();if(!sessionProblem)return;
 const box=card();box.id='session-problem';box.append(status(sessionProblem),button('Erneut prüfen',()=>sessionManager?sessionManager.refresh():location.reload(),'secondary'));main.prepend(box);
}
function accessCodeEntry(){
 if(!user){
  const entry=card('🎟 Freischaltcode einlösen');entry.classList.add('shop-code-entry');
  entry.append(el('p','Sie haben einen Kurs- oder Premium-Code? Melden Sie sich an, um Ihren Zugang freizuschalten.'),link('Anmelden und Code einlösen →','#account','button'));return entry;
 }
 const owner=user.id;
 return codePanel(auth,{notice:accountNotice?.owner===owner?accountNotice:null,onRedeemed:async message=>{
  if(user?.id!==owner)return;accountNotice={owner,...message};await sessionManager.refresh();
 }});
}
async function shop(){
 const version=routeVersion,owner=user?.id??null;
 main.append(el('h1','Zugang wählen'),el('p','Einfach starten, flexibel vertiefen.'));
 const offers=el('div'),loading=status('Kaufangebote werden geladen …');offers.append(loading);
 const codes=accessCodeEntry();codes.classList.add('shop-code-entry');main.append(offers);
 try{const purchases=await billingPanel(auth,{signedIn:!!user,grants});if(version===routeVersion&&owner===(user?.id??null)){offers.replaceChildren();if(purchases)offers.append(purchases);else offers.append(status('Die Kaufangebote konnten gerade nicht geladen werden. Freischaltcodes können Sie hier weiterhin einlösen.'));}}
 catch{if(version===routeVersion&&owner===(user?.id??null))offers.replaceChildren(status('Die Kaufangebote konnten gerade nicht geladen werden. Freischaltcodes können Sie hier weiterhin einlösen.'));}
 if(version===routeVersion&&owner===(user?.id??null))main.append(codes);
}
async function account(){
 const version=routeVersion,owner=user?.id??null;main.classList.add('narrow');
 const welcome=el('section',undefined,'account-welcome'),welcomeCopy=el('div',undefined,'account-welcome-copy');
 welcomeCopy.append(el('p','RECHT MEDIZINISCH','eyebrow'),el('h1','Mein Zugang'));
 const slogan=el('p','Recht haben. ','account-slogan');slogan.append(el('span','Recht bekommen.'));
 welcomeCopy.append(slogan,el('p','Ihr persönlicher Einstieg in die Lernplattform zum Podcast.'));
 const welcomeImage=el('img');welcomeImage.src='assets/login-klinik-gericht-v1.webp';welcomeImage.alt='Ärztin zwischen Behandlungszimmer und Gerichtssaal';welcome.append(welcomeCopy,welcomeImage);
 main.append(welcome,el('p','Anmelden, Freischaltcode einlösen oder Ihren Web-Zugang kaufen und verwalten.'));sessionNotice();
 if(!authSettled){main.append(status('Anmeldung wird geladen …'));return;}
 if(!user){
  if(sessionProblem)return;
  if(sessionMessage)main.append(status(sessionMessage));
  if(loginReturnFailed)main.append(status('Die Anmeldung wurde in diesem Browser nicht abgeschlossen. Bitte versuchen Sie es erneut. Ihr bestehendes Konto bleibt erhalten.'));
  main.append(loginPanel(auth,config,()=>sessionManager.refresh()));
 }else{
  const box=card('✓ Angemeldet');box.append(el('p',user.email??'Ihr Konto'),button('Abmelden',async event=>{
   const target=event.currentTarget;target.disabled=true;
   try{const {error}=await auth.client.auth.signOut({scope:'local'});if(error)throw error;await sessionManager.refresh();}
   catch{target.disabled=false;const text='Abmelden derzeit nicht möglich. Bitte versuchen Sie es erneut.';box.append(status(text));notify({kind:'error',title:'Abmeldung nicht abgeschlossen',text});}
  },'secondary'));main.append(box);
  const grantBox=card('🔓 Ihre Freischaltungen');grantBox.classList.add('account-grants');
  for(const grant of grants.filter(g=>hasAccess(g.scope,[g])))grantBox.append(el('p',`${scopeLabel(grant.scope)} · ${accessDuration(grant.expires_at)}`));
  if(!grantBox.querySelector('p'))grantBox.append(el('p',sessionProblem?'Ihre Freischaltungen konnten gerade nicht geprüft werden.':'Noch kein zusätzlicher Web-Zugang aktiv. Kurse 1 und 2 bleiben kostenlos.'));
  main.append(grantBox,accessCodeEntry(),accountTools(auth,()=>sessionManager.refresh(),user));
 }
 let purchases;
 try{purchases=await billingPanel(auth,{signedIn:!!user,grants});}
 catch{if(version===routeVersion&&owner===(user?.id??null))main.append(status('Die Kaufangebote konnten gerade nicht geladen werden. Anmeldung und Freischaltcodes können Sie weiterhin nutzen.'));}
 if(version!==routeVersion||owner!==(user?.id??null))return;
 if(purchases)main.append(purchases);
 main.append(el('p','Ab App-Version 1.1 verwenden Sie denselben Kontozugang in App und Website. Bereits bestehende Apple-Käufe können Sie einmalig im App-Konto übernehmen.','notice'));
}
async function route(){
 renderedAccess=accessFingerprint(grants);
 readingViews.setContext(JSON.stringify([user?.id??null,renderedAccess]));
 readingViews.capture(main,window.scrollY);readingViews.detach();
 delete main.dataset.readingId;delete main.dataset.readingVersion;
 if(resetScrollOnRoute){window.scrollTo(0,0);resetScrollOnRoute=false;}
 learningStore();refreshHeader();document.querySelectorAll('.image-dialog,.slide-search-dialog').forEach(d=>d.remove());watchExpiry();const version=++routeVersion;const [page,id]=location.hash.slice(1).split('/');
 const materialId=page==='material'&&id?decodeURIComponent(id):null;
 if(authSettled&&materialId?.startsWith('slides:')){
  const accessKey=JSON.stringify([user?.id??null,renderedAccess]);
  await replacePresentation(main,{accessKey,isCurrent:()=>version===routeVersion&&accessKey===JSON.stringify([user?.id??null,accessFingerprint(grants)]),render:prepared=>renderLibrary(prepared,materialId,auth,grants,()=>version===routeVersion,null,learningStore()),retry:route});
  return;
 }
 document.querySelectorAll('body > header, body > footer').forEach(el=>{el.inert=false;});main.querySelectorAll('[data-blob-url]').forEach(n=>URL.revokeObjectURL(n.dataset.blobUrl));main.removeAttribute('aria-busy');main.classList.remove('narrow','presentation-player');main.replaceChildren();if(!authSettled&&['library','material','slides','practice','progress','courses','course','search','shop'].includes(page)){main.append(status('Ihr Zugang und Lernstand werden geladen …'));return;}if(page==='library'||page==='material'||page==='slides')await renderLibrary(main,page==='material'&&id?decodeURIComponent(id):null,auth,grants,()=>version===routeVersion,page==='slides'?'slides':page==='library'?id:null,learningStore());else if(page==='practice')await renderPractice(main,auth,grants,user,()=>version===routeVersion,learningStore(),id?decodeURIComponent(id):'');else if(page==='search')await renderSearch(main,catalog,auth,()=>version===routeVersion);else if(page==='podcast')await renderPodcast(main,()=>version===routeVersion,id?decodeURIComponent(id):null);else if(page==='progress'){renderProgress(main,catalog,learningStore(),!!user);main.append(progressActions(learningStore(),user?progressStore(null):null,!!user,route));if(syncService)main.querySelector('#certificate')?.after(syncPanel(syncInfo,syncService,route));if(id==='certificate')main.querySelector('#certificate')?.scrollIntoView({block:'start'});}else if(page==='offer')renderLearningOffer(main,catalog);else if(page==='free')await renderFreeContent(main,catalog,()=>version===routeVersion);else if(page==='courses')courses();else if(page==='course')await course(id,version);else if(['cases','norms'].includes(page))references(page,id);else if(page==='account')await account();else if(page==='shop')await shop();else if(page==='cancel')renderCancellation(main);else if(['privacy','terms'].includes(page))renderLegal(main,page);else home();
 if(version===routeVersion&&main.dataset.readingId){
  readingViews.restore(main,main.dataset.readingVersion+':'+main.dataset.readingId,y=>requestAnimationFrame(()=>{if(version===routeVersion)window.scrollTo(0,y);}));
 }
}
try{
 catalog=await fetch('./catalog.json?v=20261027-lecture52').then(r=>{if(!r.ok)throw Error();return r.json();});
 await route();window.addEventListener('hashchange',()=>{resetScrollOnRoute=true;route();});
 try{
  auth=await import('./auth.js?v=20261027-lecture52');
  sessionManager=sessionCoordinator({readUser:auth.currentUser,readGrants:auth.getGrants,apply:async next=>{
   const previousOwner=user?.id??null,previousGrants=grantDetails(grants),first=!authSettled;
   const feedback=sessionFeedback(previousOwner,next.user?.id??null,{initial:first,returningFromLogin:returningFromLogin&&!loginReturnFailed});
   user=next.user;grants=next.grantsError&&previousOwner===(user?.id??null)?grants:next.grants;
   sessionProblem=next.grantsError?'Ihre Anmeldung ist bestätigt. Die Freischaltungen konnten gerade nicht vollständig geladen werden.':null;
   authSettled=true;if(user)loginReturnFailed=false;
   if(feedback){sessionMessage=user?null:'Sie sind erfolgreich abgemeldet.';notify({...feedback,text:next.grantsError?sessionProblem:feedback.text});}
   else if(first&&loginReturnFailed)notify({kind:'error',title:'Anmeldung nicht abgeschlossen',text:'Bitte versuchen Sie es erneut.'});
   if(accountNotice?.owner!==user?.id)accountNotice=null;
   const changed=first||previousOwner!==(user?.id??null)||previousGrants!==grantDetails(grants);
   if(changed)await route();else{sessionNotice();watchExpiry();}
   learningUpdateNotice.setUser(user?.id??null);
  },onError:()=>{
   const first=!authSettled;authSettled=true;sessionProblem='Die Anmeldung konnte gerade nicht geprüft werden. Bitte versuchen Sie es erneut.';
   if(first||!user)route();else sessionNotice();
  }});
  // Subscribe before reading the initial session, and never await inside this callback.
  auth.client.auth.onAuthStateChange(()=>sessionManager.notify());
  if(returningFromLogin)location.hash='#account';
  await sessionManager.refresh();
 }catch{authSettled=true;sessionProblem='Die Anmeldung konnte gerade nicht geladen werden. Bitte laden Sie die Seite erneut.';await route();}
}catch{main.replaceChildren(el('h1','Lernplattform nicht erreichbar'),el('p','Bitte laden Sie die Seite erneut.'));}

window.addEventListener('keydown',event=>{if(document.querySelector('dialog[open]')||!main.classList.contains('presentation-player')||/INPUT|SELECT|TEXTAREA/.test(event.target.tagName)||event.ctrlKey||event.metaKey||event.altKey)return;const links=main.querySelectorAll('.player-controls a');const target=event.key==='ArrowRight'?[...links].find(a=>a.textContent.includes('Nächste')):event.key==='ArrowLeft'?[...links].find(a=>a.textContent.includes('Vorherige')):null;if(target){event.preventDefault();target.click();}else if(event.key==='Escape'){const exit=main.querySelector('.player-header a');if(exit){event.preventDefault();exit.click();}else location.hash='#slides';}});
