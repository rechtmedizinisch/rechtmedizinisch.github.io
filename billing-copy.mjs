/** Display copy only. Purchase scopes and provider prices remain unchanged. */
export function offerDescription(offer, counts = {}) {
  if (offer.interval) {
    const base = Number(counts.baseSlides), extra = Number(counts.additionalMaterials);
    const materials = Number.isInteger(base) && base > 0 && Number.isInteger(extra) && extra > 0
      ? `${base} Basisfolien und ${extra} Fälle, Schemata & Vertiefungen`
      : 'alle Basisfolien, Fälle, Schemata & Vertiefungen';
    return `Alle 15 Kurse, ${materials}. Dazu alle Schaubilder, Übungsrunden mit Timer und Fehlertraining sowie die vollständigen Specials „PJ & Berufsstart“ und „Rettungsmedizin“ während der Laufzeit. Automatische Verlängerung; im Kundenportal kündbar.`;
  }
  if (offer.key === 'course-edition') return '15 Kurse samt zugeordneten Lerntexten, Fallvertiefungen und Kurs-Wissenschecks dauerhaft. Kein Abo. Die gesamte Folienbibliothek, gesonderte Schaubilder, zusätzliche Übungsrunden und vollständige Specials sind nicht enthalten.';
  return 'Dauerhafter Zugriff und Download ausschließlich für dieses Schaubild.';
}
