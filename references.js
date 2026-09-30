import {safeURL} from './policy.mjs?v=20260930u';
import {protectReferences} from './presentation-theme.mjs?v=20260930u';

const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=protectReferences(text);if(cls)n.className=cls;return n;};
function source(label,url){const a=node('a',label,'reference-source');a.href=safeURL(url)||'#';a.target='_blank';a.rel='noopener noreferrer';return a;}
function symbol(category){
  if(/Verfassung/.test(category))return '⚖';
  if(/Straf/.test(category))return '⚖';
  if(/Arbeit|Beruf|Approbation/.test(category))return '💼';
  if(/Sozial|Versicherung/.test(category))return '🏥';
  if(/Datenschutz|Dokument/.test(category))return '🔐';
  if(/Einwilligung|Patient|Betreuung/.test(category))return '🤝';
  return '§';
}
function select(label,values){const wrap=node('label',label),input=node('select');for(const v of values){const o=node('option',v);o.value=v;input.append(o);}wrap.append(input);return [wrap,input];}
function detail(label,text,cls){if(!text)return null;const box=node('div',null,cls);box.append(node('h3',label),node('p',text));return box;}

export function renderReferences(main,type,catalog){
  const cases=type==='cases',data=cases?catalog.landmarkCases:catalog.importantNorms;
  const hero=node('section',null,'knowledge-banner reference-banner');
  hero.append(node('p',cases?'⚖ LEITENTSCHEIDUNGSATLAS':'§ WERKZEUGKISTE','section-number'),node('h1',cases?'Entscheidungen, die das Medizinrecht geprägt haben':'Kernnormen schnell nachschlagen'),node('p',cases?`${data.length} Entscheidungen mit Leitsatzkern, Einordnung und Praxistransfer.`:`${data.length} zentrale Vorschriften – nach Rechtsgebiet geordnet und direkt mit der Originalfassung verlinkt.`));
  const knowledge=node('a','Begriffe & Gesundheitssystem entdecken →','button secondary');knowledge.href='#library';hero.append(knowledge);main.append(hero);
  const controls=node('section',null,'card reference-filters'),search=node('input');search.type='search';search.placeholder=cases?'Urteil, Aktenzeichen oder Thema':'z. B. § 630h BGB oder Beweis';search.setAttribute('aria-label',cases?'Urteile durchsuchen':'Normen durchsuchen');
  const [areaWrap,area]=select('Rechtsgebiet',['Alle',...[...new Set(data.map(r=>cases?r.area:r.category))].sort((a,b)=>a.localeCompare(b,'de'))]);
  const [tierWrap,tier]=select('Priorität',['Alle','Kernbestand','Vertiefung']);const filters=node('div',null,'reference-filter-row');filters.append(areaWrap);if(cases)filters.append(tierWrap);
  const count=node('p',null,'subtle');count.setAttribute('role','status');controls.append(search,filters,count);main.append(controls);
  const results=node('div',null,'reference-results');main.append(results);
  const matches=r=>JSON.stringify(r).toLocaleLowerCase('de').includes(search.value.toLocaleLowerCase('de'));
  const render=()=>{
    results.replaceChildren();const visible=data.filter(r=>matches(r)&&(area.value==='Alle'||(cases?r.area:r.category)===area.value)&&(!cases||tier.value==='Alle'||r.tier===tier.value));
    count.textContent=`${visible.length} von ${data.length} ${cases?'Entscheidungen':'Vorschriften'}`;
    if(!visible.length)results.append(node('p','Keine passenden Einträge. Ändern Sie den Suchbegriff oder die Filter.','notice'));
    if(cases){for(const r of visible){
      const card=node('article',null,'card judgment-card'),meta=node('div',null,'row');meta.append(node('span',`${r.tier} · ${r.area}`,'badge'),node('span',r.court,'subtle'));card.append(meta,node('h2',r.title),node('p',`${r.date} · ${r.docket}`,'judgment-docket'));
      const tenor=detail('⚖ Leitsatzkern',r.tenor,'judgment-tenor');if(tenor)card.append(tenor);
      const more=node('details'),summary=node('summary','Einordnung & Praxistransfer lesen');more.append(summary);
      for(const d of [detail('Tragende Aussage',r.holding,'judgment-holding'),detail('💡 Praxis-Merksatz',r.practice,'notice'),detail('Rechtsstand',r.status,'subtle')])if(d)more.append(d);
      const links=node('div',null,'reference-actions');links.append(source('Originalquelle / Fundstelle ↗',r.url));if(r.alternativeUrl)links.append(source('Alternative Quelle ↗',r.alternativeUrl));more.append(links);
      if(r.courseIds?.length){const courses=node('div',null,'reference-course-links');courses.append(node('p','Passende Kurse','section-number'));for(const id of r.courseIds){const c=catalog.catalog.find(c=>c.id===id);if(c){const a=node('a',`Kurs ${String(c.no).padStart(2,'0')} · ${c.title} →`);a.href=`#course/${id}`;courses.append(a);}}more.append(courses);}
      card.append(more);results.append(card);
    }}else{
      for(const category of [...new Set(visible.map(r=>r.category))].sort((a,b)=>a.localeCompare(b,'de'))){
        const group=node('section',null,'card norm-group');group.append(node('p','RECHTSGEBIET','section-number'),node('h2',`${symbol(category)} ${category}`));
        for(const r of visible.filter(r=>r.category===category)){const row=source('',r.url);row.className='norm-link';const copy=node('span');copy.append(node('strong',r.label),node('span',r.description,'norm-description'));const icon=node('span','▤','norm-symbol');icon.setAttribute('aria-hidden','true');row.append(icon,copy,node('span','↗','norm-arrow'));group.append(row);}results.append(group);
      }
      const resources=(catalog.practicalResources??[]).filter(matches);if(resources.length){const box=node('section',null,'card norm-resources');box.append(node('p','PRAXISPORTALE','section-number'),node('h2','🌐 Weiterführende Anlaufstellen'));for(const r of resources){const a=source('',r.url);a.className='norm-link';const copy=node('span');copy.append(node('strong',r.label),node('span',r.description,'norm-description'));a.append(copy,node('span','↗','norm-arrow'));box.append(a);}results.append(box);}
    }
  };
  for(const input of [search,area,tier])input.addEventListener(input===search?'input':'change',render);render();
}
