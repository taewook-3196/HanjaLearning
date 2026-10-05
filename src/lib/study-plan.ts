export type StudyPlan={newCount:number;reviewCount:number;extraMasteryReviews:number;total:number;daysUntilExam:number|null;masteryDays:number|null;phase:"DEFAULT"|"LEARN"|"MASTER"|"CATCH_UP"|"EXAM";isTight:boolean};
const DAY=86400000,MAX_TOTAL=16,MAX_NEW=10;
export function buildStudyPlan(input:{unseen:number;dueReviews:number;weakNotDue?:number;examDate?:string|null;now?:Date;defaultTotal?:number}):StudyPlan{
 const now=input.now??new Date(),base=input.defaultTotal??8,due=Math.max(0,input.dueReviews),unseen=Math.max(0,input.unseen),weak=Math.max(0,input.weakNotDue??0);
 if(!input.examDate){const reviewCount=Math.min(base,due),newCount=Math.min(Math.max(0,base-reviewCount),unseen);return{newCount,reviewCount,extraMasteryReviews:0,total:newCount+reviewCount,daysUntilExam:null,masteryDays:null,phase:"DEFAULT",isTight:false};}
 const end=new Date(input.examDate+"T23:59:59"),days=Math.max(0,Math.ceil((end.getTime()-now.getTime())/DAY));
 const masteryDays=Math.max(7,Math.ceil(days*.2)),learningDays=Math.max(1,days-masteryDays);
 const idealNew=days>masteryDays?Math.ceil(unseen/learningDays):0,catchUpNew=unseen>0&&days>0?Math.ceil(unseen/Math.max(1,days)):0;
 const isTight=idealNew>MAX_NEW||(days<=masteryDays&&unseen>0),phase=days===0?"EXAM":isTight?"CATCH_UP":days<=masteryDays?"MASTER":"LEARN";
 const requestedNew=phase==="CATCH_UP"?Math.max(1,catchUpNew):idealNew;
 // Keep the relaxed 8-card rhythm when possible, but grow gradually for a deadline instead of assigning every due review at once.
 const deadlineReviewBoost=(phase==="MASTER"||phase==="CATCH_UP")?Math.min(4,weak):0;\n const targetTotal=Math.min(MAX_TOTAL,Math.max(base,Math.min(MAX_TOTAL,due+Math.min(unseen,requestedNew)+deadlineReviewBoost)));
 const newCount=Math.min(unseen,MAX_NEW,requestedNew,Math.max(0,targetTotal-Math.min(due,targetTotal)));
 const reviewCount=Math.min(due,targetTotal-newCount);
 const spare=Math.max(0,targetTotal-newCount-reviewCount);
 const extraMasteryReviews=(phase==="MASTER"||phase==="CATCH_UP"||days<=Math.max(14,masteryDays*2))?Math.min(weak,spare||Math.max(0,Math.min(4,MAX_TOTAL-newCount-reviewCount))):0;
 return{newCount,reviewCount,extraMasteryReviews,total:newCount+reviewCount+extraMasteryReviews,daysUntilExam:days,masteryDays,phase,isTight};
}
