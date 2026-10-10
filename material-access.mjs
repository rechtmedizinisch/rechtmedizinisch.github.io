import {hasAccess} from './policy.mjs?v=20260930ao';

export function isGraphic(entry) {
  return ['podcast','system'].includes(entry?.group);
}

export function materialScope(entry) {
  if (entry?.group === 'slides') return 'slides';
  return isGraphic(entry) ? 'diagrams' : 'knowledge';
}

// Individual purchases never widen access to another graphic or a whole group.
export function hasMaterialAccess(entry, grants, at = Date.now()) {
  return !!entry && (entry.free === true ||
    hasAccess(materialScope(entry), grants, at) ||
    (isGraphic(entry) && hasAccess('diagram:'+entry.id, grants, at)));
}
