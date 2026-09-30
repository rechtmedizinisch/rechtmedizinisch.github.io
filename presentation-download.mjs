export async function preparePresentationDownload(auth) {
  const asset = await auth.getCourse('asset-v3:slides:presentation-pptx');
  if (!asset) throw new Error('Für diesen Download ist ein aktiver Folienzugang erforderlich.');
  if (asset.mime !== 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      || !/^[A-Za-z0-9_-]+\.pptx$/.test(asset.path)
      || !/^[A-Za-z0-9_-]+\.pptx$/.test(asset.filename)) {
    throw new Error('Die Präsentation ist derzeit nicht verfügbar.');
  }
  // Metadata and Storage independently enforce the current server-side entitlement.
  return {url: await auth.getGraphic(asset.path,asset.filename), filename: asset.filename};
}

export async function fetchPresentationDownload(auth,fetcher=fetch){
  const file=await preparePresentationDownload(auth);
  const response=await fetcher(file.url,{cache:'no-store'});
  if(!response.ok)throw Error('Die Präsentation konnte nicht heruntergeladen werden. Bitte bereiten Sie den Download erneut vor.');
  const blob=await response.blob();
  const signature=new Uint8Array(await blob.slice(0,4).arrayBuffer());
  if(blob.size<100||signature[0]!==0x50||signature[1]!==0x4b||signature[2]!==3||signature[3]!==4)throw Error('Die gelieferte Datei ist keine gültige PowerPoint-Präsentation. Bitte versuchen Sie es erneut.');
  return {filename:file.filename,blob};
}
