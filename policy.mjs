export function hasAccess(scope,grants,at=Date.now()) {return grants.some(g=>!g.revoked_at && [scope,'all'].includes(g.scope) && Date.parse(g.starts_at)<=at && Date.parse(g.expires_at)>at);}
export function accessFingerprint(grants,at=Date.now()) {return JSON.stringify([...new Set(grants.filter(g=>!g.revoked_at&&Date.parse(g.starts_at)<=at&&Date.parse(g.expires_at)>at).map(g=>g.scope))].sort());}
export function nextAccessChange(grants,at=Date.now()) {return Math.min(...grants.filter(g=>!g.revoked_at).flatMap(g=>[Date.parse(g.starts_at),Date.parse(g.expires_at)]).filter(t=>t>at));}
export function shuffle(values,random=Math.random){const copy=[...values];for(let i=copy.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}return copy;}
export function safeURL(value){try{const u=new URL(value);return u.protocol==='https:'?u.href:null;}catch{return null;}}

export function scopeLabel(scope){if(/^course:\d{2}$/.test(scope))return 'Kurs '+scope.slice(7);return ({all:'Premium-Webzugang · alle Inhalte',slides:'Alle Kursfolien',diagrams:'Alle Schaubilder',knowledge:'Begriffe & Berufsstart',practice:'Übungsbereich'})[scope]??'Webzugang';}

export function accessDuration(expiresAt){const date=new Date(expiresAt);if(!Number.isFinite(date.getTime()))return 'Laufzeit nicht verfügbar';return date.getUTCFullYear()>=9999?'Dauerhaft':`bis ${date.toLocaleString('de-DE')}`;}
