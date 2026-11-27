import {roleIcon} from './reading-style.mjs?v=20261126-web-release';
import {hasAccess,shuffle} from './policy.mjs?v=20261111-guided-learning';
import {protectReferences} from './presentation-theme.mjs?v=20261111-guided-learning';
import {courseMistakes} from './practice-mistakes.mjs?v=20261111-guided-learning';
import {validPracticeBank,practiceExplanations,practiceSources} from './practice-bank.mjs?v=20261111-guided-learning';
import {learningPathQuestions} from './learning-paths.mjs?v=20261111-guided-learning';
import {workshopCases} from './practice-catalog.mjs?v=20261111-guided-learning';
import {localParcoursProgress} from './mtr.js?v=20261126-parcours-navigation';
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!=null)n.textContent=protectReferences(String(text));if(cls)n.className=cls;return n;};
const btn=(text,fn,cls='')=>{const b=el('button',text,cls);b.type='button';b.onclick=fn;return b;};
function sourceLinks(target,question){for(const url of practiceSources(question)){const link=el('a','Originalquelle · '+new URL(url).hostname+'','practice-source');link.href=url;link.target='_blank';link.rel='noopener noreferrer';target.append(link);}}
const modes=[
 {id:'learning',icon:'💡',title:'Übungsmodus',description:'Lösung und Erklärung sofort sehen. Jede Frage direkt noch einmal beantworten.'},
 {id:'quick',icon:'⚡',title:'Schnellrunde',description:'Kurze Rückmeldung mit Lösung nach jeder Antwort, dann zur nächsten Frage.'},
 {id:'exam',icon:'📝',title:'Prüfungsmodus',description:'Ohne Lösungshinweise kreuzen. Alle Lösungen und Erklärungen erscheinen erst in der Auswertung.'}
];
function modeCards(onChange){const grid=el('div',null,'practice-modes');if(onChange)grid.setAttribute('aria-label','Übungsmodus auswählen');for(const m of modes){const card=el(onChange?'button':'article',null,'practice-mode');if(onChange){card.type='button';card.setAttribute('aria-pressed',String(m.id==='learning'));card.onclick=()=>{for(const n of grid.children)n.setAttribute('aria-pressed','false');card.setAttribute('aria-pressed','true');onChange(m.id);};}card.append(el('span',m.icon,'mode-icon'),el('strong',m.title),el('span',m.description,'mode-description'));grid.append(card);}return grid;}
function practiceLink(href,title,detail,symbol,note=''){
 const card=el('a',null,'card practice-entry');
 card.href=href;
 const icon=el('span',null,'practice-entry-icon');
 icon.append(roleIcon(symbol));
 const copy=el('div',null,'practice-entry-copy');
 copy.append(el('h3',title),el('p',detail));
 if(note)copy.append(el('span',note,'practice-entry-access'));
 const arrow=el('span','›','practice-entry-chevron');
 arrow.setAttribute('aria-hidden','true');
 card.append(icon,copy,arrow);
 return card;
}

export function renderPracticeOverview(main,grants,user){
 const canOpenParcours = !!user?.id && hasAccess('all',grants);
 const progress = localParcoursProgress(canOpenParcours ? user.id : null);
 const parcoursStatus = canOpenParcours
  ? `${progress.completed} von ${progress.total} Aufgaben abgeschlossen`
  : `${progress.total} Aufgaben · Premium`;
 const apply=el('section',null,'practice-overview');apply.append(el('h2','Wissen anwenden'));
 apply.append(
  practiceLink('#casework','Fallwerkstatt',workshopCases.length+' Originalfälle · Sachverhalte und Urteile aus der Praxis','facts','Ein Fall kostenlos'),
  practiceLink('#casefile','Interaktive Strafakte','Ermitteln, Beweise würdigen und entscheiden','reasoning','Ein Probefall kostenlos'),
  practiceLink('#mtr','Parcours für Recht und Ethik','Grundlagen für alle Gesundheitsberufe · Besonderheiten für den MTR-Beruf · 8 Etappen','radiology',parcoursStatus)
 );
 const recall=el('section',null,'practice-overview');recall.append(el('h2','Wissen abfragen'),
  practiceLink('#quiz','Quiz & Prüfungsrunden','Rundenmodus, Fragenauswahl und Fehlertraining','question',hasAccess('practice',grants)?'':'Premium'));
 main.append(el('h1','Üben'),apply,recall);
}

