const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!=null)n.textContent=text;if(cls)n.className=cls;return n;};
const link=(text,href)=>{const a=el('a',text,'button secondary');a.href=href;return a;};
export async function renderFreeContent(main,catalog,isCurrent){
  const hero=el('section',null,'knowledge-banner');hero.append(el('p','OHNE KAUF · OHNE ANMELDUNG','section-number'),el('h1','🎁 Kostenlos entdecken'),el('p','Beginnen Sie mit den Kursen oder schlagen Sie gezielt nach. Diese Inhalte sind frei zugänglich.'));main.append(hero);
  const grid=el('div',null,'grid');main.append(grid);
  const courseBox=el('section',null,'card');courseBox.append(el('h2','📚 Kurse 1 & 2'));
  for(const c of catalog.catalog.filter(c=>c.free))courseBox.append(link(`Kurs ${c.no} · ${c.title} →`,'#course/'+c.id));grid.append(courseBox);
  for(const [title,text,href] of [['🏛 Urteile',`${catalog.landmarkCases.length} Leitentscheidungen mit Einordnung und Originalquellen`,'#cases'],['⚖ Normen & Praxisressourcen','Rechtsgrundlagen und praktische Anlaufstellen zum Nachschlagen','#norms'],['🎧 Podcast','Alle Folgen mit Bezügen zu Kursen und Materialien','#podcast']]){const box=el('section',null,'card');box.append(el('h2',title),el('p',text),link('Bereich öffnen →',href));grid.append(box);}
  let entries;try{const response=await fetch('./library.json?v=20260930ag');if(!response.ok)throw Error();entries=await response.json();}catch{if(isCurrent())main.append(el('p','Die weiteren kostenlosen Inhalte konnten gerade nicht geladen werden. Bitte versuchen Sie es erneut.','notice'));return;}if(!isCurrent())return;
  for(const [group,title,href] of [['glossary','📖 Begriffe & Gesundheitssystem','#library/glossary'],['professions','🤝 Sieben Gesundheitsberufe','#library/professions'],['slides','📑 Die ersten zwölf Lernfolien','#slides'],['career','🩺 Einstieg in PJ & Berufsstart','#library/career'],['podcast','🖼 Zwei Podcast-Schaubilder','#library/podcast']]){
    const free=entries.filter(e=>e.group===group&&e.free),all=entries.filter(e=>e.group===group),box=el('section',null,'card');box.append(el('h2',title),el('p',`${free.length} Inhalte kostenlos${free.length<all.length?' · weitere Inhalte mit Freischaltcode':''}`));
    if(free.length<=2)for(const e of free)box.append(link(e.title+' →','#material/'+encodeURIComponent(e.id)));
    else box.append(link(group==='slides'?'Kostenlose Präsentation starten →':'Bereich öffnen →',group==='slides'?'#material/slides%3A1':href));grid.append(box);
  }
}
