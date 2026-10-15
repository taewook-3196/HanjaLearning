import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
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


// Mirror production grade-8 hanja IDs and the nine image-item IDs.
// The generator must resolve each image through its actual hanja_id, not a mock index.
const grade8Images=[
 {id:8,hanja_id:9,asset_path:"/exam-images/tree.svg",alt_text:"푸른 잎이 달린 나무 그림"},
 {id:9,hanja_id:16,asset_path:"/exam-images/water.svg",alt_text:"물방울 그림"},
 {id:10,hanja_id:30,asset_path:"/exam-images/fire.svg",alt_text:"타오르는 불꽃 그림"},
 {id:11,hanja_id:22,asset_path:"/exam-images/sun.svg",alt_text:"해가 빛나는 그림"},
 {id:12,hanja_id:19,asset_path:"/exam-images/moon.svg",alt_text:"초승달이 떠 있는 그림"},
 {id:13,hanja_id:21,asset_path:"/exam-images/person.svg",alt_text:"두 팔과 두 다리로 서 있는 사람 그림"},
 {id:14,hanja_id:10,asset_path:"/exam-images/gate.svg",alt_text:"두 짝으로 열린 문 그림"},
 {id:15,hanja_id:27,asset_path:"/exam-images/earth.svg",alt_text:"흙의 단면과 흙덩이가 보이는 그림"},
 {id:16,hanja_id:24,asset_path:"/exam-images/child.svg",alt_text:"어린아이의 얼굴과 몸이 보이는 그림"},
];
const realGrade8Characters=new Map<number,string>([[9,"木"],[16,"水"],[30,"火"],[22,"日"],[19,"月"],[21,"人"],[10,"門"],[27,"土"],[24,"子"]]);
const grade8Pool=[...realGrade8Characters].map(([id,character])=>({id,character,answer:`뜻${id} 음${id}`,examples:[]}));
for(const image of grade8Images) assert.ok(realGrade8Characters.has(image.hanja_id),`Unknown production hanja ID: ${image.hanja_id}`);
const threePictureBlueprint:ExamBlueprint={gradeCode:"8",questionCount:3,items:[{type:"IMAGE_RECOGNITION",count:3}],status:"VERIFIED_108_112"};
for(let run=0;run<50;run++){
 const seen=new Set<string>();
 for(let exam=0;exam<3;exam++){
  const questions=generateExamQuestions({
   pool:grade8Pool,words:[],relations:[],wordRelations:[],metadata:[],wordContexts:[],wordStructures:[],
   commonCharacterSets:[],idioms:[],cultureItems:[],usageItems:[],specialReadings:[],
   imageItems:grade8Images,characterById:realGrade8Characters,questionCount:3,blueprint:threePictureBlueprint,
   recentQuestionKeys:seen
  });
  assert.equal(questions.length,3,`run ${run}, exam ${exam}: expected 3 image questions`);
  for(const question of questions){
   assert.ok(!seen.has(question.id),`run ${run}, exam ${exam}: repeated picture ${question.id}`);
   assert.equal(question.correct,realGrade8Characters.get(grade8Images.find(img=>`image:${img.id}`===question.id)!.hanja_id));
   assert.equal(question.choices.length,4);
   assert.equal(new Set(question.choices).size,4);
   assert.ok(question.choices.includes(question.correct));
   seen.add(question.id);
  }
 }
 assert.equal(seen.size,9);
}
console.log("PASS: 50 simulations of three exams with 9 unique picture questions and valid choices");

// Answer-bearing image descriptions must only appear in the submitted review,
// never while the learner is selecting an answer.
const examPage=readFileSync("src/app/exam/page.tsx","utf8");
assert.equal((examPage.match(/alt=\{q\.image\.alt\}/g)??[]).length,1,"Descriptive alt text belongs only in review");
assert.match(examPage,/alt="그림을 보고 알맞은 한자를 고르는 문제"/);
console.log("PASS: exam image answer is not disclosed in pre-submit alt text");
