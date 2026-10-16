export type StudyPlan={newCount:number;reviewCount:number;extraMasteryReviews:number;total:number;daysUntilExam:number|null;masteryDays:number|null;phase:"DEFAULT"|"LEARN"|"MASTER"|"CATCH_UP"|"EXAM";isTight:boolean};
const DAY=86400000,MAX_TOTAL=16,MAX_NEW=10;
function seoulDateKey(d:Date){return new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Seoul",year:"numeric",month:"2-digit",day:"2-digit"}).format(d);}
function dateOrdinal(key:string){const [y,m,d]=key.split("-").map(Number);return Date.UTC(y,m-1,d);}
export function buildStudyPlan(input:{unseen:number;dueReviews:number;weakNotDue?:number;examDate?:string|null;now?:Date;defaultTotal?:number}):StudyPlan{
 const now=input.now??new Date(),base=input.defaultTotal??8,due=Math.max(0,input.dueReviews),unseen=Math.max(0,input.unseen),weak=Math.max(0,input.weakNotDue??0);
 if(!input.examDate){
  // Without a deadline, keep introducing new characters even when reviews are overdue.
  // Reserve three of the default eight slots for new learning while preserving five for reviews.
  const desiredTotal=Math.min(MAX_TOTAL,Math.max(base,due>base?Math.min(due,base+4):base));
  const newReserve=Math.min(unseen,Math.max(1,Math.min(3,Math.floor(base*.4))));
  const newCount=Math.min(newReserve,desiredTotal);
  const reviewCount=Math.min(due,Math.max(0,desiredTotal-newCount));
  const extraNew=Math.min(unseen-newCount,Math.max(0,Math.min(base,desiredTotal)-newCount-reviewCount));
  return{newCount:newCount+extraNew,reviewCount,extraMasteryReviews:0,total:newCount+extraNew+reviewCount,daysUntilExam:null,masteryDays:null,phase:"DEFAULT",isTight:false};
 }
 const days=Math.max(0,Math.round((dateOrdinal(input.examDate)-dateOrdinal(seoulDateKey(now)))/DAY));
 const masteryDays=Math.max(7,Math.ceil(days*.2)),learningDays=Math.max(1,days-masteryDays);
 const idealNew=days>masteryDays?Math.ceil(unseen/learningDays):0,catchUpNew=unseen>0&&days>0?Math.ceil(unseen/Math.max(1,days)):0;
 const isTight=idealNew>MAX_NEW||(days<=masteryDays&&unseen>0),phase=days===0?"EXAM":isTight?"CATCH_UP":days<=masteryDays?"MASTER":"LEARN";
 const requestedNew=phase==="CATCH_UP"?Math.max(1,catchUpNew):idealNew;
 const masteryBoost=(phase==="MASTER"||phase==="CATCH_UP")?Math.min(4,weak):0;
 const desiredTotal=Math.min(MAX_TOTAL,Math.max(base,due+Math.min(unseen,requestedNew)+masteryBoost));
 // Protect retention first: overdue reviews reserve the majority of today's capacity.
 // Deadline-driven new learning still receives the remaining slots so the target can finish before the exam.
 const reviewReserve=Math.min(due,Math.min(desiredTotal,Math.max(base,Math.ceil(desiredTotal*.55))));
 const newCount=Math.min(unseen,MAX_NEW,requestedNew,Math.max(0,desiredTotal-reviewReserve));
 const remainingAfterNew=Math.max(0,desiredTotal-newCount);
 const reviewCount=Math.min(due,remainingAfterNew);
 const remainingAfterDue=Math.max(0,remainingAfterNew-reviewCount);
 const extraMasteryReviews=(phase==="MASTER"||phase==="CATCH_UP"||days<=Math.max(14,masteryDays*2))?Math.min(weak,remainingAfterDue):0;
 return{newCount,reviewCount,extraMasteryReviews,total:newCount+reviewCount+extraMasteryReviews,daysUntilExam:days,masteryDays,phase,isTight};
}
