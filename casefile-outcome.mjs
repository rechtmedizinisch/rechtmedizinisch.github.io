// An outcome is a read-only summary of the engine's saved terminal state.
// Opening a draft or a provisional § 153a plan never completes a case.
export function casefileOutcome(v){
 if(!v?.ended||!['closed','judgment'].includes(v.phase))return null;
 const j=v.judgment,d=v.decision,details=[];
 let kind,title,summary;
 if(v.phase==='judgment'&&j){
  kind=j.kind==='acquittal'?'acquittal':'conviction';
  title=kind==='acquittal'?'Freispruch':j.title||'Gerichtliche Verurteilung';
  summary=j.reason||'Das Gericht hat nach Beratung seine Entscheidung verkündet.';
  if(j.example)details.push(j.example);
  details.push('Die Entscheidung beruht auf dem in der Hauptverhandlung erhobenen Beweisstoff. Der Antrag der Staatsanwaltschaft bindet das Gericht nicht.');
 }else{
  const basis=d?.basis??'';
  kind=basis==='204'?'nonopening':'dismissal';
  title=basis==='204'?'Nichteröffnung des Hauptverfahrens':basis==='170II'?'Einstellung nach § 170 Abs. 2 StPO':basis.startsWith('153a')?'Einstellung nach erfüllten Auflagen (§ 153a StPO)':basis.startsWith('153')?'Einstellung wegen Geringfügigkeit (§ 153 StPO)':d?.kind||'Verfahren abgeschlossen';
  summary=d?.reason||'Die gesicherte Verfahrensentscheidung beendet diesen Fallweg.';
  if(basis==='170II')details.push('Kein hinreichender Tatverdacht für eine Anklage. Die Einstellung ist kein Freispruch und enthält keinen Schuldspruch.');
  else if(basis==='204')details.push('Das Gericht eröffnet das Hauptverfahren nicht. Dies ist kein Freispruch nach einer Hauptverhandlung.');
  else if(basis.startsWith('153a')){
   for(const item of v.conditions?.items??[]){
    const amount=item.amount==null?'':String(item.amount)+' €';
    details.push(item.id==='P03'?'Das bezeichnete Ausgleichsbemühen und die Wiedergutmachung beziehungsweise deren Erstreben sind im Lernfall nachgewiesen.':[amount,item.recipient?'an '+item.recipient:'',item.done?'· Erfüllung nachgewiesen':''].filter(Boolean).join(' '));
   }
   details.push('Die gesetzlichen Voraussetzungen und erforderlichen Zustimmungen sind im Lernfall behandelt. Nach erfüllten Auflagen gilt die gesetzliche beschränkte Verfolgungssperre. Keine Geldstrafe und kein Schuldspruch.');
  }else if(basis.startsWith('153'))details.push('Ohne Auflagen oder Schuldspruch. Die erforderliche Zustimmung ist im Lernfall dokumentiert.');
 }
 return {kind,title,summary,details,completed:true,percent:100};
}
