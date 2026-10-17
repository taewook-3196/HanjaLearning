import {DAEHAN_FIELD_BLUEPRINTS} from "../src/lib/exam-blueprints.ts";
import {generateExamQuestions,validateExamQuestions,type HanjaPoolItem,type PublishedWord} from "../src/lib/exam-generator.ts";

// Synthetic data only: no user accounts or production exam attempts are touched.
const pool:HanjaPoolItem[]=Array.from({length:80},(_,i)=>({id:i+1,character:String.fromCodePoint(0x4e00+i),answer:`뜻${i+1} 음${i+1}`,examples:[]}));
const words:PublishedWord[]=Array.from({length:80},(_,i)=>({id:i+1,word:`詞${String.fromCodePoint(0x4e00+i)}`,reading:`읽기${i+1}`,meaning:`뜻풀이${i+1}`}));
const characterById=new Map(pool.map(x=>[x.id,x.character]));
const cultureItems=Array.from({length:10},(_,i)=>({id:100+i,prompt_summary:`생활 예절 상황 ${i+1}`,choice_a:`행동 A${i}`,choice_b:`행동 B${i}`,choice_c:`행동 C${i}`,choice_d:`행동 D${i}`,correct_choice:(i%4)+1}));
const blueprint=DAEHAN_FIELD_BLUEPRINTS["6"];
if(!blueprint)throw new Error("Missing grade 6 exam blueprint");
const base={pool,words,relations:[],wordRelations:[],metadata:[],wordContexts:[],wordStructures:[],commonCharacterSets:[],idioms:[],cultureItems,usageItems:[],specialReadings:[],imageItems:[],characterById};
const cultureRequired=blueprint.items.filter(x=>x.type==="CULTURE_ETIQUETTE").reduce((n,x)=>n+x.count,0);
if(cultureRequired<1)throw new Error("Grade 6 blueprint must include culture questions");

// Exercise the real generator with a focused blueprint, without needing unrelated question types.
const cultureBlueprint={...blueprint,questionCount:cultureRequired,items:blueprint.items.filter(x=>x.type==="CULTURE_ETIQUETTE")};
const used=new Set<string>();
for(let run=0;run<100;run++){
 const qs=generateExamQuestions({...base,questionCount:cultureRequired,blueprint:cultureBlueprint,recentQuestionKeys:used});
 const errors=validateExamQuestions(qs,cultureRequired,cultureBlueprint);
 if(errors.length)throw new Error(`Run ${run}: ${errors.join("; ")}`);
 for(const q of qs){
  if(!q.id.startsWith("culture:"))throw new Error("Non-culture question generated");
  if(q.choices.length!==4||new Set(q.choices).size!==4||!q.choices.includes(q.correct))throw new Error("Invalid culture choices");
  used.add(q.id);
 }
}
if(used.size<2)throw new Error("Recent-question prioritization failed to rotate culture items");
console.log("Culture exam generation: 100 runs passed; unique items visited:",used.size);

const pre4=DAEHAN_FIELD_BLUEPRINTS.PRE4;
const pre4CultureBlueprint={...pre4,questionCount:2,items:pre4.items.filter(x=>x.type==="CULTURE_ETIQUETTE")};
const auditedIds=[13,22,46,14,41,42,43,5,6,44,45];
const auditedCulture=auditedIds.map((id,i)=>({id,prompt_summary:`준4급 검토 항목 ${id}`,choice_a:`정답 ${i}`,choice_b:`오답1 ${i}`,choice_c:`오답2 ${i}`,choice_d:`오답3 ${i}`,correct_choice:1}));
const conceptGroups=[[13,22],[22,46],[14,41],[42,43]];
for(let run=0;run<200;run++){
 const qs=generateExamQuestions({...base,cultureItems:auditedCulture,blueprint:pre4CultureBlueprint,questionCount:2});
 const issues=validateExamQuestions(qs,2,pre4CultureBlueprint);
 if(issues.length)throw new Error(`PRE4 concept run ${run}: ${issues.join("; ")}`);
 const ids=new Set(qs.map(q=>Number(q.id.replace("culture:",""))));
 for(const group of conceptGroups)if(group.every(id=>ids.has(id)))throw new Error(`PRE4 repeated culture concept: ${group.join(",")}`);
}
console.log("PRE4 culture concept exclusion: 200 randomized runs passed");

const recentPre4=new Set<string>();
for(let exam=0;exam<3;exam++){
 const qs=generateExamQuestions({...base,cultureItems:auditedCulture,blueprint:pre4CultureBlueprint,questionCount:2,recentQuestionKeys:recentPre4});
 const issues=validateExamQuestions(qs,2,pre4CultureBlueprint);
 if(issues.length)throw new Error(`PRE4 rotation exam ${exam+1}: ${issues.join("; ")}`);
 for(const q of qs){
  if(recentPre4.has(q.id))throw new Error(`PRE4 culture repeated across three exams: ${q.id}`);
  recentPre4.add(q.id);
 }
 const ids=new Set(qs.map(q=>Number(q.id.replace("culture:",""))));
 for(const group of conceptGroups)if(group.every(id=>ids.has(id)))throw new Error(`PRE4 rotation exam ${exam+1}: overlapping concepts ${group.join(",")}`);
}
if(recentPre4.size!==6)throw new Error(`PRE4 expected six distinct questions, got ${recentPre4.size}`);
console.log("PRE4 culture rotation: three exams, six distinct questions, no concept overlap");

const taggedItems=[101,102,103,104].map((id,i)=>({id,prompt_summary:`Tagged concept ${id}`,choice_a:`correct ${id}`,choice_b:`wrong A ${id}`,choice_c:`wrong B ${id}`,choice_d:`wrong C ${id}`,correct_choice:1,concept_tags:i<2?["shared-topic"]:["other-topic"]}));
const taggedBlueprint={...cultureBlueprint,questionCount:2,items:[{type:"CULTURE_ETIQUETTE" as const,count:2}]};
for(let run=0;run<100;run++){
 const qs=generateExamQuestions({...base,cultureItems:taggedItems,blueprint:taggedBlueprint,questionCount:2});
 if(qs.length!==2)throw new Error("Concept tag two-question generation failed");
 const ids=qs.map(q=>Number(q.id.split(":")[1]));
 if(ids.every(id=>id<=102)||ids.every(id=>id>=103))throw new Error("Two questions share a concept tag");
}
console.log("Optional culture concept tags: 100 randomized paired selections passed");
