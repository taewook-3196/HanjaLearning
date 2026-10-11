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
