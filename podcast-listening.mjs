import {podcastListening} from './podcast-listening-data.mjs?v=20261110-wd';
export {podcastListening};
let episodesRequest;
export function loadPodcastEpisodes(){
 if(!episodesRequest)episodesRequest=fetch('./podcast-episodes.json?v=20261110-wd').then(response=>{
  if(!response.ok)throw Error('Podcastfolgen konnten nicht geladen werden.');
  return response.json();
 }).then(allPodcastEpisodes).catch(error=>{episodesRequest=null;throw error;});
 return episodesRequest;
}
export function allPodcastEpisodes(base){
 const byID=new Map();for(const e of [...base,...podcastListening.extraEpisodes])if(!byID.has(e.id))byID.set(e.id,e);
 return [...podcastListening.episodeOrder.map(id=>byID.get(id)).filter(Boolean),...[...byID.values()].filter(e=>!podcastListening.episodeOrder.includes(e.id))];
}
export function podcastDestinations({episodeID,legacyURL}={}){
 const episode=podcastListening.episodes.find(e=>e.id===episodeID||(episodeID==null&&e.legacyURLs.includes(legacyURL)));
 return podcastListening.providers.flatMap(provider=>{
  const saved=episode?.links.find(l=>l.provider===provider.id),url=saved?.url??provider.showURL;
  try{const parsed=new URL(url);if(parsed.protocol!=='https:'||parsed.hostname!==provider.host||parsed.username||parsed.password)return [];
   return [{...provider,url:parsed.href,kind:saved?.kind==='episode'?'episode':'show'}];
  }catch{return [];}
 });
}
export function renderPodcastListening(parent,options={},onOpen=()=>{}){
 const grid=document.createElement('div');grid.className='podcast-platforms';grid.setAttribute('aria-label','Höranbieter');
 for(const destination of podcastDestinations(options)){
  const a=document.createElement('a');a.className='button secondary podcast-listen';a.href=destination.url;a.target='_blank';a.rel='noopener noreferrer';a.onclick=()=>onOpen(destination);
  const image=document.createElement('img');image.src='assets/podcast-'+destination.id+'.png';image.className='platform-logo';image.alt='';image.width=24;image.height=24;
  const copy=document.createElement('span');copy.className='podcast-listen-copy';const title=document.createElement('span');title.textContent=destination.title;
  const action=document.createElement('small');action.textContent=destination.kind==='episode'?'Folge hören':'Alle Folgen';copy.append(title,action);a.append(image,copy);grid.append(a);
 }
 parent.append(grid);return grid;
}
