import {hasAccess} from './policy.mjs?v=20261027-update51b';

export function isGraphic(entry) {
  return ['podcast','system'].includes(entry?.group) || (entry?.group==='atlas' && entry.graphic===true);
}

export function materialScope(entry) {
  if(entry?.group==='atlas')return /^(?:diagrams|knowledge|course:0[1-9]|course:1[0-5])$/.test(entry.scope)?entry.scope:'unknown';
  if (entry?.group === 'slides') return 'slides';
  return isGraphic(entry) ? 'diagrams' : ['glossary','career','professions','special'].includes(entry?.group) ? 'knowledge' : 'unknown';
}

// Individual purchases never widen access to another graphic or a whole group.
export function hasMaterialAccess(entry, grants, at = Date.now()) {
  return !!entry && materialScope(entry)!=='unknown' && (entry.free === true ||
    hasAccess(materialScope(entry), grants, at) ||
    (isGraphic(entry) && hasAccess('diagram:'+entry.id, grants, at)));
}
