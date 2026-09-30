import {protectReferences} from './presentation-theme.mjs?v=20260930al';
import {courseStatus} from './progress-engine.mjs?v=20260930al';
import {shuffle,safeURL} from './policy.mjs?v=20260930al';
import {formatSlideText} from './slide-tools.js?v=20260930al';
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!=null)n.textContent=protectReferences(String(text));if(cls)n.className=cls;return n;};
const button=(label,fn,cls='secondary')=>{const b=el('button',label,cls);b.type='button';b.onclick=fn;return b;};
function external(label,url,onOpen){const a=el('a',label,'source-link'),href=safeURL(url);if(href){a.href=href;a.target='_blank';a.rel='noopener noreferrer';a.onclick=onOpen;}return a;}
export function renderCourseLearning(main,head,course,store,signedIn=false){
  const id=course.id,progress=el('div',null,'course-learning-progress'),meter=el('progress'),caption=el('p'),saveStatus=el('p',null,'subtle');
  meter.max=100;meter.setAttribute('aria-label','Kursfortschritt');caption.role='status';saveStatus.role='status';
  progress.append(meter,caption);head.insertBefore(progress,head.querySelector('h2'));main.append(saveStatus);
  function refresh(){const s=courseStatus(course,store.course(id));meter.value=s.percent;caption.textContent=`${s.percent} % · ${s.completedUnits} von ${s.totalUnits} Lernschritten`;saveStatus.textContent=store.error??(signedIn?'Ihr Lernstand gehört zu Ihrem Web-Konto. Den Synchronisierungsstatus finden Sie unter Fortschritt.':'Ihr Gast-Lernstand bleibt in diesem Browser. Nach der Anmeldung können Sie ihn auf Wunsch in Ihr Web-Konto übernehmen.');}
  function update(patch){store.update(id,patch);store.recordStatus(id,courseStatus(course,store.course(id)));refresh();}
  function mark(field,index){update({[field]:[...new Set([...store.course(id)[field],index])]});}
  function section(step,title){const box=el('section',null,'card learning-step');box.append(el('p',`SCHRITT ${step}`,'section-number'),el('h2',title));main.append(box);return box;}
  const basics=section(1,'📖 Materialien durcharbeiten');basics.append(el('p','Ein Material zählt beim Aufklappen. Lesen Sie den Text sorgfältig; tatsächliches Lesen kann nicht überprüft werden.','subtle'));
  course.basics.forEach((material,index)=>{const details=el('details',null,'learning-material'),summary=el('summary'),body=el('div');
    const label=()=>{summary.textContent=`${store.course(id).materialsRead.includes(index)?'✓':'○'} ${String(index+1).padStart(2,'0')} · ${material.title}`;};label();
    formatSlideText(body,material.body);if(material.norms?.length)body.append(el('p',material.norms.join(' · '),'subtle'));
    details.append(summary,body);details.addEventListener('toggle',()=>{if(details.open){mark('materialsRead',index);label();}});basics.append(details);
  });
  function task(step,title,q,field,multiple=false){
    const box=section(step,title);box.append(el('p',q.prompt??q.question??q.title));
    if(multiple)box.append(el('p','Mehrfachauswahl: Wählen Sie alle passenden Antworten und bestätigen Sie Ihre Auswahl.','notice'));
    const answers=el('div',null,'learning-answers'),feedback=el('div',null,'learning-feedback');feedback.role='status';
    let selected=multiple?[...store.course(id).transferChoices]:[];
    const order=shuffle(q.choices.map((choice,index)=>({index,label:typeof choice==='string'?choice:choice.label,feedback:choice.feedback})));
    function submit(indices){const patch=field==='transferChoices'?{transferChoices:indices,transferSubmitted:true}:{[field]:indices[0]};update(patch);draw();}
    function draw(){answers.replaceChildren();feedback.replaceChildren();const p=store.course(id),submitted=field==='transferChoices'?p.transferSubmitted:p[field]!=null;
      const picked=field==='transferChoices'?p.transferChoices:[p[field]],correct=q.correct==null?null:Array.isArray(q.correct)?q.correct:[q.correct];
      const right=correct===null||picked.length===correct.length&&correct.every(i=>picked.includes(i));
      order.forEach((option,index)=>{const b=button('',()=>{if(multiple){selected=selected.includes(option.index)?selected.filter(i=>i!==option.index):[...selected,option.index];draw();}else submit([option.index]);},'answer learning-answer');
        const chosen=submitted?picked.includes(option.index):selected.includes(option.index);
        const marker=el('span',multiple?(chosen?'✓':'□'):String.fromCharCode(65+index),'answer-marker');b.append(marker,el('span',option.label));
        b.disabled=submitted;if(multiple)b.setAttribute('aria-pressed',String(chosen));
        if(submitted&&correct?.includes(option.index))b.classList.add('correct');else if(submitted&&chosen&&correct)b.classList.add('wrong');
        answers.append(b);
      });
      if(submitted){feedback.className='learning-feedback '+(right?'correct':'wrong');feedback.append(el('strong',correct===null?'Abwägung bearbeitet':right?'✓ Richtig beantwortet':'Noch nicht richtig'));
        if(correct)feedback.append(el('p','Richtige Antwort'+(correct.length>1?'en: ':': ')+order.filter(o=>correct.includes(o.index)).map(o=>o.label).join(' · ')));
        const explanation=q.feedback??order.find(o=>o.index===picked[0])?.feedback;if(explanation)feedback.append(el('p',explanation.replace(/^(Richtig\.|Nein[:.]?)\s*/i,'')));
        feedback.append(button('Noch einmal beantworten',()=>{selected=[];update(field==='transferChoices'?{transferChoices:[],transferSubmitted:false}:{[field]:null});draw();}));
      }else if(multiple){const confirm=button('Auswahl prüfen',()=>submit(selected));confirm.disabled=!selected.length;feedback.append(confirm);}
    }
    box.append(answers,feedback);draw();
  }
  task(2,'⚖ '+course.caseTask.title,course.caseTask,'caseChoice');
  const d=course.decision,decision=section(3,'🏛 Leitentscheidung');decision.append(el('h3',d.title),el('p',`${d.court} · ${d.date} · ${d.docket}`,'subtle'),el('h3','Sachverhalt'),el('p',d.facts),el('h3','Entscheidung'),el('p',d.headnote),el('p','💡 '+d.practice,'notice'));
  const opened=el('p',store.course(id).decisionOpened?'✓ Originalquelle geöffnet':'Originalquelle noch nicht geöffnet','subtle');decision.append(external('Entscheidung an der Quelle öffnen ↗',d.url,()=>{update({decisionOpened:true});opened.textContent='✓ Originalquelle geöffnet';}),opened);
  task(4,'🔎 Wissen prüfen',course.quiz,'quizChoice');task(5,'🧭 Praxistransfer',course.transfer,'transferChoices',Array.isArray(course.transfer.correct));
  const sources=section(6,'🔗 Quellen & Vertiefung');course.reading.forEach((r,index)=>{const a=external((store.course(id).readingOpened.includes(index)?'✓ ':'')+r.label+' ↗',r.url,()=>{mark('readingOpened',index);a.textContent='✓ '+r.label+' ↗';});sources.append(a);});
  if(course.podcast){const p=course.podcast,podcast=section(7,'🎧 Zum Podcast');podcast.append(el('p','Mit Florian Schlepple & Dr. Philipp Graef','subtle'),el('p',p.bridge));const a=external((store.course(id).podcastOpened?'✓ ':'')+p.title+' ↗',p.link,()=>{update({podcastOpened:true});a.textContent='✓ '+p.title+' ↗';});podcast.append(a);}
  store.recordStatus(id,courseStatus(course,store.course(id)));refresh();
}
