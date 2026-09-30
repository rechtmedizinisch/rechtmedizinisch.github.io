const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!=null)n.textContent=text;if(cls)n.className=cls;return n;};
export function syncPanel(info,service,onRefresh){
 const panel=el('section',null,'card sync-panel');panel.append(el('h2','☁ Lernstand im Web-Konto'));
 const messages={syncing:'Lernstand wird abgeglichen …',saved:'Mit Ihrem Web-Konto synchronisiert.',pending:'Neue Änderungen warten auf die Übertragung.',offline:'Der Abgleich ist gerade nicht möglich. Ihr lokaler Lernstand bleibt erhalten. Versuchen Sie es erneut, sobald die Verbindung wieder verfügbar ist.',conflict:'Auf einem anderen Gerät wurde der Lernstand ebenfalls geändert. Wählen Sie bewusst, welche Fassung gelten soll. Die andere Fassung wird dabei ersetzt.'};
 const status=el('p',messages[info.kind]??'Ihr Lernstand wird auf Geräten mit demselben Web-Konto abgeglichen.','notice');status.role='status';status.dataset.syncStatus='true';panel.append(status);
 function action(label,callback){const b=el('button',label,'secondary');b.type='button';b.onclick=async()=>{b.disabled=true;await callback();onRefresh();};panel.append(b);}
 if(info.kind==='conflict'){action('Stand aus dem Web-Konto übernehmen',()=>service.resolve(true));action('Diesen Browserstand für das Konto verwenden',()=>service.resolve(false));}
 else action('Jetzt synchronisieren',()=>service.sync());
 panel.append(el('p','Die Synchronisierung betrifft Ihren Lernstand, Lesemarken, Fehlerlisten und Zertifikatsnamen. Sie überträgt keine Apple-Käufe und verbindet sich nicht mit iCloud.','subtle'));return panel;
}
