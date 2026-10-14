import { strict as assert } from "node:assert";
import { generateExamQuestions } from "../src/lib/exam-generator.ts";
import type { ExamBlueprint } from "../src/lib/exam-blueprints.ts";

const chars = ["日","月","目","白","自","木","本","禾","火","水","人","土","士","門","問","間","母","山","口","手"];
const pool = chars.map((character,i)=>({id:i+1,character,answer:`뜻${i+1} 음${i+1}`,examples:[]}));
const characterById = new Map(pool.map(x=>[x.id,x.character]));
const blueprint:ExamBlueprint = {
 gradeCode:"8",questionCount:1,items:[{type:"IMAGE_RECOGNITION",count:1}]
} as ExamBlueprint;
const images = [{id:1,hanja_id:1,asset_path:"/exam-images/original-sun.svg",alt_text:"태양"}];
for(let run=0;run<100;run++){
 const qs=generateExamQuestions({
  pool,words:[],relations:[],wordRelations:[],metadata:[],wordContexts:[],wordStructures:[],
  commonCharacterSets:[],idioms:[],cultureItems:[],usageItems:[],specialReadings:[],
  imageItems:images,characterById,questionCount:1,blueprint
 });
 assert.equal(qs.length,1,`run ${run}: expected one image question`);
 const q=qs[0];
 assert.equal(q.correct,"日");
 assert.equal(q.image?.src,"/exam-images/original-sun.svg");
 assert.equal(q.image?.alt,"태양");
 assert.equal(q.choices.length,4);
 assert.equal(new Set(q.choices).size,4);
 assert.ok(q.choices.includes(q.correct));
 assert.ok(q.choices.some(x=>["月","目","白","自"].includes(x)),"similar character should appear");
}
console.log("PASS: 100 generated pictorial questions with image, correct answer, unique choices and confusable distractors");


const grade8Images=[
 {id:8,hanja_id:6,asset_path:"/exam-images/sun.svg",alt_text:"해"},
 {id:9,hanja_id:2,asset_path:"/exam-images/moon.svg",alt_text:"달"},
 {id:10,hanja_id:11,asset_path:"/exam-images/person.svg",alt_text:"사람"},
 {id:11,hanja_id:16,asset_path:"/exam-images/gate.svg",alt_text:"문"},
 {id:12,hanja_id:12,asset_path:"/exam-images/earth.svg",alt_text:"흙"},
 {id:13,hanja_id:1,asset_path:"/exam-images/child.svg",alt_text:"아이"},
 {id:14,hanja_id:10,asset_path:"/exam-images/fire.svg",alt_text:"불"},
 {id:15,hanja_id:9,asset_path:"/exam-images/tree.svg",alt_text:"나무"},
 {id:16,hanja_id:8,asset_path:"/exam-images/water.svg",alt_text:"물"},
];
const threePictureBlueprint:ExamBlueprint={gradeCode:"8",questionCount:3,items:[{type:"IMAGE_RECOGNITION",count:3}],status:"VERIFIED_108_112"};
for(let run=0;run<50;run++){
 const seen=new Set<string>();
 for(let exam=0;exam<3;exam++){
  const questions=generateExamQuestions({
   pool,words:[],relations:[],wordRelations:[],metadata:[],wordContexts:[],wordStructures:[],
   commonCharacterSets:[],idioms:[],cultureItems:[],usageItems:[],specialReadings:[],
   imageItems:grade8Images,characterById,questionCount:3,blueprint:threePictureBlueprint,
   recentQuestionKeys:seen
  });
  assert.equal(questions.length,3,`run ${run}, exam ${exam}: expected 3 image questions`);
  for(const question of questions){
   assert.ok(!seen.has(question.id),`run ${run}, exam ${exam}: repeated picture ${question.id}`);
   assert.equal(question.choices.length,4);
   assert.equal(new Set(question.choices).size,4);
   assert.ok(question.choices.includes(question.correct));
   seen.add(question.id);
  }
 }
 assert.equal(seen.size,9);
}
console.log("PASS: 50 simulations of three exams with 9 unique picture questions and valid choices");
