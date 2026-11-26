import {hasAccess} from './policy.mjs?v=20261111-guided-learning';

const scope = 'all';
const contentId = 'practice:mtr-rechercheparcours-v1';
const materialHash = '58c2a1c054fb8b24e99ace57b5f514bcc3aeb5fae132789bf66e658e063b923a';
export const mtrBasics = '#material/atlas%3Atopic-mtr-recht-ethik';
let stopPlayer;
const taskIds = new Set([...Array.from({length:32}, (_, i) => i + 1), ...Array.from({length:9}, (_, i) => i + 101)]);
const storageKey = owner => 'rm.mtr-parcours.v1.' + owner;

export function parcoursAccountName(user) {
  if (!user?.id) return null;
  for (const value of [user.user_metadata?.full_name, user.user_metadata?.name, user.email]) {
    if (typeof value !== 'string') continue;
    const name = value.trim().replace(/\s+/gu, ' ');
    if (name && [...name].length <= 120) return name;
  }
  return null;
}
function completionDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) return null;
  const date = new Date(value);
  return Number.isFinite(+date) && date.toISOString() === value ? date : null;
}
export function parcoursProgress(saved) {
  let record;
  try { if (typeof saved === 'string' && saved.length <= 100_000) record = JSON.parse(saved); }
  catch {}
  const done = Array.isArray(record?.done) ? record.done : [];
  const completed = new Set(done.filter(id => taskIds.has(id))).size;
  const active = completed === taskIds.size ? completionDate(record.finishedAt) : null;
  return {completed, total:taskIds.size, certificateDate:active ?? (Array.isArray(record?.done) ? completionDate(record.history?.lastCompletedAt) : null)};
}

