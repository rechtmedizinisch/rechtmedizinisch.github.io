// Mirrors the native ProgressEngine: every required unit counts once.
export function emptyCourseProgress() {
  return {materialsRead:[],caseChoice:null,decisionOpened:false,quizChoice:null,
    transferChoices:[],transferSubmitted:false,readingOpened:[],podcastOpened:false};
}
const indices=(values,length)=>new Set((Array.isArray(values)?values:[])
  .filter(i=>Number.isInteger(i)&&i>=0&&i<length));
const validChoice=(i,choices)=>Number.isInteger(i)&&i>=0&&i<choices.length;
export function courseStatus(course,value={}) {
  const materialCount=indices(value.materialsRead,course.basics.length).size;
  const readingCount=indices(value.readingOpened,course.reading.length).size;
  const caseSolved=validChoice(value.caseChoice,course.caseTask.choices)
    &&(course.caseTask.correct==null||value.caseChoice===course.caseTask.correct);
  const quizSolved=validChoice(value.quizChoice,course.quiz.choices)&&value.quizChoice===course.quiz.correct;
  const expected=new Set(Array.isArray(course.transfer.correct)?course.transfer.correct:[course.transfer.correct]);
  const selected=new Set(Array.isArray(value.transferChoices)?value.transferChoices:[]);
  const transferSolved=value.transferSubmitted===true&&selected.size===expected.size
    &&[...expected].every(i=>selected.has(i));
  const podcastOpened=course.podcast==null||value.podcastOpened===true;
  const completedUnits=materialCount+readingCount+Number(caseSolved)+Number(quizSolved)
    +Number(transferSolved)+Number(value.decisionOpened===true)
    +Number(course.podcast!=null&&podcastOpened);
  const totalUnits=course.basics.length+4+course.reading.length+Number(course.podcast!=null);
  const isComplete=totalUnits>0&&completedUnits===totalUnits;
  const percent=isComplete?100:Math.max(0,Math.min(99,Math.round(completedUnits/totalUnits*100)));
  return {completedUnits,totalUnits,materialCount,readingCount,caseSolved,quizSolved,
    transferSolved,podcastOpened,isComplete,percent};
}
export function overallStatus(courses,progress={}) {
  const states=courses.map(c=>courseStatus(c,progress[c.id]));
  const completedCourses=states.filter(s=>s.isComplete).length,totalCourses=courses.length;
  const completedUnits=states.reduce((n,s)=>n+s.completedUnits,0);
  const totalUnits=states.reduce((n,s)=>n+s.totalUnits,0);
  const isComplete=totalCourses>0&&completedCourses===totalCourses&&totalUnits>0&&completedUnits===totalUnits;
  return {completedCourses,totalCourses,completedUnits,totalUnits,isComplete,
    percent:isComplete?100:totalUnits?Math.min(99,Math.round(completedUnits/totalUnits*100)):0,
    experiencePoints:completedUnits*10};
}
