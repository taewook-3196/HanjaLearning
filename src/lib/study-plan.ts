export type StudyPlan={newCount:number;reviewCount:number;total:number;daysUntilExam:number|null;masteryDays:number|null;phase:"DEFAULT"|"LEARN"|"MASTER"|"CATCH_UP"|"EXAM";isTight:boolean};
const DAY=86400000;
const MAX_NEW_PER_DAY=12;
export function buildStudyPlan(input:{unseen:number;dueReviews:number;examDate?:string|null;now?:Date;defaultTotal?:number}):StudyPlan{
 const now=input.now??new Date();const base=input.defaultTotal??8;const due=Math.max(0,input.dueReviews);const unseen=Math.max(0,input.unseen);
 if(!input.examDate){const reviewCount=Math.min(base,due);const newCount=Math.min(Math.max(0,base-reviewCount),unseen);return{newCount,reviewCount,total:newCount+reviewCount,daysUntilExam:null,masteryDays:null,phase:"DEFAULT",isTight:false};}
 const end=new Date(input.examDate+"T23:59:59");const days=Math.max(0,Math.ceil((end.getTime()-now.getTime())/DAY));
 const masteryDays=Math.max(7,Math.ceil(days*.2));const learningDays=Math.max(1,days-masteryDays);
 const idealNew=days>masteryDays?Math.ceil(unseen/learningDays):0;
 const catchUpNew=unseen>0&&days>0?Math.ceil(unseen/Math.max(1,days)):0;
 const isTight=idealNew>MAX_NEW_PER_DAY||(days<=masteryDays&&unseen>0);
 const phase=days===0?"EXAM":isTight?"CATCH_UP":days<=masteryDays?"MASTER":"LEARN";
 const requestedNew=phase==="CATCH_UP"?Math.max(1,catchUpNew):idealNew;
 const newCount=Math.min(unseen,MAX_NEW_PER_DAY,requestedNew);
 // Due reviews stay first. New learning is capped so a late goal cannot create an unreasonable child workload.
 const reviewCount=due;return{newCount,reviewCount,total:newCount+reviewCount,daysUntilExam:days,masteryDays,phase,isTight};
}
