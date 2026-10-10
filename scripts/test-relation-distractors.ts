import {generateExamQuestions,type HanjaPoolItem,type Relation} from "../src/lib/exam-generator.ts";
import type {ExamBlueprint} from "../src/lib/exam-blueprints.ts";

const pool:HanjaPoolItem[]=Array.from({length:12},(_,i)=>({id:i+1,character:String.fromCodePoint(0x4e00+i),answer:`뜻${i+1} 음${i+1}`,examples:[]}));
const relations:Relation[]=[
 {from_hanja_id:1,to_hanja_id:2,relation_type:"ANTONYM"},
 {from_hanja_id:3,to_hanja_id:4,relation_type:"ANTONYM"},
 {from_hanja_id:5,to_hanja_id:6,relation_type:"ANTONYM"},
 {from_hanja_id:7,to_hanja_id:8,relation_type:"ANTONYM"},
];
const characterById=new Map(pool.map(item=>[item.id,item.character]));
const blueprint:ExamBlueprint={gradeCode:"5",questionCount:4,items:[{type:"CHAR_SYNONYM_ANTONYM",count:4}],status:"VERIFIED_108_112"};
const related=new Set(relations.flatMap(r=>[characterById.get(r.from_hanja_id),characterById.get(r.to_hanja_id)]));
for(let attempt=0;attempt<100;attempt++){
 const questions=generateExamQuestions({pool,relations,characterById,words:[],wordRelations:[],metadata:[],wordContexts:[],wordStructures:[],commonCharacterSets:[],idioms:[],cultureItems:[],usageItems:[],specialReadings:[],imageItems:[],questionCount:4,blueprint});
 const relationQuestions=questions.filter(q=>q.type==="CHAR_SYNONYM_ANTONYM");
 if(relationQuestions.length!==4)throw new Error("Expected all four relation questions");
 for(const question of relationQuestions){
  if(question.choices.length!==4||new Set(question.choices).size!==4||!question.choices.includes(question.correct))throw new Error("Invalid relation choices");
  const distractors=question.choices.filter(choice=>choice!==question.correct);
  if(distractors.some(choice=>!related.has(choice)))throw new Error("Unrelated distractor selected despite sufficient relation-based alternatives");
  if(distractors.includes(question.stem))throw new Error("Stem must not appear as its own distractor");
 }
}
console.log("PASS: 100 relation distractor rotations prioritize plausible related characters.");
