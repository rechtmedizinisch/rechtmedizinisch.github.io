// Deliberately limited topic cues. Ordinary prose headings stay unadorned.
export function readingRole(title,role='explanation'){
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
 const match=/^(\d{1,2}|[A-C])\s*[·.)]\s+(.+)$/u.exec(base);
 return match?{marker:match[1].padStart(/^\d+$/.test(match[1])?2:1,'0'),title:prefix+match[2]}:{marker,title};
}
