import {readFileSync} from "node:fs";
import {dirname,resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {DAEHAN_FIELD_BLUEPRINTS} from "../src/lib/exam-blueprints.ts";
import {generateExamQuestions,validateExamQuestions,type HanjaPoolItem,type PublishedWord} from "../src/lib/exam-generator.ts";

// Draft-only simulation: reads Markdown and uses synthetic non-culture fixtures.
// It does NOT publish questions, write to the DB, or certify three full 50-question exams.
const markdown=readFileSync(resolve(dirname(fileURLToPath(import.meta.url)),"../docs/upper-grade-culture-review.md"),"utf8");
const section=markdown.split("## 공개 단어 기반 4지선다 신규 문항 초안 (검토 대기)")[1]?.split("## 편집 1차 검토 결과")[0];
if(!section)throw new Error("Missing culture draft section");
const draftSections=section.split(/^### /m).slice(1);
const explanationSection=markdown.split("## 신규 10문항 해설 초안 보강 (2026-10-17)")[1];
if(!explanationSection)throw new Error("Missing culture explanation section");
const explanationRows=[...explanationSection.matchAll(/^\| (5급|4급|준3급|3급) ([^|]+) \| ([^|]+) \|$/gm)];
if(explanationRows.length!==10)throw new Error(`Expected 10 culture explanations, got ${explanationRows.length}`);
const gradeCode:Record<string,string>={"5급":"5","4급":"4","준3급":"PRE3","3급":"3"};
const explanations=new Map(explanationRows.map(([,grade,topic,explanation])=>[`${gradeCode[grade]}:${topic.trim()}`,{explanation:explanation.trim()}]));
const drafts=draftSections.map((chunk,i)=>{
 const [heading,...lines]=chunk.split("\n");
 const match=heading.match(/^(5|4|PRE3|3)급 — (.+)$/);
 const grade=match?.[1];
 const topic=match?.[2]?.trim();
 const prompt=lines.find(x=>x.trim().endsWith("?"));
 const choices=[...chunk.matchAll(/^([1-4])\. (.+)$/gm)].map(m=>m[2]);
 const answer=Number(chunk.match(/^정답: ([1-4])번\./m)?.[1]);
 const detail=explanations.get(`${grade}:${topic}`);
 if(!grade||!prompt||choices.length!==4||answer<1||answer>4||!detail)throw new Error(`Invalid draft or explanation ${heading}`);
 return {grade,id:1000+i,prompt_summary:prompt,choice_a:choices[0],choice_b:choices[1],choice_c:choices[2],choice_d:choices[3],correct_choice:answer,correct_explanation:detail.explanation};
});
const pool:HanjaPoolItem[]=Array.from({length:80},(_,i)=>({id:i+1,character:String.fromCodePoint(0x4e00+i),answer:`뜻${i+1} 음${i+1}`,examples:[]}));
const words:PublishedWord[]=Array.from({length:80},(_,i)=>({id:i+1,word:`詞${String.fromCodePoint(0x4e00+i)}`,reading:`읽기${i+1}`,meaning:`뜻풀이${i+1}`}));
const characterById=new Map(pool.map(x=>[x.id,x.character]));
for(const grade of ["5","4","PRE3","3"] as const){
 const blueprint=DAEHAN_FIELD_BLUEPRINTS[grade];
 const count=blueprint.items.filter(x=>x.type==="CULTURE_ETIQUETTE").reduce((n,x)=>n+x.count,0);
 if(!count)throw new Error(`No culture questions required in grade ${grade}`);
 const cultureBlueprint={...blueprint,questionCount:count,items:blueprint.items.filter(x=>x.type==="CULTURE_ETIQUETTE")};
 const items=drafts.filter(x=>x.grade===grade).map(({grade:_,...item})=>item);
 // Three consecutive culture-only exams need a sufficient pool of distinct drafts.
 // This checks source inventory separately from generator behavior; a small pool can
 // otherwise pass by silently reusing questions when the recent cache is exhausted.
 const requiredForThree=count*3;
 if(items.length<requiredForThree){
  console.log(`Grade ${grade}: draft inventory ${items.length}/${requiredForThree}; three non-repeating culture-only exams (including possible variable culture slots) are NOT supported by drafts alone`);
 }
 const used=new Set<string>();
 for(let run=0;run<3;run++){
  const questions=generateExamQuestions({pool,words,relations:[],wordRelations:[],metadata:[],wordContexts:[],wordStructures:[],commonCharacterSets:[],idioms:[],cultureItems:items,usageItems:[],specialReadings:[],imageItems:[],characterById,questionCount:count,blueprint:cultureBlueprint,recentQuestionKeys:used});
  const errors=validateExamQuestions(questions,count,cultureBlueprint);
  if(errors.length)throw new Error(`Grade ${grade} run ${run+1}: ${errors.join("; ")}`);
  for(const q of questions){
   if(used.has(q.id)&&items.length>=requiredForThree)throw new Error(`Repeated culture question despite sufficient draft pool: ${q.id}`);
   if(!q.id.startsWith("culture:")||q.choices.length!==4||new Set(q.choices).size!==4||!q.choices.includes(q.correct))throw new Error(`Invalid culture question in grade ${grade}`);
   const source=items.find(item=>`culture:${item.id}`===q.id);
   if(!source||q.explanation!==source.correct_explanation)throw new Error(`Missing or mismatched explanation for ${q.id}`);
   used.add(q.id);
  }
 }
 console.log(`Grade ${grade}: three focused culture-only generations passed (${count} per run, ${items.length} draft candidates)`);
}
