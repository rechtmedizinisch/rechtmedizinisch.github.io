export function requestDeadline(run,milliseconds=20000){
 const controller=new AbortController();let timer;
 const deadline=new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(Error('request_timeout'));},milliseconds);});
 let request;try{request=run(controller.signal);}catch(error){clearTimeout(timer);return Promise.reject(error);}
 return Promise.race([request,deadline]).finally(()=>clearTimeout(timer));
}
