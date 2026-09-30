import {catalogOverall} from './progress-overview.mjs?v=20260930ag';
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!=null)n.textContent=text;if(cls)n.className=cls;return n;};
export function homeLearning(main,catalog,store){
  const overall=catalogOverall(catalog,store.snapshot),next=overall.states.find(s=>!s.isComplete)??overall.states.at(-1);
  const hero=main.querySelector('.hero-copy'),start=hero?.querySelector('a.button');
  if(hero&&start){
    const summary=el('p',`${overall.completedCourses} von ${overall.totalCourses} Kursen abgeschlossen · ${overall.percent} % · ${overall.experiencePoints} XP`,'home-learning-summary');
    hero.insertBefore(summary,start);
    if(next){start.href='#course/'+next.entry.id;start.textContent=overall.isComplete?'Kurse wiederholen →':overall.completedUnits?`Weiterlernen · Kurs ${String(next.entry.no).padStart(2,'0')} →`:'Kostenlos mit Kurs 1 starten →';}
    const progress=el('a','Meinen Fortschritt ansehen →','home-progress-link');progress.href='#progress';hero.append(progress);
  }
  const routes=[['🔎','Medizinrecht durchsuchen','#search'],['📚','Alle 15 Kurse','#courses'],['🩺','Special: PJ & Berufsstart','#library/career'],['📖','Begriffe & Gesundheitssystem','#library/glossary'],['🤝','Andere Gesundheitsberufe','#library/professions'],['📑','474 Lernfolien','#slides'],['🖼','Schaubilder','#library/system'],['🎧','Podcast & passende Materialien','#podcast']];
  const section=el('section',null,'card home-learning-menu');section.append(el('h2','Ihr Lernangebot'));
  for(const [icon,title,href] of routes){const a=el('a');a.href=href;const symbol=el('span',icon);symbol.setAttribute('aria-hidden','true');a.append(symbol,el('span',title),el('span','›'));section.append(a);}
  main.append(section);
}
