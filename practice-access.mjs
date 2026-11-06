import {hasAccess} from './policy.mjs?v=20261106-polish61';
export const workshopDemoID='casework:bgh-vi-zr-304-02';
export const casefileDemoVariant='A';
export function practiceAccess(kind,id,grants=[]){
 if(kind==='casefile'&&!['A','B','C'].includes(id))return false;
 if(!['workshop','casefile'].includes(kind)||typeof id!=='string'||!id)return false;
 return (kind==='workshop'?id===workshopDemoID:id===casefileDemoVariant)||hasAccess('practice',grants);
}
