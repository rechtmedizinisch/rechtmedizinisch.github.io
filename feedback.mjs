// Restore existing sessions quietly; only completed sign-in/out changes get a popup.
export function sessionFeedback(previousOwner,owner,{initial=false,returningFromLogin=false}={}){
 if(initial&&!returningFromLogin)return null;
 if(owner&&owner!==previousOwner)return {kind:'success',title:'Erfolgreich angemeldet',text:'Ihr persönlicher Zugang ist jetzt bereit.'};
 if(previousOwner&&!owner)return {kind:'success',title:'Erfolgreich abgemeldet',text:'Sie können die kostenlosen Inhalte weiterhin als Gast nutzen.'};
 return null;
}

let current;
export function notify({kind='success',title,text=''}){
 if(typeof document==='undefined')return;
 current?.close();
 const region=document.createElement('div');region.className='feedback-region';region.setAttribute('role',kind==='error'?'alert':'status');region.setAttribute('aria-live',kind==='error'?'assertive':'polite');region.setAttribute('aria-atomic','true');
 const banner=document.createElement('div');banner.className='feedback-toast feedback-'+kind;
 const icon=document.createElement('span');icon.className='feedback-icon';icon.setAttribute('aria-hidden','true');icon.textContent=kind==='error'?'!':kind==='info'?'i':'✓';
 const copy=document.createElement('div');copy.className='feedback-copy';
 const heading=document.createElement('strong');heading.textContent=title;copy.append(heading);
 if(text){const description=document.createElement('p');description.textContent=text;copy.append(description);}
 const dismiss=document.createElement('button');dismiss.type='button';dismiss.className='feedback-close';dismiss.setAttribute('aria-label','Meldung schließen');dismiss.textContent='×';
 banner.append(icon,copy,dismiss);document.body.append(region);
 let timer,started,closed=false,remaining=kind==='error'?9000:6500;
 const pause=()=>{if(timer){clearTimeout(timer);timer=null;remaining=Math.max(0,remaining-(performance.now()-started));}};
 const resume=()=>{if(closed||timer||document.hidden||banner.matches(':hover')||banner.contains(document.activeElement))return;started=performance.now();timer=setTimeout(close,remaining);};
 const visibility=()=>document.hidden?pause():resume();
 function close(){if(closed)return;closed=true;clearTimeout(timer);document.removeEventListener('visibilitychange',visibility);region.remove();if(current?.close===close)current=null;}
 dismiss.addEventListener('click',close);
 banner.addEventListener('pointerenter',pause);banner.addEventListener('pointerleave',resume);
 banner.addEventListener('focusin',pause);banner.addEventListener('focusout',()=>queueMicrotask(resume));
 document.addEventListener('visibilitychange',visibility);
 current={close};requestAnimationFrame(()=>{if(!closed)region.append(banner);});resume();return close;
}
