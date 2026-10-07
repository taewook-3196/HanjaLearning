import {DAEHAN_FIELD_BLUEPRINTS} from "../src/lib/exam-blueprints.ts";
import {generateExamQuestions,validateExamQuestions,type HanjaPoolItem,type PublishedWord} from "../src/lib/exam-generator.ts";

const pool:HanjaPoolItem[]=Array.from({length:80},(_,i)=>({id:i+1,character:String.fromCodePoint(0x4e00+i),answer:`뜻${i+1} 음${i+1}`,examples:[]}));
const words:PublishedWord[]=Array.from({length:80},(_,i)=>({id:i+1,word:`詞${i+1}`,reading:`읽기${i+1}`,meaning:`뜻풀이${i+1}`}));
const characterById=new Map(pool.map(x=>[x.id,x.character]));
const metadata=pool.slice(0,12).map((x,i)=>({hanja_id:x.id,radical:`부수${i}`,total_strokes:i+1,formation_type:["PICTOGRAPH","IDEOGRAPH","COMPOUND_IDEOGRAPH","PHONO_SEMANTIC"][i%4]}));
const relations=Array.from({length:8},(_,i)=>({from_hanja_id:i+1,to_hanja_id:i+21,relation_type:i%2?"SIMILAR":"ANTONYM"}));
const wordRelations=Array.from({length:8},(_,i)=>({from_word_id:i+1,to_word_id:i+21,relation_type:i%2?"SIMILAR":"ANTONYM"}));
const wordContexts=Array.from({length:30},(_,i)=>({id:i+1,word_id:i+1,sentence:`문장 속 詞${i+1} 표현`,blank_text:`詞${i+1}`}));
const wordStructures=Array.from({length:8},(_,i)=>({word_id:i+1,structure_type:["SUBJECT_PREDICATE","VERB_OBJECT","MODIFIER_HEAD","PARALLEL"][i%4]}));
const commonCharacterSets=Array.from({length:4},(_,i)=>({id:i+1,common_hanja_id:i+1,word_ids:[i+1,i+11],word_hanja_ids:{[i+1]:[i+1],[i+11]:[i+1]}}));
const idioms=Array.from({length:6},(_,i)=>({id:i+1,idiom:`成語${i+1}`,reading:`성어${i+1}`,meaning:`성어뜻${i+1}`,child_explanation:null}));
const cultureItems=Array.from({length:4},(_,i)=>({id:i+1,prompt_summary:`문화 문제 ${i+1}`,choice_a:`A${i}`,choice_b:`B${i}`,choice_c:`C${i}`,choice_d:`D${i}`,correct_choice:1}));
const specialReadings=Array.from({length:4},(_,i)=>({id:i+1,hanja_id:i+1,reading:`특음${i+1}`,meaning:`특뜻${i+1}`,usage_note:"특별한 읽기",choice_a:`특음${i+1}`,choice_b:`오답A${i}`,choice_c:`오답B${i}`,choice_d:`오답C${i}`,correct_choice:1}));
const base={pool,words,relations,wordRelations,metadata,wordContexts,wordStructures,commonCharacterSets,idioms,cultureItems,usageItems:[],specialReadings,imageItems:[],characterById};

for(const gradeCode of ["PRE3","3"] as const){
 const blueprint=DAEHAN_FIELD_BLUEPRINTS[gradeCode];
 for(let run=0;run<200;run++){
  const qs=generateExamQuestions({...base,questionCount:blueprint.questionCount,blueprint});
  const errors=validateExamQuestions(qs,blueprint.questionCount,blueprint);
  if(errors.length)throw new Error(`${gradeCode} run ${run+1}: ${errors.join("; ")}`);
  if(new Set(qs.map(q=>q.id)).size!==qs.length)throw new Error(`${gradeCode} run ${run+1}: duplicate ids`);
  if(qs.some(q=>q.choices.length!==4||new Set(q.choices).size!==4||!q.choices.includes(q.correct)))throw new Error(`${gradeCode} run ${run+1}: invalid choices`);
 }
}
console.log("Exam generator invariant checks passed for PRE3 and 3 across 200 runs each.");
