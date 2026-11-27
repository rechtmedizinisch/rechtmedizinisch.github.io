import {loadPodcastEpisodes,renderPodcastListening} from './podcast-listening.mjs?v=20261125-podcast-mtr';
import {loadLibraryEntries} from './library.js?v=20261126-parcours-quellen';
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!=null)n.textContent=text;if(cls)n.className=cls;return n;};
const link=(text,href,cls)=>{const a=el('a',text,cls);a.href=href;if(href.startsWith('https:')){a.target='_blank';a.rel='noopener noreferrer';}return a;};
export async function renderPodcast(main,isCurrent,selectedId){
  const hero=el('section',null,'podcast-hero'),image=el('img');
  image.src='assets/podcast-cover.webp';image.alt='Recht Medizinisch – Podcast';
  const copy=el('div');
  copy.append(el('p','HÖREN · VERSTEHEN · VERTIEFEN','section-number'),el('h1','🎧 Recht Medizinisch'),el('p','Mit Florian Schlepple & Dr. Philipp Graef','podcast-hosts'),el('p','Medizin, Pflege und Recht im Gespräch. Finden Sie zur Folge die passenden Kurse und Schaubilder.'));
  renderPodcastListening(copy);hero.append(image,copy);main.append(hero);
  const materialsRequest=loadLibraryEntries().catch(()=>[]);
  const episodes=await loadPodcastEpisodes();
  if(!isCurrent())return;
  const search=el('input');search.type='search';search.placeholder='Folge oder Thema suchen';
  search.setAttribute('aria-label','Podcastfolgen durchsuchen');
  const count=el('p',null,'subtle');count.role='status';
  const grid=el('div',null,'podcast-grid'),relatedByEpisode=new Map();
  let materialTitles=null;
  const appendMaterials=(related,episode)=>{
    for(const id of episode.materials){
      const title=materialTitles.get(id);
      if(title)related.append(link(`▧ ${title} →`,'#material/'+encodeURIComponent(id)));
    }
    related.hidden=related.children.length===1;
  };
  function render(){
    grid.replaceChildren();relatedByEpisode.clear();
    const q=search.value.trim().toLocaleLowerCase('de');
    const matches=episodes.filter(e=>`${e.label} ${e.title} ${e.summary}`.toLocaleLowerCase('de').includes(q));
    count.textContent=`${matches.length} ${matches.length===1?"Folge / Kurzvisite":"Folgen und Kurzvisiten"}`;
    for(const episode of matches){
      const card=el('article',null,'card podcast-episode');
      card.append(el('p',`${episode.label} · ${typeof episode.duration==='number'?episode.duration+' Min.':episode.duration}`,'section-number'),
        el('h2',episode.title),el('p',episode.summary));
      if(episode.note)card.append(el('p',episode.note,'subtle'));
      renderPodcastListening(card,{episodeID:episode.id});
      const related=el('div',null,'podcast-related');related.append(el('h3','Passend weiterlernen'));
      for(const number of episode.courses)related.append(link(`🎓 Kurs ${String(number).padStart(2,'0')} öffnen`,`#course/tag-${String(number).padStart(2,'0')}`));
      related.hidden=related.children.length===1;
      if(materialTitles)appendMaterials(related,episode);
      relatedByEpisode.set(episode,related);
      card.append(related);grid.append(card);
    }
    if(!matches.length)grid.append(el('p','Keine passende Folge. Versuchen Sie einen anderen Begriff.','notice'));
  }
  if(selectedId){
    const selected=episodes.find(e=>e.id===selectedId);
    if(selected)search.value=selected.title;
  }
  main.append(search,count,grid);render();search.addEventListener('input',render);
  const about=el('section',null,'card');
  about.append(el('h2','Die Menschen hinter dem Podcast'),el('p','Florian Schlepple und Dr. Philipp Graef verbinden Perspektiven aus Pflege, Medizin und Recht.'),
    link('Philipp Graef: Profil, Publikationen und Projekte','https://philippgraef.github.io/'),
    el('p','Podcast und Lernplattform dienen der Information und Lehre; sie ersetzen keine individuelle medizinische oder rechtliche Beratung.','notice'));
  main.append(about);
  materialsRequest.then(library=>{
    if(!isCurrent())return;
    materialTitles=new Map(library.map(entry=>[entry.id,entry.title]));
    for(const [episode,related] of relatedByEpisode)appendMaterials(related,episode);
  });
}