export async function renderPractice(main,auth,grants,user,isCurrent,learningStore,initialPathId=''){
 const back=el('a','Zurück zu Üben','button secondary');back.href='#practice';
 if(/^special-[a-z0-9-]+$/.test(initialPathId)){back.textContent='Zurück zum Spezialkurs';back.href='#material/'+encodeURIComponent('special:'+initialPathId);}
 main.append(back,el('h1','Quiz & Prüfungsrunden'));
 if(!auth||!hasAccess('practice',grants)){const a=el('a','Anmelden & Übungsbereich freischalten →','button');a.href='#account';const gate=el('section',null,'card');gate.append(el('h2','🔒 Ihre Wissensrunde freischalten'),el('p','Der Übungsbereich benötigt einen Web-Zugang für Übungen oder alle Inhalte.','notice'),a);main.append(gate,modeCards());const free=el('section',null,'card');free.append(el('span','Kostenlos starten','badge'),el('h2','Fragen direkt im Kurs beantworten'),el('p','Die Fallfragen und Wissensfragen in Kurs 1 und 2 sind ohne Anmeldung zugänglich.'));const links=el('div',null,'row');for(const n of [1,2]){const l=el('a',`Kurs ${n} öffnen`,'button secondary');l.href=`#course/tag-0${n}`;links.append(l);}free.append(links);main.append(free);return;}
 let data;try{data=await auth.getCourse('practice:course-quizzes-202610');}catch{}
 if(!isCurrent())return;
 if(!validPracticeBank(data?.questions)){main.append(el('p','Die Übungsfragen konnten nicht geladen werden. Bitte versuchen Sie es erneut.','notice'));return;}
 let paths=[];try{const response=await fetch('./library.json?v=20261126-parcours-dialog-fit');if(response.ok)paths=(await response.json()).filter(e=>e.group==='special'&&e.content).map(e=>e.content);}catch{}
 if(!isCurrent())return;
 let pathId=initialPathId;
 const panel=el('section',null,'card practice-panel');main.append(panel);
 function saveResult(id,right){learningStore.recordPracticeAnswer(id,right);}
 function setup(){
  panel.replaceChildren(el('h2','Ihre Wissensrunde'),el('h3','Rundenmodus'));
  let selectedMode='learning';const modesView=modeCards(value=>selectedMode=value);
  const timeLabel=el('label','Zeitlimit in Sekunden · 0 bedeutet ohne Timer');timeLabel.htmlFor='practice-seconds';const seconds=el('input');seconds.id='practice-seconds';seconds.type='number';seconds.min=0;seconds.max=5400;seconds.step=30;seconds.value='0';
  const timePreview=el('p','Ohne Zeitlimit','badge');const showTime=()=>{const n=Number(seconds.value);timePreview.textContent=n>0?`⏱ ${Math.floor(n/60)}:${String(n%60).padStart(2,'0')} Minuten für die gesamte Runde`:'Ohne Zeitlimit';};seconds.addEventListener('input',showTime);
  const offer=el('select');offer.setAttribute('aria-label','Lernangebot');
  for(const p of [{id:'',title:'Alle Lernangebote'},...paths]){const option=el('option',p.title);option.value=p.id;offer.append(option);}offer.value=pathId;
  if(pathId&&!paths.some(p=>p.id===pathId)){panel.append(el('p','Dieser Spezialkurs konnte nicht geladen werden. Bitte wählen Sie ein Lernangebot.','notice'));offer.selectedIndex=-1;}
  const questions=learningPathQuestions(data.questions,paths,pathId);
  const topic=el('select');topic.setAttribute('aria-label','Themenauswahl');for(const no of [0,...new Set(questions.map(q=>q.no))]){const option=el('option',no?'Kurs '+String(no).padStart(2,'0'):'Alle Kurse');option.value=String(no);topic.append(option);}
  const count=el('input');count.type='number';count.min=1;count.max=questions.length;count.value=String(Math.min(10,questions.length));count.setAttribute('aria-label','Anzahl Fragen');
  const selected=()=>questions.filter(q=>!Number(topic.value)||q.no===Number(topic.value));
  offer.onchange=()=>{pathId=offer.value;setup();};
  topic.onchange=()=>{count.max=String(selected().length);count.value=String(Math.min(Number(count.value)||1,selected().length));};
  const start=items=>{if(!items.length)return;const requested=Number(count.value);if(!Number.isInteger(requested)||requested<1||requested>items.length){count.reportValidity();return;}items=shuffle(items).slice(0,requested);const n=Number(seconds.value);if(!Number.isInteger(n)||n<0||n>5400||n%30){seconds.reportValidity();return;}run(items,selectedMode,n);};
  const timerBox=el('div',null,'practice-timer-setup');timerBox.append(el('h3','⏱ Optionales Zeitlimit'),timeLabel,seconds,timePreview,btn('90 Sekunden je Frage übernehmen',()=>{seconds.value=String(Math.min(Number(count.value)||1,selected().length)*90);showTime();},'secondary'));
  const startButton=btn('Runde starten →',()=>start(selected()));startButton.disabled=!questions.length;
  panel.append(modesView,el('h3','Fragenauswahl'),el('label','Lernangebot'),offer,el('label','Themenauswahl'),topic,el('label','Anzahl Fragen'),count,timerBox,el('p',`${questions.length} Fragen. Für die Auswertung zählt der erste Versuch je Frage.`,'subtle'),startButton);
  const courseWrong=courseMistakes(questions,learningStore?.snapshot),courseBox=el('section',null,'practice-mistakes');
  courseBox.append(el('h3','📚 Fehlertraining aus Kursen'),el('p',courseWrong.length?`${courseWrong.length} ${courseWrong.length===1?'offene Kursfrage':'offene Kursfragen'}`:'Aktuell keine offenen Fehler aus Ihren Kursfragen.'));
  if(courseWrong.length){courseBox.append(btn('Kursfehler üben →',()=>run(courseWrong,'learning',0),'secondary'));const links=el('div',null,'row');for(const q of courseWrong){const a=el('a',`Kurs ${String(q.no).padStart(2,'0')} · Antwort im Kurs korrigieren →`,'button secondary');a.href='#course/'+encodeURIComponent(q.id);links.append(a);}courseBox.append(links);}
  courseBox.append(el('p','Kursfehler bleiben hier sichtbar, bis Sie die Frage im jeweiligen Kurs richtig beantworten. Eine Übungsrunde verändert weder Ihren Kursabschluss noch die Zertifikatsfreigabe.','subtle'));panel.append(courseBox);
  const wrong=questions.filter(q=>learningStore.snapshot.practiceMistakes.includes(q.id)),mistakeBox=el('section',null,'practice-mistakes');mistakeBox.append(el('h3','↻ Fehlertraining aus Übungsrunden'),el('p',wrong.length?`${wrong.length} ${wrong.length===1?'offene Frage':'offene Fragen'}`:'Aktuell keine offenen Fehler in diesem Bereich.'));if(wrong.length)mistakeBox.append(btn('Diese Fehler üben →',()=>run(wrong,'learning',0),'secondary'));panel.append(mistakeBox);
  panel.append(el('p','Die Fehlerliste gehört zu Ihrem Web-Konto und wird zusammen mit dem Lernstand synchronisiert. Den aktuellen Abgleichstatus finden Sie unter Fortschritt.','subtle'));
 }
 function run(items,mode,seconds){
  const questions=shuffle(items).map(q=>({...q,order:shuffle(q.choices.map((_,i)=>i))}));
  const first=new Map();let index=0,chosen=null,finished=false,clock=null;
  const deadline=seconds?Date.now()+seconds*1000:null;
  const timer=el('p',null,'badge');
  function finish(){if(finished)return;finished=true;clearInterval(clock);panel.replaceChildren(el('h2','Ihre Auswertung'));
   const correct=questions.filter(q=>first.get(q.id)===q.correct).length;const score=el('div',null,'practice-score');score.append(el('strong',`${correct} / ${questions.length}`),el('span','beim ersten Versuch richtig'));panel.append(score,el('p',`${first.size} beantwortet · ${questions.length-first.size} unbeantwortet. Gewertet wird der erste Versuch. Unbeantwortete Fragen werden nicht als Fehler gespeichert.`),el('p','Diese Runde verändert weder Kursabschlüsse noch die Zertifikatsfreigabe.','subtle'));
   for(const q of questions){const answer=first.get(q.id),right=answer===q.correct;const box=el('section',null,'card');box.append(el('h3',`Kurs ${q.no} · ${answer==null?'Nicht beantwortet':right?'✓ Richtig':'✕ Noch nicht richtig'}`),el('p',q.question),el('p',answer==null?'Nicht beantwortet':'Ihre Antwort: '+q.choices[answer].label,answer==null?'subtle':right?'correct':'wrong'),el('p','Richtige Antwort: '+q.choices[q.correct].label,'correct'));for(const text of practiceExplanations(q,answer))box.append(el('p',text));sourceLinks(box,q);panel.append(box);}
   panel.append(btn('Neue Runde vorbereiten',setup));
  }
  function tick(){if(!isCurrent()){clearInterval(clock);return;}const left=Math.max(0,Math.ceil((deadline-Date.now())/1000));timer.textContent=`⏱ ${Math.floor(left/60)}:${String(left%60).padStart(2,'0')} verbleibend`;if(left===0)finish();}
  function draw(){if(!isCurrent())return;const q=questions[index];panel.replaceChildren(el('p',`Frage ${index+1} von ${questions.length} · Kurs ${q.no}`,'section-number'));if(deadline)panel.append(timer);panel.append(el('h2',q.question));
   for(const [position,i] of q.order.entries()){const choice=q.choices[i],b=btn('',()=>{if(deadline&&Date.now()>=deadline){finish();return;}chosen=i;if(!first.has(q.id))first.set(q.id,i);saveResult(q.id,i===q.correct);draw();},'answer practice-answer');b.append(el('span',String.fromCharCode(65+position),'answer-letter'),el('span',choice.label));b.disabled=chosen!==null;if(chosen!==null){if(mode==='exam'&&chosen===i)b.classList.add('selected-answer');else if(mode!=='exam'){if(i===q.correct)b.classList.add('correct');else if(i===chosen)b.classList.add('wrong');}}panel.append(b);}
   if(chosen!==null){if(mode!=='exam'){panel.append(el('p',chosen===q.correct?'✓ Richtig':'✕ Noch nicht richtig',chosen===q.correct?'correct':'wrong'),el('p','Richtige Antwort: '+q.choices[q.correct].label));for(const text of practiceExplanations(q,chosen))panel.append(el('p',text));sourceLinks(panel,q);if(mode==='learning')panel.append(btn('Frage erneut beantworten',()=>{chosen=null;q.order=shuffle(q.order);draw();},'secondary'),el('p','Wiederholungen ändern nicht die Wertung des ersten Versuchs. Eine richtige Antwort entfernt die Frage aus dem Fehlertraining der Übungsrunden.','subtle'));}
    panel.append(btn(index+1===questions.length?'Auswertung ansehen':'Nächste Frage →',()=>{index++;chosen=null;if(index===questions.length)finish();else draw();}));}
   panel.append(btn('Runde beenden und auswerten',finish,'secondary'));
  }
  draw();if(deadline){tick();clock=setInterval(tick,1000);}
 }
 setup();
}
