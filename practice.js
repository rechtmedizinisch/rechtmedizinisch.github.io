import {hasAccess,shuffle} from './policy.mjs?v=20260930m';
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!=null)n.textContent=text;if(cls)n.className=cls;return n;};
const btn=(text,fn,cls='')=>{const b=el('button',text,cls);b.type='button';b.onclick=fn;return b;};
const feedback=s=>(s??'').replace(/^(Richtig\.|Nein\.)\s*/, '');
export async function renderPractice(main,auth,grants,user,isCurrent){
 main.append(el('h1','Wissen gezielt festigen'),el('p','Übungsmodus, Schnellrunde oder Prüfung – mit zufällig angeordneten Fragen und Antworten.'));
 if(!auth||!hasAccess('practice',grants)){const a=el('a','Anmelden & Übungsbereich freischalten →','button');a.href='#account';main.append(el('p','🔒 Der Übungsbereich benötigt einen Web-Zugang für Übungen oder alle Inhalte. Die Fragen der kostenlosen Kurse können Sie direkt in Kurs 1 und 2 beantworten.','notice'),a);return;}
 let data;try{data=await auth.getCourse('practice:course-quizzes');}catch{}
 if(!isCurrent())return;
 if(!data?.questions?.length){main.append(el('p','Die Übungsfragen konnten nicht geladen werden. Bitte versuchen Sie es erneut.','notice'));return;}
 const storageKey='rm-web-practice-v1:'+user.id;
 let mistakes=[];try{mistakes=JSON.parse(localStorage.getItem(storageKey)??'[]');if(!Array.isArray(mistakes))mistakes=[];}catch{}
 const panel=el('section',null,'card');main.append(panel);
 function saveResult(id,right){mistakes=mistakes.filter(x=>x!==id);if(!right)mistakes.push(id);try{localStorage.setItem(storageKey,JSON.stringify(mistakes));}catch{}}
 function setup(){
  panel.replaceChildren(el('h2','Ihre Wissensrunde'));
  const label=el('label','Modus');label.htmlFor='practice-mode';const mode=el('select');mode.id='practice-mode';
  for(const [value,title] of [['learning','Übungsmodus · sofortige Lösung und Wiederholung'],['quick','Schnellrunde · kurze Rückmeldung'],['exam','Prüfungsmodus · Lösungen erst am Ende']]){const o=el('option',title);o.value=value;mode.append(o);}
  const timeLabel=el('label','Zeitlimit in Sekunden · 0 bedeutet ohne Timer');timeLabel.htmlFor='practice-seconds';const seconds=el('input');seconds.id='practice-seconds';seconds.type='number';seconds.min=0;seconds.max=5400;seconds.step=30;seconds.value='0';
  const start=items=>{const n=Number(seconds.value);if(!Number.isInteger(n)||n<0||n>5400||n%30){seconds.reportValidity();return;}run(items,mode.value,n);};
  panel.append(label,mode,timeLabel,seconds,btn('90 Sekunden je Frage',()=>seconds.value=String(data.questions.length*90),'secondary'),el('p',`${data.questions.length} Fragen. Für die Auswertung zählt der erste Versuch je Frage.`),btn('Runde starten',()=>start(data.questions)));
  const wrong=data.questions.filter(q=>mistakes.includes(q.id));panel.append(el('h3','Fehlertraining aus Übungsrunden'),el('p',`${wrong.length} offene Fragen`));if(wrong.length)panel.append(btn('Diese Fehler üben',()=>run(wrong,'learning',0),'secondary'));
  panel.append(el('p','Die Fehlerliste bleibt in diesem Browser getrennt für Ihr Web-Konto gespeichert. Sie wird nicht mit iCloud oder anderen Geräten synchronisiert.','subtle'));
 }
 function run(items,mode,seconds){
  const questions=shuffle(items).map(q=>({...q,order:shuffle(q.choices.map((_,i)=>i))}));
  const first=new Map();let index=0,chosen=null,finished=false,clock=null;
  const deadline=seconds?Date.now()+seconds*1000:null;
  const timer=el('p',null,'badge');
  function finish(){if(finished)return;finished=true;clearInterval(clock);panel.replaceChildren(el('h2','Ihre Auswertung'));
   const correct=questions.filter(q=>first.get(q.id)===q.correct).length;panel.append(el('p',`${correct} von ${questions.length} richtig.`));
   for(const q of questions){const answer=first.get(q.id),right=answer===q.correct;const box=el('section',null,'card');box.append(el('h3',`Kurs ${q.no} · ${right?'✓ Richtig':'✕ Noch nicht richtig'}`),el('p',q.question),el('p',answer==null?'Nicht beantwortet':'Ihre Antwort: '+q.choices[answer].label,right?'correct':'wrong'),el('p','Richtige Antwort: '+q.choices[q.correct].label,'correct'),el('p',feedback(q.choices[q.correct].feedback)));if(answer!=null&&!right)box.append(el('p',feedback(q.choices[answer].feedback)));panel.append(box);saveResult(q.id,right);}
   panel.append(btn('Neue Runde vorbereiten',setup));
  }
  function tick(){if(!isCurrent()){clearInterval(clock);return;}const left=Math.max(0,Math.ceil((deadline-Date.now())/1000));timer.textContent=`⏱ ${Math.floor(left/60)}:${String(left%60).padStart(2,'0')} verbleibend`;if(left===0)finish();}
  function draw(){if(!isCurrent())return;const q=questions[index];panel.replaceChildren(el('p',`Frage ${index+1} von ${questions.length} · Kurs ${q.no}`,'section-number'));if(deadline)panel.append(timer);panel.append(el('h2',q.question));
   for(const [position,i] of q.order.entries()){const choice=q.choices[i],b=btn(`${String.fromCharCode(65+position)} · ${choice.label}`,()=>{chosen=i;if(!first.has(q.id))first.set(q.id,i);draw();},'answer');b.disabled=chosen!==null;if(chosen!==null){if(mode==='exam'&&chosen===i)b.classList.add('selected-answer');else if(mode!=='exam'){if(i===q.correct)b.classList.add('correct');else if(i===chosen)b.classList.add('wrong');}}panel.append(b);}
   if(chosen!==null){if(mode!=='exam'){panel.append(el('p',chosen===q.correct?'✓ Richtig':'✕ Noch nicht richtig',chosen===q.correct?'correct':'wrong'),el('p','Richtige Antwort: '+q.choices[q.correct].label),el('p',feedback(q.choices[chosen].feedback)));if(mode==='learning')panel.append(btn('Frage erneut beantworten',()=>{chosen=null;q.order=shuffle(q.order);draw();},'secondary'));}
    panel.append(btn(index+1===questions.length?'Auswertung ansehen':'Nächste Frage →',()=>{index++;chosen=null;if(index===questions.length)finish();else draw();}));}
   panel.append(btn('Runde beenden und auswerten',finish,'secondary'));
  }
  draw();if(deadline){tick();clock=setInterval(tick,1000);}
 }
 setup();
}
