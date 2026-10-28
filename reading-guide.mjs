// A corrupt/old guide must fall back to the complete ordinary reader.
export function readingGroups(content){
 const groups=content.readingGuide,sections=content.sections??[];
 if(!Array.isArray(groups)||!groups.length)return null;
 if(groups.some(g=>!g||typeof g.id!=='string'||!g.id.trim()||typeof g.title!=='string'||!g.title.trim()||!Array.isArray(g.indices)||!g.indices.length))return null;
 if(new Set(groups.map(g=>g.id)).size!==groups.length)return null;
 const indices=groups.flatMap(g=>g.indices);
 if(indices.length!==sections.length||indices.some((n,i)=>!Number.isInteger(n)||n!==i))return null;
 return groups;
}
