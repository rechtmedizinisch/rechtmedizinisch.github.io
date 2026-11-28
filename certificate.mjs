import {PDFDocument,StandardFonts,rgb} from './assets/pdf-lib.mjs?v=20261111-guided-learning';
export function certificateName(value){const name=String(value??'').trim().replace(/\s+/gu,' ');if(!name||[...name].length>120)throw Error('Bitte geben Sie einen Namen mit 1 bis 120 Zeichen ein.');return name;}
export function requireCertificate(status){if(!status?.isComplete||status.totalCourses!==15||status.completedCourses!==15||status.totalUnits<=0||status.completedUnits!==status.totalUnits)throw Error('Das Zertifikat wird erst nach allen Pflichtschritten freigeschaltet.');}
// The browser rasterizes only the name so all characters supported by its fonts
// survive PDF export. The remaining certificate text remains selectable.
export async function buildCertificate({name,status,nameImage,date=new Date()}){
  requireCertificate(status);
  return buildDocument(name,nameImage,{
    title:'Kursabschluss-Zertifikat',
    lines:['alle 15 Kurse mit Pflichtmaterialien, Originalquellen und Wissensaufgaben','erfolgreich abgeschlossen hat.'],
    details:`ABSCHLUSS 100 % · ${status.completedUnits*10} XP · ${date.toLocaleDateString('de-DE')}`,
    filename:'Recht-Medizinisch-Zertifikat.pdf'
  });
}
function requireParcoursCertificate(progress){
  const date=progress?.certificateDate;
  if(progress?.total!==41 || !(date instanceof Date) || !Number.isFinite(+date))throw Error('Das Zertifikat ist nach Abschluss aller 41 Aufgaben verfügbar.');
  return date;
}
export async function buildParcoursCertificate({name,progress,nameImage}){
  const date=requireParcoursCertificate(progress);
  return buildDocument(name,nameImage,{
    title:'Parcours-Zertifikat',
    lines:['alle 41 Aufgaben des Parcours für Recht und Ethik','erfolgreich abgeschlossen hat.'],
    details:`ABSCHLUSS 100 % · ${date.toLocaleDateString('de-DE')}`,
    filename:'Recht-und-Ethik-Parcours-Zertifikat.pdf',
    addendum:{stats:progress.stats,date}
  });
}
async function buildDocument(name,nameImage,{title,lines,details,filename,addendum}){
  certificateName(name);if(!nameImage)throw Error('Der Name konnte nicht für das PDF vorbereitet werden.');
  const doc=await PDFDocument.create(),page=doc.addPage([842,595]);
  const regular=await doc.embedFont(StandardFonts.Helvetica),bold=await doc.embedFont(StandardFonts.HelveticaBold);
  const navy=rgb(.027,.114,.2),teal=rgb(.025,.43,.46),muted=rgb(.35,.40,.43);
  const background=target=>{
    target.drawRectangle({x:0,y:0,width:842,height:595,color:rgb(.965,.953,.918)});
    target.drawRectangle({x:24,y:24,width:794,height:547,borderWidth:5,borderColor:navy});
    target.drawRectangle({x:34,y:34,width:774,height:527,borderWidth:1,borderColor:navy});
    target.drawRectangle({x:0,y:580,width:842,height:15,color:rgb(.35,.84,.82)});
  };
  background(page);
  const center=(text,y,size,font=regular,color=navy)=>page.drawText(text,{x:(842-font.widthOfTextAtSize(text,size))/2,y,size,font,color});
  center('RECHT MEDIZINISCH · INTERAKTIVER LERNKURS',508,13,bold);
  center(title,427,36,bold);
  center('Hiermit wird bestätigt, dass',373,16);
  const image=await doc.embedPng(nameImage);page.drawImage(image,{x:100,y:295,width:642,height:65});
  page.drawLine({start:{x:180,y:284},end:{x:662,y:284},thickness:1,color:navy});
  lines.forEach((line,i)=>center(line,243-i*25,15));
  center(details,158,13,bold,teal);
  center('Nachweis über den Abschluss dieses Lernkurses;',84,11,regular,muted);
  center('keine CME-Anerkennung oder Berufsqualifikation.',68,11,regular,muted);
  if(addendum){
    center('Bearbeitungsstatistik auf Seite 2',50,9,regular,muted);
    const appendix=doc.addPage([842,595]);
    background(appendix);
    const fonts={regular,bold,navy,teal,muted};
    const events=Array.isArray(addendum.stats?.attempts)?addendum.stats.attempts.filter(event=>
      event && Object.hasOwn(attemptLabels,event.kind) && Number.isFinite(Date.parse(event.at))):[];
    const entriesPerPage=16;
    const extraPages=Math.ceil(events.length/entriesPerPage);
    const pageCount=2+extraPages;
    drawParcoursAddendum(appendix,image,fonts,addendum,pageCount);
    for(let index=0;index<extraPages;index++){
      const historyPage=doc.addPage([842,595]);
      background(historyPage);
      const start=index*entriesPerPage;
      drawParcoursHistory(historyPage,fonts,events.slice(start,start+entriesPerPage),
        index===0?addendum.stats.omittedAttempts:0,index+3,pageCount);
    }
  }
  doc.setTitle('Recht Medizinisch - '+title);doc.setAuthor('Recht Medizinisch');
  return {bytes:await doc.save(),filename};
}
const attemptLabels={completed:'Abgeschlossen',single:'Einzelaufgabe zurückgesetzt',restart:'Ganzer Parcours neu gestartet'};
const displayCount=value=>Number.isSafeInteger(value)&&value>=0?String(value):'Nicht erfasst';
const displayScore=entry=>Number.isSafeInteger(entry?.pass)&&Number.isSafeInteger(entry?.total)&&
    entry.pass>=0&&entry.total>0&&entry.pass<=entry.total?`${entry.pass} von ${entry.total}`:'Nicht erfasst';
