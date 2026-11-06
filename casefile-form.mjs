const el=(tag,text)=>{const n=document.createElement(tag);if(text!=null)n.textContent=text;return n;};
export function casefileInput({id,title,op=id,kind='command'},value,{dialog,submit,isCurrent}){
 const fields=new Map(),refs=new Set();let selection='A03',route='court',station='patient',request='acquit',delict='223';
 const d=dialog(title,target=>{
  const form=el('form'),error=el('p');error.role='alert';form.className='casefile-form';target.append(form);form.append(error);
  function editor(key,label){const wrap=el('label',label),input=el('textarea');input.rows=4;input.value='';wrap.append(input);form.append(wrap);fields.set(key,input);return input;}
  function choice(label,options,selected,change){const wrap=el('label',label),select=el('select');for(const [id,text]of options){const o=el('option',text);o.value=id;select.append(o);}select.value=selected;select.onchange=()=>change(select.value);wrap.append(select);form.append(wrap);return select;}
  function number(label,value,min,max){const wrap=el('label',label),input=el('input');input.type='number';input.min=min;input.max=max;input.step=1;input.value=value;wrap.append(input);form.append(wrap);return input;}
  function check(parent,label,selected,change){const wrap=el('label'),input=el('input');input.type='checkbox';input.checked=selected;input.onchange=()=>change(input.checked);wrap.append(input,document.createTextNode(label));parent.append(wrap);}
  if(id==='A06')choice('Konkreter Ermittlungsauftrag',value.actions.filter(a=>['A03','A04','A08','A09','A10','A11','A13','A19'].includes(a.id)).map(a=>[a.id,a.title]),selection,x=>selection=x);
  if(id==='A15'){choice('Sicherungsweg',[['court','Gerichtlichen Antrag prüfen'],['voluntary','Freiwillige Übermittlung prüfen'],['urgent','Gefahr im Verzug prüfen']],route,x=>route=x);form.append(el('p','Nur erforderliche Unterlagen zur konkreten Behandlung; fremde Patientendaten bleiben ausgeschlossen.'));}
  if(['motion','reopenEvidence'].includes(op)){choice('Beweismittel',value.stations.map(s=>[s.id,s.title]),station,x=>station=x);editor('fact','Welche konkrete Tatsache soll geklärt werden?');editor('link','Zusammenhang mit dem Tatvorwurf');}
  if(['indict','plea'].includes(op)){
   if(op==='plea')choice('Antrag',[['acquit','Freispruch'],['convict','Verurteilung']],request,x=>request=x);
   choice('Rechtliche Einordnung',[['223','§ 223 StGB · vorsätzliche Körperverletzung'],['229','§ 229 StGB · fahrlässige Körperverletzung']],delict,x=>delict=x);
   if(op==='indict')editor('fact','Konkreter Tatvorwurf');
  }
  let days;if(op==='plea'){days=number('Anzahl der Tagessätze · nur bei Verurteilungsantrag','30',5,360);form.append(el('p','Die Tagessatzhöhe beträgt im fiktiven Beispiel 120 €. Das ist keine feste gesetzliche Vorgabe.'));}
  const modules=new Set(['P01']);let amount,months;
  if(op==='savePlan'){
   for(const [id,label]of [['P01','Geldzahlung an die Staatskasse'],['P02','Wiedergutmachung an die Patientin'],['P03','Ernsthaftes Ausgleichsbemühen']])check(form,label,modules.has(id),yes=>yes?modules.add(id):modules.delete(id));
   amount=number('Euro je gewählter Geldleistung','600',50,10000);months=number('Frist in Monaten','3',1,6);form.append(el('p','Zulässigkeit und erforderliche Zustimmung werden anschließend gesondert geprüft.'));
  }
  if(!['motion','reopenEvidence'].includes(op))editor('reason',op==='reply'?'Ihre Erwiderung · leer lassen zum Verzicht':op==='comment'?'Ihre Erklärung':id==='A18'?'Zweck der Erhebung':kind==='action'?'Eigene Notiz zum Ermittlungsauftrag (optional)':'Ihre Begründung');
  if(kind==='action')form.append(el('p','Diese Notiz wird gespeichert. Antworten von Personen erhalten Sie über die auswählbaren Fragen bei der Befragung.'));
  if(['decision','indict','plea'].includes(op))editor('counter','Stärkstes Gegenargument und verbleibende Unsicherheit');
  if(op==='plea'){
   const extra=el('details');extra.append(el('summary','Schlussvortrag weiter strukturieren'));form.append(extra);
   for(const [key,label]of [['charge','Tatvorwurf'],['findings','Festgestellte Tatsachen'],['legal','Rechtliche Einordnung'],['doubts','Zweifel und Gegenargumente'],['sentencing','Strafzumessung, falls beantragt']]){editor(key,label);extra.append(fields.get(key).parentElement);}
  }
  const sources=el('details');sources.append(el('summary','Auf welche bekannten Quellen stützen Sie sich?'));form.append(sources);for(const doc of value.documents)check(sources,doc.id+' · '+doc.title,false,yes=>yes?refs.add(doc.id):refs.delete(doc.id));
  const save=el('button','Schritt prüfen und sichern');save.type='submit';form.append(save);
  form.onsubmit=async event=>{
   event.preventDefault();if(!isCurrent())return;error.textContent='';if([...fields.values()].some(x=>x.value.length>12000)){error.textContent='Bitte begrenzen Sie jedes Textfeld auf 12.000 Zeichen. Ihr Text bleibt zum Bearbeiten erhalten.';return;}
   const field=key=>fields.get(key)?.value??'',args={refs:[...refs].sort()};let operation=op;
   if(kind==='action'){args.question=field('reason');if(id==='A06'){operation=selection;args.delegated=true;}if(id==='A15')Object.assign(args,{scope:'limited',route,reason:field('reason')});if(id==='A18')args.purpose=field('reason');}
   else{
    args.reason=field('reason');if(['decision','indict','plea'].includes(op))args.counter=field('counter');
    if(op==='decision')Object.assign(args,{basis:id.split(':').at(-1),uncertainty:field('counter')});
    if(op==='indict')Object.assign(args,{act:field('fact'),delict});
    if(op==='plea'){Object.assign(args,{request,delict,days:Number(days.value)});for(const key of ['charge','findings','legal','doubts','sentencing'])args[key]=field(key);}
    if(['motion','reopenEvidence'].includes(op))Object.assign(args,{station,fact:field('fact'),link:field('link')});
    if(['comment','reply'].includes(op))args.text=field('reason');
    if(op==='savePlan'){if(!modules.size){error.textContent='Bitte wählen Sie mindestens ein Auflagenmodul.';return;}Object.assign(args,{months:Number(months.value),items:[...modules].sort().map(id=>id==='P03'?{id}:{id,amount:Number(amount.value)})});}
   }
   save.disabled=true;try{const result=await submit(operation,args,kind,()=>d.close());if(d.isConnected)error.textContent=result?.feedback?.text??'Bitte beachten Sie die Rückmeldung zum Schritt. Ihre Eingaben bleiben erhalten.';}finally{if(d.isConnected)save.disabled=false;}
  };
 });return d;
}
