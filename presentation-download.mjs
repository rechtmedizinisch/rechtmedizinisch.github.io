export async function preparePresentationDownload(auth) {
  const asset = await auth.getCourse('asset-v3:slides:presentation-pptx');
  if (!asset) throw new Error('Für diesen Download ist ein aktiver Folienzugang erforderlich.');
  if (asset.mime !== 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      || !/^[A-Za-z0-9_-]+\.pptx$/.test(asset.path)
      || !/^[A-Za-z0-9_-]+\.pptx$/.test(asset.filename)) {
    throw new Error('Die Präsentation ist derzeit nicht verfügbar.');
  }
  // Metadata and Storage independently enforce the current server-side entitlement.
  return {url: await auth.getGraphic(asset.path), filename: asset.filename};
}
