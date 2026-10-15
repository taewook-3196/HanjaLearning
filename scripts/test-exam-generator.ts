import {DAEHAN_FIELD_BLUEPRINTS} from "../src/lib/exam-blueprints.ts";
import {generateExamQuestions,validateExamQuestions,examReadinessSummary,fieldExamReadinessIssues,examRotationShortages,type HanjaPoolItem,type PublishedWord} from "../src/lib/exam-generator.ts";

const pool:HanjaPoolItem[]=Array.from({length:80},(_,i)=>({id:i+1,character:String.fromCodePoint(0x4e00+i),answer:`뜻${i+1} 음${i+1}`,examples:[]}));
const words:PublishedWord[]=Array.from({length:80},(_,i)=>({id:i+1,word:i<4?`詞${String.fromCodePoint(0x4e00+i)}`:i>=10&&i<14?`${String.fromCodePoint(0x4e00+i-10)}詞`:`詞${String.fromCodePoint(0x4e00+i)}`,reading:`읽기${i+1}`,meaning:`뜻풀이${i+1}`}));
const characterById=new Map(pool.map(x=>[x.id,x.character]));
const metadata=pool.slice(0,12).map((x,i)=>({hanja_id:x.id,radical:`부수${i}`,total_strokes:i+1,formation_type:["PICTOGRAPH","IDEOGRAPH","COMPOUND_IDEOGRAPH","PHONO_SEMANTIC"][i%4]}));
const relations=Array.from({length:8},(_,i)=>({from_hanja_id:i+1,to_hanja_id:i+21,relation_type:i%2?"SIMILAR":"ANTONYM"}));
const wordRelations=Array.from({length:8},(_,i)=>({from_word_id:i+1,to_word_id:i+21,relation_type:i%2?"SIMILAR":"ANTONYM"}));
const wordContexts=Array.from({length:30},(_,i)=>({id:i+1,word_id:i+1,sentence:`문장 속 읽기${i+1} 표현`,blank_text:`읽기${i+1}`}));
const wordStructures=Array.from({length:8},(_,i)=>({word_id:i+1,structure_type:["SUBJECT_PREDICATE","VERB_OBJECT","MODIFIER_HEAD","PARALLEL"][i%4]}));
const commonCharacterSets=Array.from({length:4},(_,i)=>({id:i+1,common_hanja_id:i+1,word_ids:[i+1,i+11],word_hanja_ids:{[i+1]:[i+1],[i+11]:[i+1]}}));
const idioms=Array.from({length:6},(_,i)=>({id:i+1,idiom:`成語${i+1}`,reading:`성어${i+1}`,meaning:`성어뜻${i+1}`,child_explanation:null}));
const cultureItems=Array.from({length:12},(_,i)=>({id:i+1,prompt_summary:`문화 문제 ${i+1}`,choice_a:`A${i}`,choice_b:`B${i}`,choice_c:`C${i}`,choice_d:`D${i}`,correct_choice:1}));
const specialReadings=Array.from({length:12},(_,i)=>({id:i+1,hanja_id:i+1,reading:`특음${i+1}`,meaning:`특뜻${i+1}`,usage_note:"특별한 읽기",choice_a:`특음${i+1}`,choice_b:`오답A${i}`,choice_c:`오답B${i}`,choice_d:`오답C${i}`,correct_choice:1}));
const usageItems=Array.from({length:12},(_,i)=>({id:i+1,hanja_id:i+1,prompt:`쓰임 문제 ${i+1}`,choice_a:`정답${i}`,choice_b:`오답A${i}`,choice_c:`오답B${i}`,choice_d:`오답C${i}`,correct_choice:1}));
const imageItems=Array.from({length:6},(_,i)=>({id:i+1,hanja_id:i+1,asset_path:`/exam-images/test-${i+1}.svg`,alt_text:`시험 그림 ${i+1}`}));
const base={pool,words,relations,wordRelations,metadata,wordContexts,wordStructures,commonCharacterSets,idioms,cultureItems,usageItems,specialReadings,imageItems,characterById};

