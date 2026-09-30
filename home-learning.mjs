import {catalogOverall} from './progress-overview.mjs?v=20260930an';
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
  const groups=[
    {label:'01 · Lernen',title:'Ihren Lernweg wählen',tone:'teal',icon:'📚',items:[['Alle 15 Kurse','#courses','Von Grundlagen bis Capstone'],['474 Lernfolien','#slides','Im Player durchblättern'],['Üben & Wissen prüfen','#practice','Fragen und Lernrunden']]},
    {label:'02 · Nachschlagen',title:'Wissen schnell finden',tone:'blue',icon:'🔎',items:[['Medizinrecht durchsuchen','#search','Begriffe, Fälle und Quellen'],['Begriffe & Gesundheitssystem','#library/glossary','Verständlich erklärt'],['Schaubilder','#library/diagrams','Zusammenhänge sehen']]},
    {label:'03 · Praxis',title:'Beruf und Podcast',tone:'gold',icon:'🩺',items:[['Special: PJ & Berufsstart','#library/career','Sicher in die Praxis starten'],['Andere Gesundheitsberufe','#library/professions','Wissen für das ganze Team'],['Podcast & Materialien','#podcast','Hören und vertiefen']]}
  ];
  const section=el('section',null,'home-learning-menu');section.append(el('p','WAS MÖCHTEN SIE HEUTE TUN?','section-number'),el('h2','Ihr Lernangebot'));
  const grid=el('div',null,'home-shortcut-grid');
  for(const group of groups){const card=el('section',null,`home-shortcut-card home-tone-${group.tone}`),heading=el('div',null,'home-shortcut-heading');heading.append(el('span',group.icon,'home-shortcut-symbol'),el('div',null));heading.lastChild.append(el('p',group.label,'section-number'),el('h3',group.title));card.append(heading);for(const [title,href,description] of group.items){const a=el('a');a.href=href;a.append(el('strong',title),el('small',description),el('span','↗','shortcut-arrow'));card.append(a);}grid.append(card);}
  section.append(grid);main.append(section);
  const discover=el('a',null,'home-offer-link');discover.href='#offer';discover.append(el('span','✨','home-shortcut-symbol'),el('span','Das gesamte Lernangebot entdecken'),el('span','Mehr erfahren →'));main.append(discover);
}
