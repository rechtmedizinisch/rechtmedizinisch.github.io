import {hasAccess,shuffle} from './policy.mjs?v=20260930x';
import {protectReferences} from './presentation-theme.mjs?v=20260930x';
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!=null)n.textContent=protectReferences(String(text));if(cls)n.className=cls;return n;};
const btn=(text,fn,cls='')=>{const b=el('button',text,cls);b.type='button';b.onclick=fn;return b;};
const feedback=s=>(s??'').replace(/^(Richtig\.|Nein\.)\s*/, '');
const modes=[
 {id:'learning',icon:'💡',title:'Übungsmodus',description:'Lösung und Erklärung sofort sehen. Jede Frage direkt noch einmal beantworten.'},
 {id:'quick',icon:'⚡',title:'Schnellrunde',description:'Kurze Rückmeldung mit Lösung nach jeder Antwort, dann zur nächsten Frage.'},
 {id:'exam',icon:'📝',title:'Prüfungsmodus',description:'Ohne Lösungshinweise kreuzen. Alle Lösungen und Erklärungen erscheinen erst in der Auswertung.'}
];
function modeCards(onChange){const grid=el('div',null,'practice-modes');if(onChange)grid.setAttribute('aria-label','Übungsmodus auswählen');for(const m of modes){const card=el(onChange?'button':'article',null,'practice-mode');if(onChange){card.type='button';card.setAttribute('aria-pressed',String(m.id==='learning'));card.onclick=()=>{for(const n of grid.children)n.setAttribute('aria-pressed','false');card.setAttribute('aria-pressed','true');onChange(m.id);};}card.append(el('span',m.icon,'mode-icon'),el('strong',m.title),el('span',m.description,'mode-description'));grid.append(card);}return grid;}
export async function renderPractice(main,auth,grants,user,isCurrent){
 const hero=el('section',null,'knowledge-banner');hero.append(el('p','LERNWERKZEUGE','section-number'),el('h1','Wissen gezielt festigen'),el('p','Üben, wiederholen oder unter Zeitdruck testen. Fragen und Antworten werden bei jeder neuen Runde neu gemischt.'));main.append(hero);
 if(!auth||!hasAccess('practice',grants)){const a=el('a','Anmelden & Übungsbereich freischalten →','button');a.href='#account';const gate=el('section',null,'card');gate.append(el('h2','🔒 Ihre Wissensrunde freischalten'),el('p','Der Übungsbereich benötigt einen Web-Zugang für Übungen oder alle Inhalte.','notice'),a);main.append(gate,modeCards());const free=el('section',null,'card');free.append(el('span','Kostenlos starten','badge'),el('h2','Fragen direkt im Kurs beantworten'),el('p','Die Fallfragen und Wissensfragen in Kurs 1 und 2 sind ohne Anmeldung zugänglich.'));const links=el('div',null,'row');for(const n of [1,2]){const l=el('a',`Kurs ${n} öffnen →`,'button secondary');l.href=`#course/tag-0${n}`;links.append(l);}free.append(links);main.append(free);return;}
 let data;try{data=await auth.getCourse('practice:course-quizzes');}catch{}
 if(!isCurrent())return;
 if(!data?.questions?.length){main.append(el('p','Die Übungsfragen konnten nicht geladen werden. Bitte versuchen Sie es erneut.','notice'));return;}
 const storageKey='rm-web-practice-v1:'+user.id;
 let mistakes=[];try{mistakes=JSON.parse(localStorage.getItem(storageKey)??'[]');if(!Array.isArray(mistakes))mistakes=[];}catch{}
 const panel=el('section',null,'card practice-panel');main.append(panel);
 function saveResult(id,right){mistakes=mistakes.filter(x=>x!==id);if(!right)mistakes.push(id);try{localStorage.setItem(storageKey,JSON.stringify(mistakes));}catch{}}
 function setup(){
  panel.replaceChildren(el('span','✓ Übungsbereich freigeschaltet','badge'),el('h2','Ihre Wissensrunde'));
  let selectedMode='learning';const modesView=modeCards(value=>selectedMode=value);
  const timeLabel=el('label','Zeitlimit in Sekunden · 0 bedeutet ohne Timer');timeLabel.htmlFor='practice-seconds';const seconds=el('input');seconds.id='practice-seconds';seconds.type='number';seconds.min=0;seconds.max=5400;seconds.step=30;seconds.value='0';
  const timePreview=el('p','Ohne Zeitlimit','badge');const showTime=()=>{const n=Number(seconds.value);timePreview.textContent=n>0?`⏱ ${Math.floor(n/60)}:${String(n%60).padStart(2,'0')} Minuten für die gesamte Runde`:'Ohne Zeitlimit';};seconds.addEventListener('input',showTime);
  const start=items=>{const n=Number(seconds.value);if(!Number.isInteger(n)||n<0||n>5400||n%30){seconds.reportValidity();return;}run(items,selectedMode,n);};
  const timerBox=el('div',null,'practice-timer-setup');timerBox.append(el('h3','⏱ Optionales Zeitlimit'),timeLabel,seconds,timePreview,btn('90 Sekunden je Frage übernehmen',()=>{seconds.value=String(data.questions.length*90);showTime();},'secondary'));
  panel.append(modesView,timerBox,el('p',`${data.questions.length} Fragen. Für die Auswertung zählt der erste Versuch je Frage.`,'subtle'),btn('Runde starten →',()=>start(data.questions)));
  const wrong=data.questions.filter(q=>mistakes.includes(q.id)),mistakeBox=el('section',null,'practice-mistakes');mistakeBox.append(el('h3','↻ Fehlertraining aus Übungsrunden'),el('p',wrong.length?`${wrong.length} offene Fragen`:'Aktuell keine offenen Fehler in diesem Bereich.'));if(wrong.length)mistakeBox.append(btn('Diese Fehler üben →',()=>run(wrong,'learning',0),'secondary'));panel.append(mistakeBox);
  panel.append(el('p','Die Fehlerliste bleibt in diesem Browser getrennt für Ihr Web-Konto gespeichert. Sie wird nicht mit iCloud oder anderen Geräten synchronisiert.','subtle'));
 }
 function run(items,mode,seconds){
  const questions=shuffle(items).map(q=>({...q,order:shuffle(q.choices.map((_,i)=>i))}));
  const first=new Map();let index=0,chosen=null,finished=false,clock=null;
  const deadline=seconds?Date.now()+seconds*1000:null;
  const timer=el('p',null,'badge');
  function finish(){if(finished)return;finished=true;clearInterval(clock);panel.replaceChildren(el('h2','Ihre Auswertung'));
   const correct=questions.filter(q=>first.get(q.id)===q.correct).length;const score=el('div',null,'practice-score');score.append(el('strong',`${correct} / ${questions.length}`),el('span','beim ersten Versuch richtig'));panel.append(score);
   for(const q of questions){const answer=first.get(q.id),right=answer===q.correct;const box=el('section',null,'card');box.append(el('h3',`Kurs ${q.no} · ${right?'✓ Richtig':'✕ Noch nicht richtig'}`),el('p',q.question),el('p',answer==null?'Nicht beantwortet':'Ihre Antwort: '+q.choices[answer].label,right?'correct':'wrong'),el('p','Richtige Antwort: '+q.choices[q.correct].label,'correct'),el('p',feedback(q.choices[q.correct].feedback)));if(answer!=null&&!right)box.append(el('p',feedback(q.choices[answer].feedback)));panel.append(box);saveResult(q.id,right);}
   panel.append(btn('Neue Runde vorbereiten',setup));
  }
  function tick(){if(!isCurrent()){clearInterval(clock);return;}const left=Math.max(0,Math.ceil((deadline-Date.now())/1000));timer.textContent=`⏱ ${Math.floor(left/60)}:${String(left%60).padStart(2,'0')} verbleibend`;if(left===0)finish();}
  function draw(){if(!isCurrent())return;const q=questions[index];panel.replaceChildren(el('p',`Frage ${index+1} von ${questions.length} · Kurs ${q.no}`,'section-number'));if(deadline)panel.append(timer);panel.append(el('h2',q.question));
   for(const [position,i] of q.order.entries()){const choice=q.choices[i],b=btn('',()=>{chosen=i;if(!first.has(q.id))first.set(q.id,i);draw();},'answer practice-answer');b.append(el('span',String.fromCharCode(65+position),'answer-letter'),el('span',choice.label));b.disabled=chosen!==null;if(chosen!==null){if(mode==='exam'&&chosen===i)b.classList.add('selected-answer');else if(mode!=='exam'){if(i===q.correct)b.classList.add('correct');else if(i===chosen)b.classList.add('wrong');}}panel.append(b);}
   if(chosen!==null){if(mode!=='exam'){panel.append(el('p',chosen===q.correct?'✓ Richtig':'✕ Noch nicht richtig',chosen===q.correct?'correct':'wrong'),el('p','Richtige Antwort: '+q.choices[q.correct].label),el('p',feedback(q.choices[chosen].feedback)));if(mode==='learning')panel.append(btn('Frage erneut beantworten',()=>{chosen=null;q.order=shuffle(q.order);draw();},'secondary'));}
    panel.append(btn(index+1===questions.length?'Auswertung ansehen':'Nächste Frage →',()=>{index++;chosen=null;if(index===questions.length)finish();else draw();}));}
   panel.append(btn('Runde beenden und auswerten',finish,'secondary'));
  }
  draw();if(deadline){tick();clock=setInterval(tick,1000);}
 }
 setup();
}
