export type StudyPlan={newCount:number;reviewCount:number;total:number;daysUntilExam:number|null;masteryDays:number|null;phase:"DEFAULT"|"LEARN"|"MASTER"|"EXAM"};
const DAY=86400000;
export function buildStudyPlan(input:{unseen:number;dueReviews:number;examDate?:string|null;now?:Date;defaultTotal?:number}):StudyPlan{
 const now=input.now??new Date();const base=input.defaultTotal??8;const due=Math.max(0,input.dueReviews);const unseen=Math.max(0,input.unseen);
 if(!input.examDate){const reviewCount=Math.min(base,due);const newCount=Math.min(Math.max(0,base-reviewCount),unseen);return{newCount,reviewCount,total:newCount+reviewCount,daysUntilExam:null,masteryDays:null,phase:"DEFAULT"};}
 const end=new Date(input.examDate+"T23:59:59");const days=Math.max(0,Math.ceil((end.getTime()-now.getTime())/DAY));
 const masteryDays=Math.max(7,Math.ceil(days*.2));const learningDays=Math.max(1,days-masteryDays);
 const pacedNew=days<=masteryDays?0:Math.ceil(unseen/learningDays);
 const phase=days===0?"EXAM":days<=masteryDays?"MASTER":"LEARN";
 // Reviews are never displaced by deadline pacing. The daily session may grow beyond the relaxed default.
 const reviewCount=due;const newCount=Math.min(unseen,pacedNew);return{newCount,reviewCount,total:newCount+reviewCount,daysUntilExam:days,masteryDays,phase};
}
