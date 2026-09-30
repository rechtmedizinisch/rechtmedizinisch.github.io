import {courseStatus} from './progress-engine.mjs?v=20260930aj';
export function catalogStatus(entry,value={},content){
  if(content)return courseStatus(content,value);
  const totalUnits=entry.totalUnits??0;
  // A saved result from another course revision must be re-evaluated on opening.
  const completedUnits=value.totalUnits===totalUnits&&Number.isInteger(value.completedUnits)
    ?Math.max(0,Math.min(totalUnits,value.completedUnits)):0;
  const isComplete=totalUnits>0&&completedUnits===totalUnits;
  return {completedUnits,totalUnits,isComplete,percent:isComplete?100:totalUnits?Math.min(99,Math.round(completedUnits/totalUnits*100)):0};
}
export function catalogOverall(catalog,progress){
  const states=catalog.catalog.map(c=>({entry:c,...catalogStatus(c,progress.courses[c.id],catalog.courses.find(x=>x.id===c.id))}));
  const completedUnits=states.reduce((n,s)=>n+s.completedUnits,0),totalUnits=states.reduce((n,s)=>n+s.totalUnits,0);
  const completedCourses=states.filter(s=>s.isComplete).length,totalCourses=states.length;
  const isComplete=totalCourses>0&&completedCourses===totalCourses&&totalUnits>0;
  return {states,completedUnits,totalUnits,completedCourses,totalCourses,isComplete,
    experiencePoints:completedUnits*10,percent:isComplete?100:totalUnits?Math.min(99,Math.round(completedUnits/totalUnits*100)):0};
}
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!=null)n.textContent=text;if(cls)n.className=cls;return n;};
const link=(text,href,cls)=>{const a=el('a',text,cls);a.href=href;return a;};
export function progressBadge(entry,store,content){
  const status=catalogStatus(entry,store.course(entry.id),content),box=el('div',null,'course-progress-preview'),meter=el('progress');
  meter.max=100;meter.value=status.percent;meter.setAttribute('aria-label',`Kurs ${entry.no}: ${status.percent} Prozent`);
  box.append(el('span',`${status.isComplete?'✓ Abgeschlossen':status.completedUnits?'In Bearbeitung':'Noch nicht begonnen'} · ${status.percent} %`),meter);return box;
}
export function renderProgress(main,catalog,store,isSignedIn){
  const s=catalogOverall(catalog,store.snapshot),hero=el('section',null,'knowledge-banner');
  hero.append(el('p','IHR LERNWEG','section-number'),el('h1','📈 Mein Fortschritt'),el('p',`${s.completedCourses} von ${s.totalCourses} Kursen abgeschlossen`));
  const stats=el('div',null,'progress-stat-grid');for(const [value,label] of [[`${s.percent} %`,'Gesamtfortschritt'],[`${s.completedUnits} / ${s.totalUnits}`,'Lernschritte'],[`${s.experiencePoints} XP`,'Erfahrungspunkte']]){const box=el('div');box.append(el('strong',value),el('span',label));stats.append(box);}hero.append(stats);main.append(hero);
  main.append(el('p',isSignedIn?'Ihr Lernstand ist Ihrem Web-Konto zugeordnet. Den aktuellen Synchronisierungsstatus sehen Sie oben.':'Sie lernen als Gast. Ihr Lernstand bleibt in diesem Browser gespeichert und wird bei einer Anmeldung nicht automatisch einem Konto hinzugefügt.','notice'));
  const grid=el('div',null,'grid');for(const state of s.states){const c=state.entry,card=el('section',null,'card');card.append(el('p',`KURS ${String(c.no).padStart(2,'0')}`,'section-number'),el('h2',c.title),progressBadge(c,store,catalog.courses.find(x=>x.id===c.id)),el('p',`${state.completedUnits} von ${state.totalUnits} Lernschritten`,'subtle'),link(state.isComplete?'Kurs wiederholen →':state.completedUnits?'Weiterlernen →':'Kurs öffnen →',`#course/${c.id}`,'button secondary'));grid.append(card);}main.append(grid);
  const certificate=el('section',null,'card certificate-gate');certificate.append(el('h2','🎓 Ihr Medizinrecht-Zertifikat'),el('p',s.isComplete?'Alle Pflichtschritte sind abgeschlossen.':'Ihr Zertifikat wird nach Abschluss aller 15 Kurse freigeschaltet. Dazu gehören Materialien, richtige Aufgabenlösungen, Originalquellen und die zugeordneten Podcastlinks.'),el('p','Digitaler Lernnachweis; keine staatliche Prüfungs- oder Berufsqualifikationsbescheinigung.','subtle'));
  const label=el('label','Name auf dem Zertifikat'),input=el('input'),download=el('button',s.isComplete?'↓ Zertifikat als PDF speichern':'🔒 Zertifikat noch nicht freigeschaltet'),feedback=el('p');
  input.id='certificate-name';label.htmlFor=input.id;input.maxLength=120;input.autocomplete='name';input.value=store.snapshot.certificateName??'';download.type='button';download.disabled=!s.isComplete;feedback.role='status';
  input.addEventListener('change',()=>store.setCertificateName(input.value));
  download.onclick=async()=>{download.disabled=true;feedback.textContent='PDF wird erstellt …';try{const {downloadCertificate}=await import('./certificate.mjs?v=20260930aj');await downloadCertificate(input.value,catalogOverall(catalog,store.snapshot));store.setCertificateName(input.value);feedback.textContent='PDF erstellt. Bei Bedarf im Downloadbereich Ihres Browsers öffnen.';}catch(error){feedback.textContent=error.message??'PDF konnte nicht erstellt werden.';}finally{download.disabled=!catalogOverall(catalog,store.snapshot).isComplete;}};
  certificate.append(label,input,download,feedback);main.append(certificate);
}
