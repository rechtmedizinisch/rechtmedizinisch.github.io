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
function parseRun(saved) {
  try { return typeof saved === 'string' && saved.length <= 100_000 ? JSON.parse(saved) : null; }
  catch { return null; }
}
export function parcoursProgress(saved) {
  const record = parseRun(saved);
  const done = Array.isArray(record?.done) ? record.done : [];
  const completed = new Set(done.filter(id => taskIds.has(id))).size;
  const active = completed === taskIds.size ? completionDate(record.finishedAt) : null;
  const history = Array.isArray(record?.done) ? record.history : null;
  return {completed, total:taskIds.size, certificateDate:completionDate(history?.firstCompletedAt) ??
    completionDate(history?.certificateStats?.completedAt) ?? active ?? completionDate(history?.lastCompletedAt)};
}

export function parcoursCertificateStats(saved, date) {
  if (!date) return null;
  const run = parseRun(saved);
  const history = run?.history;
  if (history?.certificateStats && [history.firstCompletedAt,history.certificateStats.completedAt].includes(date.toISOString())) {
    const latest = history.latestCertificateStats;
    const stats = completionDate(latest?.completedAt) ? latest : history.certificateStats;
    return {
      ...stats, snapshot:stats.capturedAtCompletion !== false,
      totalWrong:history.wrong??stats.totalWrong,single:history.single??stats.single,all:history.all??stats.all,
      attempts:Array.isArray(history.attempts)?history.attempts.slice(-120):[], omittedAttempts:history.omittedAttempts??0
    };
  }
  // An older certificate can use the active run only while its completion still matches.
  if (run?.finishedAt !== date.toISOString() || parcoursProgress(saved).completed !== taskIds.size ||
      !run.first || !run.history) return null;
  const first = {choice:{pass:0,total:0},pair:{pass:0,total:0},practice:{pass:0,total:0}};
  for (const entry of Object.values(run.first)) {
    if (!Object.hasOwn(first, entry?.group) || typeof entry.pass !== 'boolean') continue;
    first[entry.group].total++;
    if (entry.pass) first[entry.group].pass++;
  }
  return {
    completedAt:run.finishedAt,first, wrong:run.wrong, reviewWrong:run.reviewWrong, totalWrong:history.wrong,
    single:history.single, all:history.all, migrated:run.migrated??0, snapshot:false,
    attempts:Array.isArray(history.attempts)?history.attempts.slice(-120):[], omittedAttempts:history.omittedAttempts??0
  };
}

export function parcoursCompletionClaim(saved) {
  const date = parcoursProgress(saved).certificateDate;
  return date ? {completed_at: date.toISOString(), task_ids: [...taskIds]} : null;
}
function readLocal(owner) {
  try { return localStorage.getItem(storageKey(owner)); }
  catch { return null; }
}
export function localParcoursProgress(owner) {
  return parcoursProgress(owner ? readLocal(owner) : null);
}
async function accountProgress(auth, user) {
  const saved = readLocal(user.id);
  const result = await auth.parcoursCertificate(user.id, parcoursCompletionClaim(saved));
  const certificateDate = completionDate(result?.completed_at);
  return {...parcoursProgress(saved), certificateDate, stats:parcoursCertificateStats(saved, certificateDate)};
}
async function downloadAccountCertificate(user, progress, isCurrent) {
  const name = parcoursAccountName(user);
  if (!name) throw Error('In Ihrem Konto ist kein Name und keine E-Mail-Adresse hinterlegt.');
  const {downloadParcoursCertificate} = await import('./certificate.mjs?v=20261128-parcours-statistics');
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
  const progress = localParcoursProgress(user.id);
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
  main.append(link('Parcours verlassen', '#practice'), node('h1', 'Parcours für Recht und Ethik'));
  if (!owner || !auth || !hasAccess(scope, grants)) {
    main.append(node('p', 'Der vollständige Parcours ist mit Premium verfügbar. Die Grundlagen zu Berufszuständigkeit, Einwilligung und Strahlenschutz sind frei zugänglich.', 'notice'));
    main.append(link(owner ? 'Zugänge ansehen' : 'Anmelden & Code einlösen', owner ? '#shop' : '#account'), link('MTR-Grundlagen lesen', mtrBasics));
    return;
  }
  const message = node('p', 'Parcours wird geladen …', 'status');
  const sameSession = activeSession(auth);
  message.role = 'status';
  message.hidden = true;
  main.append(message);
  const loading = setTimeout(() => { if (isCurrent()) message.hidden = false; }, 250);
  try {
    const [payload, template, registered] = await Promise.all([
      auth.getCourse(contentId),
      fetch('./mtr-engine.html?v=20261128-parcours-statistics').then(response => {
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
    player.setAttribute('data-parcours-player', '');
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
      if (action === 'exit' && value === '') {
        location.hash = '#practice';
      } else if (action === 'escape-focus' && value === '') {
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
          const progress = await accountProgress(auth, user);
          if (!isActive()) return;
          await downloadAccountCertificate(user, progress, isActive);
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
    if (isCurrent()) {
      message.hidden = false;
      message.textContent = 'Der Parcours ist gerade nicht erreichbar. Bitte laden Sie die Seite erneut oder prüfen Sie Ihren Zugang.';
    }
  } finally {
    clearTimeout(loading);
  }
}
