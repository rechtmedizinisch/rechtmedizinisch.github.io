import {PDFDocument,StandardFonts,rgb} from './assets/pdf-lib.mjs?v=20260930aa';
export function certificateName(value){const name=String(value??'').trim().replace(/\s+/gu,' ');if(!name||[...name].length>120)throw Error('Bitte geben Sie einen Namen mit 1 bis 120 Zeichen ein.');return name;}
export function requireCertificate(status){if(!status?.isComplete||status.totalCourses!==15||status.completedCourses!==15||status.totalUnits<=0||status.completedUnits!==status.totalUnits)throw Error('Das Zertifikat wird erst nach allen Pflichtschritten freigeschaltet.');}
// The browser rasterizes only the name so all characters supported by its fonts
// survive PDF export. The remaining certificate text remains selectable.
export async function buildCertificate({name,status,nameImage,date=new Date()}){
  requireCertificate(status);name=certificateName(name);if(!nameImage)throw Error('Der Name konnte nicht für das PDF vorbereitet werden.');
  const doc=await PDFDocument.create(),page=doc.addPage([842,595]);
  const regular=await doc.embedFont(StandardFonts.Helvetica),bold=await doc.embedFont(StandardFonts.HelveticaBold);
  const navy=rgb(.027,.114,.2),teal=rgb(.025,.43,.46),muted=rgb(.35,.40,.43);
  page.drawRectangle({x:0,y:0,width:842,height:595,color:rgb(.965,.953,.918)});
  page.drawRectangle({x:24,y:24,width:794,height:547,borderWidth:5,borderColor:navy});
  page.drawRectangle({x:34,y:34,width:774,height:527,borderWidth:1,borderColor:navy});
  page.drawRectangle({x:0,y:580,width:842,height:15,color:rgb(.35,.84,.82)});
  const center=(text,y,size,font=regular,color=navy)=>page.drawText(text,{x:(842-font.widthOfTextAtSize(text,size))/2,y,size,font,color});
  center('RECHT MEDIZINISCH · INTERAKTIVER LERNKURS',508,13,bold);
  center('Medizinrecht-Zertifikat',427,36,bold);
  center('Hiermit wird bestätigt, dass',373,16);
  const image=await doc.embedPng(nameImage);page.drawImage(image,{x:100,y:295,width:642,height:65});
  page.drawLine({start:{x:180,y:284},end:{x:662,y:284},thickness:1,color:navy});
  center('alle 15 Kurse mit Pflichtmaterialien, Originalquellen und Wissensaufgaben',243,15);
  center('erfolgreich abgeschlossen hat.',218,15);
  center(`ABSCHLUSS 100 % · ${status.completedUnits*10} XP · ${date.toLocaleDateString('de-DE')}`,158,13,bold,teal);
  center('Digitaler Lernnachweis der Lernplattform;',84,11,regular,muted);
  center('keine staatliche Prüfungs- oder Berufsqualifikationsbescheinigung.',68,11,regular,muted);
  doc.setTitle('Medizinrecht-Zertifikat');doc.setAuthor('Recht Medizinisch');
  return {bytes:await doc.save(),filename:'Recht-Medizinisch-Zertifikat.pdf'};
}
export async function downloadCertificate(name,status){
  name=certificateName(name);requireCertificate(status);
  const canvas=document.createElement('canvas');canvas.width=1926;canvas.height=195;
  const ctx=canvas.getContext('2d');if(!ctx)throw Error('Die PDF-Erstellung wird von diesem Browser nicht unterstützt.');
  ctx.fillStyle='#772d41';ctx.textAlign='center';ctx.textBaseline='middle';
  let size=87;ctx.font=`600 ${size}px Georgia, serif`;
  while(ctx.measureText(name).width>1870&&size>18){size--;ctx.font=`600 ${size}px Georgia, serif`;}
  ctx.fillText(name,963,97.5,1870);
  const image=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!image)throw Error('Namensdarstellung fehlgeschlagen.');
  const file=await buildCertificate({name,status,nameImage:new Uint8Array(await image.arrayBuffer())});
  const url=URL.createObjectURL(new Blob([file.bytes],{type:'application/pdf'}));
  const a=document.createElement('a');a.href=url;a.download=file.filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);
}
