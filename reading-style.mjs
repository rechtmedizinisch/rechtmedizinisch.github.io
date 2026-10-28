// Deliberately limited topic cues. Ordinary prose headings stay unadorned.
export function readingRole(title,role='explanation'){
 if(role&&role!=='explanation')return role;
 const heading=title.toLocaleLowerCase('de');
 if(/quelle|fundstelle|rechtsstand/.test(heading))return 'source';
 if(/sachverhalt|ausgangslage|festgestellt|gesicherte tatsachen/.test(heading))return 'facts';
 if(/beweis|darlegung|nachweis/.test(heading))return 'proof';
 if(/tenor|das konkrete ergebnis|verfahrensausgang/.test(heading))return 'outcome';
 if(/entscheidungsgründe|rechtliche einordnung|begründung|abgrenzung/.test(heading))return 'reasoning';
 return role||'explanation';
}
