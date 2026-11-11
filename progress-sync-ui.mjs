const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!=null)n.textContent=text;if(cls)n.className=cls;return n;};
export function syncPanel(info,service,onRefresh){
 const panel=el('section',null,'card sync-panel');panel.append(el('h2','☁ Ihr gemeinsamer Lernstand'));
 const messages={syncing:'Lernstand wird abgeglichen …',saved:'In Ihrem Konto gespeichert.',pending:'Neue Änderungen warten auf die Übertragung.',offline:'Der Abgleich ist gerade nicht möglich. Ihr Lernstand bleibt auf diesem Gerät erhalten. Sobald Sie wieder online sind, versuchen Sie es erneut.',invalid:'Ein gespeicherter Lernstand konnte nicht gelesen werden. Die vorhandenen Fassungen bleiben erhalten.',conflict:'Für denselben Bereich liegen unterschiedliche Änderungen vor. Welche Fassung möchten Sie verwenden? Die andere Fassung bleibt als Sicherung erhalten.'};
 const status=el('p',info.message??messages[info.kind]??'Mit demselben Konto setzen Sie Ihren Lernstand in App und Website fort.','notice sync-status sync-'+info.kind);status.role='status';status.dataset.syncStatus='true';panel.append(status);
 function action(label,callback){const b=el('button',label,'secondary');b.type='button';b.onclick=async()=>{b.disabled=true;try{await callback();onRefresh();}finally{b.disabled=false;}};panel.append(b);}
 if(info.kind==='conflict'){action('Gespeicherten Kontostand verwenden',()=>service.resolve(true));action('Stand dieses Browsers verwenden',()=>service.resolve(false));}
 else action('Jetzt synchronisieren',()=>service.sync());
 panel.append(el('p','Kurs- und Übungsfortschritt, Lesemarken, Fehlerlisten und Zertifikatsname werden abgeglichen. Gastlernstände bleiben getrennt.','subtle'));return panel;
}