function drawParcoursAddendum(page,image,{regular,bold,navy,teal,muted},{stats,date},pageCount){
  const line=(text,y,size=13,font=regular,color=navy,x=80)=>page.drawText(text,{x,y,size,font,color});
  const count=displayCount, first=displayScore;
  line('PARCOURS FÜR RECHT UND ETHIK',516,12,bold,teal);
  line('Bearbeitungsstatistik',470,32,bold);
  const last=new Date(stats?.completedAt??date);
  line((stats?'Letzter abgeschlossener Durchlauf · ':'Abschluss am ')+
    (Number.isFinite(+last)?last:date).toLocaleDateString('de-DE'),438,13,regular,muted);
  page.drawImage(image,{x:454,y:432,width:306,height:31});
  if(stats){
    const rows=[
      ['Fragen · beim ersten Versuch richtig',first(stats.first?.choice)],
      ['Zuordnungen · beim ersten Versuch richtig',first(stats.first?.pair)],
      ['Markierungen und Reihenfolgen · beim ersten Versuch richtig',first(stats.first?.practice)],
      ['Fehlversuche im Durchlauf',count(stats.wrong)],
      ['Davon nach richtiger Lösung',count(stats.reviewWrong)],
      ['Fehlversuche über alle Durchläufe',count(stats.totalWrong)],
      ['Einzelne Aufgaben zurückgesetzt · insgesamt',count(stats.single)],
      ['Ganze Neustarts · insgesamt',count(stats.all)],
    ];
    rows.forEach(([label,value],index)=>{
      const y=398-index*32;
      page.drawRectangle({x:76,y:y-10,width:690,height:31,color:index%2?rgb(.975,.973,.957):rgb(.914,.947,.931)});
      line(label,y);
      line(value,y,13,bold,navy,754-bold.widthOfTextAtSize(value,13));
    });
    if(stats.migrated>0) line(`Aus früherer Fassung übernommen: ${count(stats.migrated)} Aufgaben ohne erfasste Versuche.`,145,11,regular,muted);
    line(stats.snapshot?'Die Werte wurden beim Abschluss auf diesem Gerät festgehalten.':
      'Die Werte stammen aus dem beim Export vorliegenden lokalen Bearbeitungsstand.',122,11,regular,muted);
    line('Die Statistik ist lokal erfasst und wird nicht unabhängig geprüft.',104,11,regular,muted);
    if(pageCount>2)line('Frühere Bearbeitungsstände und Rücksetzungen finden Sie im Verlauf ab Seite 3.',82,11,regular,muted);
  }else{
    line('Für diesen Abschluss ist hier keine Bearbeitungsstatistik verfügbar.',394,15,bold);
    line('Das kann bei älteren Abschlüssen oder beim Download auf einem anderen Gerät vorkommen.',363,12,regular,muted);
  }
  line(`2 / ${pageCount}`,53,10,bold,muted,738);
}
function drawParcoursHistory(page,{regular,bold,navy,teal,muted},events,omitted,pageNumber,pageCount){
  const line=(text,x,y,size=11,font=regular,color=navy)=>page.drawText(text,{x,y,size,font,color});
  line('PARCOURS FÜR RECHT UND ETHIK',80,516,12,bold,teal);
  line('Verlauf der Bearbeitung',80,474,30,bold);
  line('Bei Rücksetzungen zeigt die Zeile den Stand unmittelbar davor.',80,444,12,regular,muted);
  if(omitted>0)line(`Ältere Ereignisse: ${displayCount(omitted)}. Ihre Zähler sind in den Gesamtwerten enthalten.`,80,424,11,regular,muted);
  const columns=[80,173,229,427,515,622,690];
  ['Datum','Durchlauf','Ereignis','Aufgaben','Erstversuche','Fehler','Nachlesen'].forEach((value,index)=>
    line(value,columns[index],394,10,bold,teal));
  events.forEach((event,index)=>{
    const y=373-index*18.7;
    if(index%2===0)page.drawRectangle({x:76,y:y-5,width:690,height:18.5,color:rgb(.914,.947,.931)});
    const values=[new Date(event.at).toLocaleDateString('de-DE'),displayCount(event.run),attemptLabels[event.kind],
      displayCount(event.done)+' / 41',displayScore(event),displayCount(event.wrong),displayCount(event.reviewWrong)];
    values.forEach((value,column)=>line(value,columns[column],y,10));
  });
  line('Detailereignisse werden seit Einführung der Zertifikatsstatistik aufgezeichnet.',80,53,11,regular,muted);
  line(`${pageNumber} / ${pageCount}`,738,53,10,bold,muted);
}
export async function downloadCertificate(name,status){
  name=certificateName(name);requireCertificate(status);
  return downloadPDF(await buildCertificate({name,status,nameImage:await certificateNameImage(name)}));
}
export async function downloadParcoursCertificate(name,progress,isCurrent=()=>true){
  name=certificateName(name);requireParcoursCertificate(progress);
  const file=await buildParcoursCertificate({name,progress,nameImage:await certificateNameImage(name)});
  if(isCurrent())downloadPDF(file);
}
async function certificateNameImage(name){
  const canvas=document.createElement('canvas');canvas.width=1926;canvas.height=195;
  const ctx=canvas.getContext('2d');if(!ctx)throw Error('Die PDF-Erstellung wird von diesem Browser nicht unterstützt.');
  ctx.fillStyle='#772d41';ctx.textAlign='center';ctx.textBaseline='middle';
  let size=87;ctx.font=`600 ${size}px Georgia, serif`;
  while(ctx.measureText(name).width>1870&&size>18){size--;ctx.font=`600 ${size}px Georgia, serif`;}
  ctx.fillText(name,963,97.5,1870);
  const image=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!image)throw Error('Namensdarstellung fehlgeschlagen.');
  return new Uint8Array(await image.arrayBuffer());
}
function downloadPDF(file){
  const url=URL.createObjectURL(new Blob([file.bytes],{type:'application/pdf'}));
  const a=document.createElement('a');a.href=url;a.download=file.filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);
}