// Context reading and context-to-Hanja share a source bank across three exams.
for(const [gradeCode,blueprint] of Object.entries(DAEHAN_FIELD_BLUEPRINTS)){
 const contextPerExam=blueprint.items.filter(x=>x.type==="CONTEXT_READING"||x.type==="CONTEXT_TO_HANJA").reduce((sum,x)=>sum+x.count,0);
 if(!contextPerExam)continue;
 const required=contextPerExam*3;
 const input={...base,wordContexts:wordContexts.slice(0,required-1)};
 const issue=examRotationShortages(input,blueprint,3).find(x=>x.type==="CONTEXT_SHARED_POOL");
 if(!issue||issue.required!==required||issue.available!==required-1)throw new Error(`${gradeCode}: combined context bank shortage not detected`);
}
console.log("All nine grade shared-context rotation checks passed.");
// Readiness must match extra fixed types chosen by the variable generator.
const pre5VariableInput={...base,idioms:idioms.slice(0,1),cultureItems:cultureItems.slice(0,1)};
const pre5Issues=fieldExamReadinessIssues(pre5VariableInput,DAEHAN_FIELD_BLUEPRINTS.PRE5);
if(!pre5Issues.some(x=>x.type==="IDIOM"&&x.required===2))throw new Error("PRE5 variable idiom shortage not detected");
if(!pre5Issues.some(x=>x.type==="CULTURE_ETIQUETTE"&&x.required===2))throw new Error("PRE5 variable culture shortage not detected");
const pre3VariableInput={...base,cultureItems:cultureItems.slice(0,1)};
const pre3Issues=fieldExamReadinessIssues(pre3VariableInput,DAEHAN_FIELD_BLUEPRINTS.PRE3);
if(!pre3Issues.some(x=>x.type==="CULTURE_ETIQUETTE"&&x.required===2))throw new Error("PRE3 variable culture shortage not detected");
console.log("Variable-type readiness requirements match generator.");


// Every supported grade must report a three-exam rotation shortage when a required bank is empty.
for(const [gradeCode,blueprint] of Object.entries(DAEHAN_FIELD_BLUEPRINTS)){
 const blankBank={...base,wordContexts:[],specialReadings:[],imageItems:[],wordStructures:[]};
 const issues=examRotationShortages(blankBank,blueprint,3);
 for(const item of blueprint.items){
  if(item.type==="VARIABLE_VERIFIED")continue;
  if(["CONTEXT_READING","CONTEXT_TO_HANJA","SPECIAL_READING","IMAGE_RECOGNITION","WORD_STRUCTURE"].includes(item.type)){
   const issue=issues.find(x=>x.type===item.type);
   if(!issue||issue.required!==item.count*3||issue.available!==0)throw new Error(`${gradeCode}: missing three-exam shortage for ${item.type}`);
  }
 }
}
console.log("All nine grade rotation-shortage checks passed.");

// Image readiness must reject out-of-grade images and invalid asset metadata.
const invalidImages=[{id:9001,hanja_id:99999,asset_path:"/exam-images/missing.svg",alt_text:"missing"},{id:9002,hanja_id:1,asset_path:"/outside/tree.svg",alt_text:"invalid"}];
if(examReadinessSummary({...base,imageItems:invalidImages}).ORIGINAL_IMAGES!==0)throw new Error("Image readiness counted unrenderable or out-of-grade items");
if(examReadinessSummary(base).ORIGINAL_IMAGES!==imageItems.length)throw new Error("Valid image readiness regression");
console.log("Image eligibility readiness checks passed.");


