import {hasAccess} from './policy.mjs?v=20261111-guided-learning';

const scope = 'practice';
const contentId = 'practice:mtr-rechercheparcours-v1';
const materialHash = '58c2a1c054fb8b24e99ace57b5f514bcc3aeb5fae132789bf66e658e063b923a';
export const mtrBasics = '#material/atlas%3Atopic-mtr-recht-ethik';
let stopPlayer;

function node(tag, text, className) {
  const element = document.createElement(tag);
  if (text) element.textContent = text;
  if (className) element.className = className;
  return element;
}
function link(text, href) {
  const element = node('a', text, 'button secondary');
  element.href = href;
  return element;
}
export function mtrEntry(grants) {
  const card = node('section', null, 'card');
  card.append(node('h2', 'Rechercheparcours für MTR'));
  card.append(node('p', 'Recht und Ethik in 8 Etappen. 41 Fallentscheidungen, Quellenaufgaben und Quizstationen mit direkter Rückmeldung.'));
  card.append(link(hasAccess(scope, grants) ? 'Parcours öffnen' : 'Parcours · Premium', '#mtr'), link('Kostenlose MTR-Grundlagen', mtrBasics));
  return card;
}
function safeJSON(text) {
  return text.replace(/</g, '\\u003c');
}
async function checkedMaterial(payload) {
  if (payload?.schemaVersion !== 1 || payload.sha256 !== materialHash ||
      typeof payload.material !== 'string' || payload.material.length > 200_000) throw Error();
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload.material));
  if (Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('') !== materialHash) throw Error();
  return payload.material;
}
export function closeMTR() {
  stopPlayer?.();
  stopPlayer = undefined;
}
export async function renderMTR(main, auth, grants, user, isCurrent) {
  const owner = user?.id;
  main.append(link('Zurück zu Üben', '#practice'), node('h1', 'Rechercheparcours für MTR'));
  if (!owner || !auth || !hasAccess(scope, grants)) {
    main.append(node('p', 'Der vollständige Parcours ist mit Premium verfügbar. Die Grundlagen zu Berufszuständigkeit, Einwilligung und Strahlenschutz sind frei zugänglich.', 'notice'));
    main.append(link(owner ? 'Zugänge ansehen' : 'Anmelden & Code einlösen', owner ? '#shop' : '#account'), link('MTR-Grundlagen lesen', mtrBasics));
    return;
  }
  const message = node('p', 'Parcours wird geladen …', 'status');
  message.role = 'status';
  main.append(message);
  try {
    const [payload, template] = await Promise.all([
      auth.getCourse(contentId),
      fetch('./mtr-engine.html?v=20261125').then(response => {
        if (!response.ok) throw Error();
        return response.text();
      }),
    ]);
    const material = await checkedMaterial(payload);
    if (!isCurrent()) return;
    const key = 'rm.mtr-parcours.v1.' + owner;
    let saved = 'null';
    try {
      const value = localStorage.getItem(key);
      if (value && value.length <= 100_000) saved = JSON.stringify(JSON.parse(value));
    } catch { message.textContent = 'Der bisherige Parcoursstand ist in diesem Browser nicht verfügbar.'; }
    const player = node('iframe');
    player.title = 'Interaktiver Rechercheparcours für MTR';
    player.sandbox = 'allow-scripts allow-popups allow-popups-to-escape-sandbox';
    player.style.cssText = 'display:block;width:100%;height:80dvh;min-height:26rem;border:1px solid #9aada6;border-radius:1rem;margin-block:1rem';
    const save = event => {
      if (!isCurrent() || event.source !== player.contentWindow || event.origin !== 'null' ||
          event.data?.channel !== 'rm-mtr' || event.data.action !== 'save') return;
      const value = event.data.value;
      if (typeof value !== 'string' || value.length > 100_000) return;
      try { localStorage.setItem(key, value); }
      catch {
        message.hidden = false;
        message.textContent = 'Dieser Browser kann den aktuellen Parcoursstand nicht speichern.';
      }
    };
    window.addEventListener('message', save);
    stopPlayer = () => {
      window.removeEventListener('message', save);
      player.remove();
    };
    player.srcdoc = template.replace('RM_MTR_STATE_JSON', () => safeJSON(saved))
      .replace('RM_MTR_MATERIAL_JSON', () => safeJSON(material));
    message.hidden = true;
    main.append(player);
  } catch {
    if (isCurrent()) message.textContent = 'Der Parcours ist gerade nicht erreichbar. Bitte laden Sie die Seite erneut oder prüfen Sie Ihren Zugang.';
  }
}
