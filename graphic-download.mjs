const imageTypes = {'image/png':'png','image/jpeg':'jpg','image/webp':'webp'};

export async function fetchGraphicDownload(auth,scope,name,publicURL=null,fetcher=fetch) {
  if (!/^[A-Za-z0-9_-]+$/.test(name)) throw Error('Die Grafik ist derzeit nicht verfügbar.');
  let url=publicURL, filename=name+'.png', mime;
  if (!url) {
    // Recheck metadata and Storage at download time, not just on page entry.
    const asset=await auth?.getCourse('asset-v3:'+scope+':'+name);
    if (!asset) throw Error('Bitte prüfen Sie Ihren Zugang und melden Sie sich gegebenenfalls erneut an.');
    mime=asset.mime;
    if (!imageTypes[mime] || !/^[A-Za-z0-9_-]+\.(png|jpg|jpeg|webp)$/.test(asset.path))
      throw Error('Die Grafik ist derzeit nicht verfügbar.');
    filename=name+'.'+imageTypes[mime];
    url=await auth.getGraphic(asset.path,filename);
  }
  const response=await fetcher(url,{cache:'no-store'});
  if (!response.ok) throw Error('Download nicht verfügbar. Bitte Zugang prüfen und erneut versuchen.');
  const blob=await response.blob();
  if (!imageTypes[blob.type] || (mime && blob.type!==mime) || blob.size<32 || blob.size>40000000)
    throw Error('Die gelieferte Datei ist keine unterstützte Grafik.');
  const header=new Uint8Array(await blob.slice(0,12).arrayBuffer());
  const valid=blob.type==='image/png' ? [137,80,78,71,13,10,26,10].every((v,i)=>header[i]===v)
    : blob.type==='image/jpeg' ? header[0]===255&&header[1]===216&&header[2]===255
    : String.fromCharCode(...header.slice(0,4))==='RIFF'&&String.fromCharCode(...header.slice(8,12))==='WEBP';
  if (!valid) throw Error('Die Grafik konnte nicht korrekt geladen werden. Bitte erneut versuchen.');
  return {blob,filename:name+'.'+imageTypes[blob.type]};
}