export function parcoursCompletionClaim(saved) {
  const date = parcoursProgress(saved).certificateDate;
  return date ? {completed_at: date.toISOString(), task_ids: [...taskIds]} : null;
}
function readLocal(owner) {
  try { return localStorage.getItem(storageKey(owner)); }
  catch { return null; }
}
async function accountProgress(auth, user) {
  const saved = readLocal(user.id);
  const result = await auth.parcoursCertificate(user.id, parcoursCompletionClaim(saved));
  return {...parcoursProgress(saved), certificateDate: completionDate(result?.completed_at)};
}
async function downloadAccountCertificate(user, progress, isCurrent) {
  const name = parcoursAccountName(user);
  if (!name) throw Error('In Ihrem Konto ist kein Name und keine E-Mail-Adresse hinterlegt.');
  const {downloadParcoursCertificate} = await import('./certificate.mjs?v=20261126-parcours-account');
  return downloadParcoursCertificate(name, progress, isCurrent);
}
function activeSession(auth) {
  const guard = auth.progressSessionGuard;
  const lease = guard?.capture();
  return () => !guard || guard.isCurrent(lease);
}

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
export function parcoursProgressCard(user, auth, grants) {
  const card = node('section', null, 'card');
  const entry = link('', '#mtr');
  entry.className = 'parcours-progress-entry';
  entry.append(node('h2', 'Parcours für Recht und Ethik'));
  card.append(entry);
  if (!user || !auth || !hasAccess(scope, grants)) {
    entry.append(node('p', 'Der Parcours und das Zertifikat gehören zum Premiumzugang.'));
    return card;
  }
  const progress = parcoursProgress(readLocal(user.id));
  const meter = node('progress');
  meter.max = progress.total;
  meter.value = progress.completed;
  meter.setAttribute('aria-label', 'Parcoursfortschritt');
  entry.append(node('p', `${progress.completed} von ${progress.total} Aufgaben abgeschlossen`), meter);
  const download = node('button', 'Parcours-Zertifikat als PDF herunterladen');
  download.type = 'button';
  download.hidden = true;
  const condition = 'Zertifikat nach allen 41 Aufgaben';
  const status = node('p', condition, 'subtle');
  status.role = 'status';
  const sameSession = activeSession(auth);
  const isCurrent = () => sameSession() && card.isConnected && hasAccess(scope, grants);
  const check = async () => {
    const current = await accountProgress(auth, user);
    if (!isCurrent()) return null;
    download.hidden = !current.certificateDate;
    status.textContent = current.certificateDate ? 'Im Konto verfügbar' : condition;
    return current;
  };
  check().catch(() => {
    if (!isCurrent()) return;
    download.hidden = !progress.certificateDate;
    status.textContent = 'Der Zertifikatsstatus konnte gerade nicht abgerufen werden.';
  });
  download.onclick = async () => {
    download.disabled = true;
    try {
      const current = await check();
      if (!current) return;
      await downloadAccountCertificate(user, current, isCurrent);
      if (isCurrent()) status.textContent = 'PDF erstellt.';
    } catch (error) {
      if (isCurrent()) status.textContent = error.message || 'PDF konnte nicht erstellt werden.';
    } finally { download.disabled = false; }
  };
  card.append(status, download);
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
  main.append(link('Zurück zu Üben', '#practice'), node('h1', 'Parcours für Recht und Ethik'));
  if (!owner || !auth || !hasAccess(scope, grants)) {
    main.append(node('p', 'Der vollständige Parcours ist mit Premium verfügbar. Die Grundlagen zu Berufszuständigkeit, Einwilligung und Strahlenschutz sind frei zugänglich.', 'notice'));
    main.append(link(owner ? 'Zugänge ansehen' : 'Anmelden & Code einlösen', owner ? '#shop' : '#account'), link('MTR-Grundlagen lesen', mtrBasics));
    return;
  }
  const message = node('p', 'Parcours wird geladen …', 'status');
  const sameSession = activeSession(auth);
  message.role = 'status';
  main.append(message);
  try {
    const [payload, template, registered] = await Promise.all([
      auth.getCourse(contentId),
      fetch('./mtr-engine.html?v=20261126-parcours-account').then(response => {
        if (!response.ok) throw Error();
        return response.text();
      }),
      accountProgress(auth, user).catch(() => null),
    ]);
    const material = await checkedMaterial(payload);
    if (!sameSession() || !isCurrent()) return;
    const key = storageKey(owner);
    let saved = 'null';
    try {
      const value = localStorage.getItem(key);
      if (value && value.length <= 100_000) saved = JSON.stringify(JSON.parse(value));
    } catch { message.textContent = 'Der bisherige Parcoursstand ist in diesem Browser nicht verfügbar.'; }
    const player = node('iframe');
    player.title = 'Interaktiver Parcours für Recht und Ethik';
    player.sandbox = 'allow-scripts allow-popups allow-popups-to-escape-sandbox';
    player.style.cssText = 'display:block;width:100%;height:80dvh;min-height:26rem;border:1px solid #9aada6;border-radius:1rem;margin-block:1rem';
    let certificatePending = false;
    let registeredDate = registered?.certificateDate;
    let registration;
    const registerCompletion = () => {
      if (registeredDate) return Promise.resolve(registeredDate);
      registration ??= accountProgress(auth, user).then(result => (registeredDate = result.certificateDate))
        .finally(() => { registration = null; });
      return registration;
    };
    const isActive = () => sameSession() && isCurrent() && player.isConnected && hasAccess(scope, grants);
    const receive = async event => {
      if (!isActive() || event.source !== player.contentWindow || event.origin !== 'null' ||
          event.data?.channel !== 'rm-mtr') return;
      const {action,value} = event.data;
      if (typeof value !== 'string') return;
      if (action === 'escape-focus' && value === '') {
        document.dispatchEvent(new Event('rm-parcours-escape'));
      } else if (action === 'save' && value.length <= 100_000) {
        try {
          localStorage.setItem(key, value);
          if (!registeredDate && parcoursCompletionClaim(value)) registerCompletion().catch(() => {});
        }
        catch {
          message.hidden = false;
          message.textContent = 'Dieser Browser kann den aktuellen Parcoursstand nicht speichern.';
        }
      } else if (action === 'certificate' && value === '' && !certificatePending) {
        certificatePending = true;
        try {
          const {certificateDate} = await accountProgress(auth, user);
          if (!isActive()) return;
          await downloadAccountCertificate(user, {total: taskIds.size, certificateDate}, isActive);
        } catch (error) {
          if (!isActive()) return;
          message.hidden = false;
          message.textContent = error.message || 'Das PDF konnte nicht erstellt werden.';
          message.tabIndex = -1;
          message.focus();
        } finally { certificatePending = false; }
      }
    };
    window.addEventListener('message', receive);
    stopPlayer = () => {
      window.removeEventListener('message', receive);
      player.remove();
    };
    player.srcdoc = template.replace('RM_MTR_STATE_JSON', () => safeJSON(saved))
      .replace('RM_MTR_CERTIFIED_JSON', String(Boolean(registeredDate)))
      .replace('RM_MTR_MATERIAL_JSON', () => safeJSON(material))
      .replace('</body>', "<script>document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!event.defaultPrevented&&!document.querySelector('dialog[open]'))window.parent.postMessage({channel:'rm-mtr',action:'escape-focus',value:''},'*');});</script></body>");
    message.hidden = true;
    main.append(player);
  } catch {
    if (isCurrent()) message.textContent = 'Der Parcours ist gerade nicht erreichbar. Bitte laden Sie die Seite erneut oder prüfen Sie Ihren Zugang.';
  }
}