const gradeCodes=Object.keys(DAEHAN_FIELD_BLUEPRINTS);
for(const gradeCode of gradeCodes){
 const blueprint=DAEHAN_FIELD_BLUEPRINTS[gradeCode];
 for(let run=0;run<200;run++){
  const qs=generateExamQuestions({...base,questionCount:blueprint.questionCount,blueprint});
  const errors=validateExamQuestions(qs,blueprint.questionCount,blueprint);
  if(errors.length)throw new Error(`${gradeCode} run ${run+1}: ${errors.join("; ")}`);
  if(new Set(qs.map(q=>q.id)).size!==qs.length)throw new Error(`${gradeCode} run ${run+1}: duplicate ids`);
  if(qs.some(q=>q.choices.length!==4||new Set(q.choices).size!==4||!q.choices.includes(q.correct)))throw new Error(`${gradeCode} run ${run+1}: invalid choices`);
  if(qs.some(q=>q.id.startsWith("common-character:")&&(q.stem.includes(q.correct)||q.stem.split("□").length-1<2)))throw new Error(`${gradeCode} run ${run+1}: invalid common-character blanks`);
 }
}
console.log(`Exam generator invariant checks passed for ${gradeCodes.join(", ")} across 200 runs each.`);


const confusablePool:HanjaPoolItem[]=[
 {id:1001,character:"田",answer:"밭 전",examples:[]},
 {id:1002,character:"甲",answer:"갑옷 갑",examples:[]},
 {id:1003,character:"由",answer:"말미암을 유",examples:[]},
 {id:1004,character:"申",answer:"펼 신",examples:[]},
 {id:1005,character:"日",answer:"날 일",examples:[]},
 {id:1006,character:"目",answer:"눈 목",examples:[]},
 {id:1007,character:"木",answer:"나무 목",examples:[]},
 {id:1008,character:"本",answer:"근본 본",examples:[]},
];
const confusableBase={...base,pool:confusablePool,characterById:new Map(confusablePool.map(x=>[x.id,x.character]))};
for(let run=0;run<100;run++){
 const qs=generateExamQuestions({...confusableBase,questionCount:confusablePool.length});
 const target=qs.find(q=>q.stem==="田");
 if(!target)throw new Error("田 question missing");
 if(!target.choices.includes("갑옷 갑")||!target.choices.includes("말미암을 유")||!target.choices.includes("펼 신"))throw new Error("田 should prioritize 甲/由/申 distractors");
 if(qs.some(q=>!q.stem||q.stem==="-"))throw new Error("invalid Hanja stem generated");
}
const invalidPool=[...confusablePool,{id:1009,character:"-",answer:"잘못된 자료",examples:[]}];
for(let run=0;run<30;run++){
 const qs=generateExamQuestions({...confusableBase,pool:invalidPool,questionCount:invalidPool.length});
 if(qs.some(q=>q.stem==="-"))throw new Error("invalid Hanja stem generated");
}
console.log("Confusable character distractor checks passed.");

for(let run=0;run<20;run++){
 const contextualSpecial={...specialReadings[0],usage_note:"音樂(음악)에서 樂을 읽는 소리",reading:"특음1"};
 const specialQuestions=generateExamQuestions({...base,specialReadings:[contextualSpecial,...specialReadings.slice(1)],recentQuestionKeys:new Set(specialReadings.slice(1).map(x=>`special-reading:${x.id}`)),questionCount:DAEHAN_FIELD_BLUEPRINTS.PRE4.questionCount,blueprint:DAEHAN_FIELD_BLUEPRINTS.PRE4});
 const target=specialQuestions.find(q=>q.id==="special-reading:1");
 if(!target)throw new Error("Special-reading context question missing");
 if(!target.prompt.includes("音樂")||target.prompt.includes("(음악)"))throw new Error("Special-reading prompt must preserve Hanja context without leaking Korean reading");
}
console.log("Special-reading context checks passed.");


