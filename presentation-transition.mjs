// Keep the connected player visible while the next slide and its assets load.
// The key includes the current user and active scopes; never retain a slide
// across sign-out, account changes or access expiry.
const displayedAccess = new WeakMap();

export async function replacePresentation(main, {accessKey, isCurrent, render, retry}) {
 const document=main.ownerDocument;
 const keep=main.classList.contains('presentation-player')&&displayedAccess.get(main)===accessKey;
 if(!keep){main.classList.remove('narrow','presentation-player');main.replaceChildren();document.querySelectorAll('body > header, body > footer').forEach(el=>{el.inert=false;});}
 main.querySelector('.player-loading')?.remove();
 const message=document.createElement('span');message.className='player-loading';message.setAttribute('role','status');message.textContent='Folie wird geladen …';
 (main.querySelector('.player-header')??main).append(message);
 main.setAttribute('aria-busy','true');
 const prepared=document.createElement('main');
 try{
  await render(prepared);
  if(!isCurrent())return;
  // Commit the complete result in one synchronous DOM update. Keeping the
  // presentation class until this point avoids exposing the page behind it.
  main.classList.toggle('presentation-player',prepared.classList.contains('presentation-player'));
  main.classList.remove('narrow');
  main.replaceChildren(...prepared.childNodes);
  displayedAccess.set(main,accessKey);
 }catch{
  if(!isCurrent())return;
  message.textContent='Folie konnte nicht geladen werden. ';
  const again=document.createElement('button');again.className='secondary';again.textContent='Erneut versuchen';again.onclick=retry;message.append(again);
 }finally{
  if(isCurrent()){
   main.removeAttribute('aria-busy');
   const player=main.classList.contains('presentation-player');
   document.querySelectorAll('body > header, body > footer').forEach(el=>{el.inert=player;});
   main.querySelector('.slide-stage')?.focus({preventScroll:true});
  }
 }
}
