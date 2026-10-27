// A station is navigation context, never an access grant or content identifier.
export function atlasDestination(raw){
 const [id,query='']=String(raw??'').split('?',2),params=new URLSearchParams(query);
 const value=params.get('stage')??'',number=/^[1-9]\d?$/.test(value)?Number(value):null;
 const from=params.get('from');
 return {id,focusedStage:(id.startsWith('atlas:')||/^podcast:Podcast(Emergency|Defensive|Adults|Children)$/.test(id))?number:null,
  from:/^(?:atlas:(?:case|topic|schema|procedure|term|review)-[a-z0-9-]+|presentation-index)$/.test(from??'')?from:null};
}
export function slideDestination(id,from=null){
 const origin=atlasDestination('slides:1?from='+encodeURIComponent(from??'')).from;
 return '#material/'+encodeURIComponent(id+(origin?'?from='+origin:''));
}
export function focusedAtlasNode(content,stage){
 return content.diagramAsset && Number.isInteger(stage) && stage>0 ? content.overview?.[stage-1]??null:null;
}
export function schemaDestination(link,from){
 return '#material/'+encodeURIComponent((link.targetKind==='podcast'?'podcast:':'atlas:')+link.targetId+'?stage='+link.stage+'&from=atlas:'+from);
}
export function focusedPodcastNode(content,stage){
 if(!Number.isInteger(stage)||stage<1||content.stageTitles?.length!==content.points?.length)return null;
 return content.stageTitles?.[stage-1]?{title:content.stageTitles[stage-1],body:content.points[stage-1]}:null;
}
export function atlasReadingLabel(item){
 const minutes=item.estimatedReadingMinutes;
 return item.coreOrOptional==='optional'&&Number.isInteger(minutes)&&minutes>0 ? `Optional · Lesezeit ca. ${minutes} Min.`:null;
}
export function materialReadingKey(kind,id,stage,from){
 const base=kind+':'+id;
 return Number.isInteger(stage)&&stage>0?base+':focus:'+stage+':from:'+(from??'direct'):base;
}