// Dictionary readiness must count two independently selectable questions per valid character.
const dictionarySummary=examReadinessSummary(base);
if(dictionarySummary.DICTIONARY_LOOKUP!==metadata.length*2)throw new Error(`Expected ${metadata.length*2} dictionary variants, got ${dictionarySummary.DICTIONARY_LOOKUP}`);
const dictionaryBlueprint=DAEHAN_FIELD_BLUEPRINTS.PRE4;
const shortages=examRotationShortages({...base,specialReadings:specialReadings.slice(0,2)},dictionaryBlueprint,3);
const specialShortage=shortages.find(x=>x.type==="SPECIAL_READING");
if(!specialShortage||specialShortage.required!==6||specialShortage.available!==2)throw new Error("Special reading three-exam shortage must be reported as 6 required and 2 available");
const recentDictionaryIds=new Set(metadata.map(m=>`radical:${m.hanja_id}`));
for(let run=0;run<40;run++){
 const qs=generateExamQuestions({...base,questionCount:dictionaryBlueprint.questionCount,blueprint:dictionaryBlueprint,recentQuestionKeys:recentDictionaryIds});
 const dictionary=qs.filter(q=>q.type==="DICTIONARY_LOOKUP");
 if(dictionary.length!==1||!dictionary[0].id.startsWith("strokes:"))throw new Error("Dictionary rotation should prefer unasked stroke variants");
}
// The readiness count must exclude variants that cannot form four distinct answers.
const sparseMetadata=metadata.slice(0,3);
const sparseSummary=examReadinessSummary({...base,metadata:sparseMetadata});
if(sparseSummary.DICTIONARY_LOOKUP!==0)throw new Error("Dictionary candidates without three distractors must be excluded");
const limitedPool=pool.slice(0,4);
const limitedSummary=examReadinessSummary({...base,pool:limitedPool});
if(limitedSummary.DICTIONARY_LOOKUP!==8)throw new Error("Dictionary candidates must be limited to eligible grade characters");
// Out-of-grade metadata must never become a generated dictionary question.
const outOfGradeMetadata=[...metadata,{hanja_id:99999,radical:"외부부수",total_strokes:99,formation_type:null}];
const outOfGradeCharacterById=new Map(characterById);
outOfGradeCharacterById.set(99999,"龍");
const outOfGradeSummary=examReadinessSummary({...base,metadata:outOfGradeMetadata});
if(outOfGradeSummary.DICTIONARY_LOOKUP!==metadata.length*2)throw new Error("Out-of-grade metadata must not increase dictionary readiness");
for(let run=0;run<40;run++){
 const qs=generateExamQuestions({...base,metadata:outOfGradeMetadata,characterById:outOfGradeCharacterById,questionCount:dictionaryBlueprint.questionCount,blueprint:dictionaryBlueprint});
 if(qs.some(q=>q.id==="radical:99999"||q.id==="strokes:99999"))throw new Error("Out-of-grade dictionary question generated");
}
console.log("Dictionary variant counting, rotation, and special-reading shortage checks passed.");

const pictureBlueprint={gradeCode:"8",questionCount:1,status:"VERIFIED_108_112" as const,items:[{type:"IMAGE_RECOGNITION" as const,count:1}]};
const pictureQuestions=generateExamQuestions({...base,questionCount:1,blueprint:pictureBlueprint});
if(pictureQuestions.length!==1||!pictureQuestions[0].image)throw new Error("Picture test setup failed");
const picture=pictureQuestions[0];
const missingImage=validateExamQuestions([{...picture,image:undefined}],1,pictureBlueprint);
if(!missingImage.some(x=>x.includes("missing an image")))throw new Error("Picture without image was not rejected");
const leakingAlt=validateExamQuestions([{...picture,image:{...picture.image!,alt:`정답은 ${picture.correct}`}}],1,pictureBlueprint);
if(!leakingAlt.some(x=>x.includes("alt text reveals")))throw new Error("Picture answer leakage through alt text was not rejected");
console.log("Picture image presence and alt-answer leakage validation passed.");
