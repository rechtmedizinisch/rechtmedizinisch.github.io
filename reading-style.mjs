// Deliberately limited topic cues. Ordinary prose headings stay unadorned.
export function readingRole(title,role='explanation'){
 if(/^(?:(?:praxis|prüfungs)[ -])?(?:merke|merksatz|merkregel|merkhilfe)\b/iu.test(title.trim()))return 'takeaway';
 if(role&&role!=='explanation')return role;
 const heading=title.toLocaleLowerCase('de');
 if(/quelle|fundstelle|rechtsstand/.test(heading))return 'source';
 if(/sachverhalt|ausgangslage|festgestellt|gesicherte tatsachen/.test(heading))return 'facts';
 if(/beweis|darlegung|nachweis/.test(heading))return 'proof';
 if(/tenor|das konkrete ergebnis|verfahrensausgang/.test(heading))return 'outcome';
 if(/entscheidungsgründe|rechtliche einordnung|begründung|abgrenzung/.test(heading))return 'reasoning';
 if(/merksatz/.test(heading))return 'takeaway';
 if(/^(?:kernaussage|kernpunkte|das wichtigste|im überblick)$/.test(heading))return 'keypoint';
 return role||'explanation';
}
// Only actual numbered headings receive a badge. Ordinary prose is retained.
export function readingHeading(title,marker=null){
 const prefix=title.startsWith('Prüfungsort · ')?'Prüfungsort · ':'',base=title.slice(prefix.length);
 if(/^\d{1,2}\.\s+(?:Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)\b/u.test(base))return {marker,title};
 const match=/^(\d{1,2}|[A-C]|[KLRO](?=\s*·))\s*[·.)]\s+(.+)$/u.exec(base);
 return match?{marker:match[1].padStart(/^\d+$/.test(match[1])?2:1,'0'),title:prefix+match[2]}:{marker,title};
}

const symbols={people:'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M2 21v-3c0-3 3-5 7-5s7 2 7 5v3 M17 4a4 4 0 0 1 0 7 M18 14c3 0 4 2 4 4v3',history:'M3 11a9 9 0 1 1 2 7 M3 4v7h7 M12 7v5l4 2',facts:'M7 3h7l4 4v14H6V3z M14 3v5h4 M9 12h6 M9 16h6',question:'M9 8a3 3 0 0 1 6 0c0 2-3 2-3 5 M12 17v.1 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',solution:'M8 12l3 3 5-6 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',warning:'M12 3 2 21h20L12 3z M12 9v5 M12 17v.1',takeaway:'M9 18h6 M10 21h4 M8 14a6 6 0 1 1 8 0l-1 3H9z M12 1v2',focus:'M3 8V3h5 M16 3h5v5 M21 16v5h-5 M8 21H3v-5 M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',proof:'M15 15l6 6 M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0',outcome:'M8 12l3 3 5-6 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',reasoning:'M12 3v18 M7 21h10 M4 6h16 M5 6 2 14h6L5 6z M19 6l-3 8h6l-3-8z',source:'M3 4h5v17H3z M10 4h4v17h-4z M16 5l3-1 4 16-3 1z'};
export function roleIcon(role){
 if(!symbols[role])return null;
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.setAttribute('class','atlas-role-symbol');
 const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d',symbols[role]);path.setAttribute('fill','none');path.setAttribute('stroke','currentColor');path.setAttribute('stroke-width','1.7');path.setAttribute('stroke-linecap','round');path.setAttribute('stroke-linejoin','round');svg.append(path);return svg;
}
