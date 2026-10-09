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
