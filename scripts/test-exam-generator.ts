import {DAEHAN_FIELD_BLUEPRINTS} from "../src/lib/exam-blueprints.ts";
import {generateExamQuestions,validateExamQuestions,examReadinessSummary,fieldExamReadinessIssues,examRotationShortages,type HanjaPoolItem,type PublishedWord} from "../src/lib/exam-generator.ts";

const pool:HanjaPoolItem[]=Array.from({length:80},(_,i)=>({id:i+1,character:String.fromCodePoint(0x4e00+i),answer:`뜻${i+1} 음${i+1}`,examples:[]}));
const words:PublishedWord[]=Array.from({length:80},(_,i)=>({id:i+1,word:i<4?`詞${String.fromCodePoint(0x4e00+i)}`:i>=10&&i<14?`${String.fromCodePoint(0x4e00+i-10)}詞`:`詞${String.fromCodePoint(0x4e00+i)}`,reading:`읽기${i+1}`,meaning:`뜻풀이${i+1}`}));
const characterById=new Map(pool.map(x=>[x.id,x.character]));
const metadata=pool.slice(0,12).map((x,i)=>({hanja_id:x.id,radical:`부수${i}`,total_strokes:i+1,formation_type:["PICTOGRAPH","IDEOGRAPH","COMPOUND_IDEOGRAPH","PHONO_SEMANTIC"][i%4]}));
const relations=Array.from({length:8},(_,i)=>({from_hanja_id:i+1,to_hanja_id:i+21,relation_type:i%2?"SIMILAR":"ANTONYM"}));
const wordRelations=Array.from({length:8},(_,i)=>({from_word_id:i+1,to_word_id:i+21,relation_type:i%2?"SIMILAR":"OPPOSITE"}));
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

const invalidReadiness=examReadinessSummary({
 ...base,
 metadata:[{hanja_id:99999,radical:"부수",total_strokes:3,formation_type:"PICTOGRAPH"},{hanja_id:1,radical:"부수",total_strokes:3,formation_type:"NOT_A_FORMATION"}],
 usageItems:[{id:999,hanja_id:1,prompt:"잘못된 보기",choice_a:"같음",choice_b:"같음",choice_c:"다름",choice_d:"기타",correct_choice:1}],
 specialReadings:[{id:999,hanja_id:99999,reading:"읽기",meaning:"뜻",usage_note:"예",choice_a:"읽기",choice_b:"A",choice_c:"B",choice_d:"C",correct_choice:1}]
});
if(invalidReadiness.CHARACTER_PRINCIPLE!==0)throw new Error("Invalid or out-of-grade formation must not count as ready");
if(invalidReadiness.USAGE_ITEMS!==0)throw new Error("Usage questions with duplicate choices must not count as ready");
if(invalidReadiness.SPECIAL_READINGS!==0)throw new Error("Out-of-grade special reading must not count as ready");
console.log("Invalid principle, usage, and special-reading readiness checks passed.");

const invalidRelations=examReadinessSummary({
 ...base,
 relations:[{from_hanja_id:1,to_hanja_id:99999,relation_type:"SIMILAR"}],
 wordRelations:[{from_word_id:1,to_word_id:99999,relation_type:"SIMILAR"}]
});
if(invalidRelations.RELATIONS!==0)throw new Error("Out-of-grade character relation must not count as ready");
if(invalidRelations.WORD_RELATIONS!==0)throw new Error("Unpublished word relation must not count as ready");
const sparseRelations=examReadinessSummary({
 ...base,pool:pool.slice(0,3),words:words.slice(0,3),
 relations:[{from_hanja_id:1,to_hanja_id:2,relation_type:"SIMILAR"}],
 wordRelations:[{from_word_id:1,to_word_id:2,relation_type:"SIMILAR"}]
});
if(sparseRelations.RELATIONS!==0||sparseRelations.WORD_RELATIONS!==0)throw new Error("Relations without three distractors must not count as ready");
console.log("Relation readiness excludes invalid links and insufficient distractors.");

const invalidStructureCulture=examReadinessSummary({
 ...base,
 wordStructures:[{word_id:99999,structure_type:"SUBJECT_PREDICATE"},{word_id:1,structure_type:"INVALID"}],
 cultureItems:[{id:900,prompt_summary:"중복 보기",choice_a:"A",choice_b:"A",choice_c:"C",choice_d:"D",correct_choice:1}]
});
if(invalidStructureCulture.WORD_STRUCTURES!==0)throw new Error("Invalid or out-of-grade word structures must not count as ready");
if(invalidStructureCulture.CULTURE_CONTENT!==0)throw new Error("Culture items with duplicate choices must not count as ready");
console.log("Word structure and culture readiness invalid-record checks passed.");

const invalidContextReadiness=examReadinessSummary({...base,wordContexts:[{id:999,word_id:99999,sentence:"없는 자료",blank_text:"읽기"}]});
if(invalidContextReadiness.WORD_CONTEXTS!==0||invalidContextReadiness.WORD_CONTEXTS_READING!==0||invalidContextReadiness.WORD_CONTEXTS_HANJA!==0)throw new Error("Orphaned context must not count as ready");
const sparseContextReadiness=examReadinessSummary({...base,words:words.slice(0,3),wordContexts:[{id:999,word_id:1,sentence:"읽기1 사용",blank_text:"읽기1"}]});
if(sparseContextReadiness.WORD_CONTEXTS_READING!==0||sparseContextReadiness.WORD_CONTEXTS_HANJA!==0)throw new Error("Context without three distractors must not count as ready");
console.log("Context reading and Hanja readiness checks passed.");

const invalidCommonReadiness=examReadinessSummary({...base,
 commonCharacterSets:[{id:999,common_hanja_id:99999,word_ids:[1,2],word_hanja_ids:{1:[99999],2:[99999]}}],
 idioms:[{id:999,idiom:"",meaning:"뜻"}]
});
if(invalidCommonReadiness.COMMON_CHARACTER_SETS!==0)throw new Error("Common-character sets with missing target must not count as ready");
if(invalidCommonReadiness.IDIOMS!==0)throw new Error("Idioms without text must not count as ready");
console.log("Common-character and idiom readiness checks passed.");

const invalidRotation=examRotationShortages({...base,wordContexts:[{id:991,word_id:99999,sentence:"잘못된 문장",blank_text:"읽기"}]},DAEHAN_FIELD_BLUEPRINTS["6"],3);
const invalidShared=invalidRotation.find(issue=>issue.type==="CONTEXT_SHARED_POOL");
if(invalidShared&&invalidShared.available!==0)throw new Error("Shared context rotation must exclude orphaned records");
console.log("Shared context rotation excludes unusable records.");

const rotationImages=Array.from({length:9},(_,i)=>({id:100+i,hanja_id:i+1,asset_path:"/exam-images/rotation-"+(i+1)+".svg",alt_text:"그림 "+(i+1)}));
const rotationBlueprint=DAEHAN_FIELD_BLUEPRINTS["8"];
const previousImages=new Set<string>();
for(let session=0;session<3;session++){
 const questions=generateExamQuestions({...base,imageItems:rotationImages,questionCount:rotationBlueprint.questionCount,blueprint:rotationBlueprint,recentQuestionKeys:new Set(previousImages)});
 const errors=validateExamQuestions(questions,rotationBlueprint.questionCount,rotationBlueprint);
 if(errors.length)throw new Error("8급 연속 시험 검증 실패: "+errors.join("; "));
 const images=questions.filter(q=>q.type==="IMAGE_RECOGNITION");
 if(images.length!==3)throw new Error("8급 그림 문제 3개 출제 실패");
 for(const item of images){
  if(previousImages.has(item.id))throw new Error("그림 문제 조기 반복: "+item.id);
  previousImages.add(item.id);
 }
}
if(previousImages.size!==9)throw new Error("3회 시험의 그림 문제 9개가 서로 달라야 함");
console.log("8급 3회 연속 시험 그림 문제 회전 검증 완료");

const invalidHanjaReadiness=examReadinessSummary({...base,pool:[
 {id:90001,character:"-",answer:"잘못된 문자",examples:[]},
 {id:90002,character:"山",answer:" ",examples:[]},
 {id:90003,character:"水",answer:"물 수",examples:[]}
]});
if(invalidHanjaReadiness.HANJA_READING!==1)throw new Error("Hanja readiness must exclude invalid characters and missing answers");
console.log("Hanja pool readiness validation passed.");

const sharedHanjaBlueprint=DAEHAN_FIELD_BLUEPRINTS["8"];
const smallHanjaPool=pool.slice(0,30);
const sharedHanjaIssues=examRotationShortages({...base,pool:smallHanjaPool},sharedHanjaBlueprint,3);
const sharedHanjaIssue=sharedHanjaIssues.find(issue=>issue.type==="HANJA_SHARED_POOL");
if(!sharedHanjaIssue||sharedHanjaIssue.required!==45||sharedHanjaIssue.available!==30)throw new Error("Shared Hanja pool shortage must account for both reading directions");
console.log("Shared Hanja pool rotation shortage validated.");

for(const [gradeCode,blueprint] of Object.entries(DAEHAN_FIELD_BLUEPRINTS)){
 for(let run=0;run<100;run++){
  const questions=generateExamQuestions({...base,questionCount:blueprint.questionCount,blueprint});
  const hanjaIds=questions.filter(q=>q.id.startsWith("hanja-forward:")||q.id.startsWith("hanja-reverse:")).map(q=>q.id.split(":").at(-1));
  if(new Set(hanjaIds).size!==hanjaIds.length)throw new Error(gradeCode+": same Hanja appeared in both question directions");
 }
}
console.log("Cross-type Hanja uniqueness verified across 100 runs per grade.");

for(const [gradeCode,blueprint] of Object.entries(DAEHAN_FIELD_BLUEPRINTS)){
 for(let run=0;run<100;run++){
  const questions=generateExamQuestions({...base,questionCount:blueprint.questionCount,blueprint});
  const contextIds=questions.filter(q=>q.id.startsWith("context-reading:")||q.id.startsWith("context-hanja:")).map(q=>q.id.split(":").at(-1));
  if(new Set(contextIds).size!==contextIds.length)throw new Error(gradeCode+": same context used in both question types");
 }
}
console.log("Cross-type context uniqueness verified across 100 runs per grade.");

const sharedWordBlueprint=DAEHAN_FIELD_BLUEPRINTS["8"];
const wordDemand=sharedWordBlueprint.items.filter(x=>["WORD_READING","WORD_MEANING","WORD_TO_HANJA"].includes(x.type)).reduce((sum,x)=>sum+x.count,0);
const sharedWordIssues=examRotationShortages({...base,words:words.slice(0,wordDemand)},sharedWordBlueprint,3);
const sharedWordIssue=sharedWordIssues.find(x=>x.type==="WORD_SHARED_POOL");
if(!sharedWordIssue||sharedWordIssue.required!==wordDemand*3||sharedWordIssue.available!==wordDemand)throw new Error("Shared word shortage must sum word question types across three exams");
console.log("Shared word pool demand regression passed.");

const priorityGrades=["5","PRE4","4","PRE3","3"] as const;
for(const grade of priorityGrades){
 const blueprint=DAEHAN_FIELD_BLUEPRINTS[grade];
 const expected=blueprint.items.reduce((sum,item)=>sum+item.count,0);
 if(expected!==50||blueprint.questionCount!==50)throw new Error(grade+": official blueprint must total 50 questions");
 for(let attempt=0;attempt<100;attempt++){
  const questions=generateExamQuestions({...base,questionCount:50,blueprint});
  const issues=validateExamQuestions(questions,50,blueprint);
  if(issues.length)throw new Error(grade+": priority exam validation failed: "+issues.join("; "));
  const ids=questions.filter(q=>q.id.startsWith("hanja-forward:")||q.id.startsWith("hanja-reverse:")).map(q=>q.id.split(":").at(-1));
  if(ids.length!==new Set(ids).size)throw new Error(grade+": repeated Hanja within exam");
  const contexts=questions.filter(q=>q.id.startsWith("context-reading:")||q.id.startsWith("context-hanja:")).map(q=>q.id.split(":").at(-1));
  if(contexts.length!==new Set(contexts).size)throw new Error(grade+": repeated context within exam");
 }
 console.log(grade+": 100 priority mock exams passed blueprint and uniqueness checks");
}

const gradeFiveBlueprint=DAEHAN_FIELD_BLUEPRINTS["5"];
const gradeFiveRelationDemand=gradeFiveBlueprint.items.filter(item=>item.type==="WORD_SYNONYM_ANTONYM").reduce((sum,item)=>sum+item.count,0);
const gradeFiveRelationIssues=examRotationShortages({...base,wordRelations:wordRelations.slice(0,5)},gradeFiveBlueprint,3);
const gradeFiveRelationIssue=gradeFiveRelationIssues.find(issue=>issue.type==="WORD_SYNONYM_ANTONYM");
if(gradeFiveRelationDemand!==2||!gradeFiveRelationIssue||gradeFiveRelationIssue.required!==6||gradeFiveRelationIssue.available!==5)throw new Error("Grade 5 must flag five word relations as insufficient for three nonrepeating exams");
console.log("Grade 5 word relation rotation shortage verified.");

for(const grade of ["5","PRE4","4","PRE3","3"] as const){
 const blueprint=DAEHAN_FIELD_BLUEPRINTS[grade];
 for(let attempt=0;attempt<100;attempt++){
  const questions=generateExamQuestions({...base,questionCount:50,blueprint});
  const wordIds=questions.filter(q=>q.id.startsWith("word-reading:")||q.id.startsWith("word-hanja:")||q.id.startsWith("word-meaning:")).map(q=>q.id.split(":").at(-1));
  if(wordIds.length!==new Set(wordIds).size)throw new Error(grade+": same word appears across reading, meaning and Hanja questions");
 }
}
console.log("Priority grade word question source uniqueness passed.");

const priorityRelationCandidates=[["5",5],["PRE4",7],["4",13],["PRE3",15],["3",20]] as const;
for(const [grade,available] of priorityRelationCandidates){
 const blueprint=DAEHAN_FIELD_BLUEPRINTS[grade];
 const issues=examRotationShortages({...base,wordRelations:wordRelations.slice(0,Math.min(available,wordRelations.length))},blueprint,3);
 const shortage=issues.find(issue=>issue.type==="WORD_SYNONYM_ANTONYM");
 if(grade==="5"&&!shortage)throw new Error("Grade 5 relation bank must flag three-exam shortage");
 if(grade!=="5"&&shortage)throw new Error(grade+": relation bank unexpectedly insufficient for three exams");
}
console.log("Priority grade word-relation coverage thresholds passed.");

const invalidWordRelation={from_word_id:1,to_word_id:21,relation_type:"RELATED"};
const invalidWordRelationInput={...base,wordRelations:[invalidWordRelation]};
if(examReadinessSummary(invalidWordRelationInput).WORD_RELATIONS!==0)throw new Error("Unsupported word relation must not be counted as exam ready");
for(const grade of ["5","PRE4","4","PRE3","3"] as const){
 const blueprint=DAEHAN_FIELD_BLUEPRINTS[grade];
 const questions=generateExamQuestions({...invalidWordRelationInput,questionCount:50,blueprint});
 if(questions.some(q=>q.id.startsWith("word-relation:RELATED:")))throw new Error(grade+": unsupported relation emitted as antonym");
}
console.log("Unsupported relation type rejection passed.");

const alternateWordRelations=[...wordRelations,{from_word_id:1,to_word_id:22,relation_type:"OPPOSITE"}];
for(let attempt=0;attempt<100;attempt++){
 const questions=generateExamQuestions({...base,wordRelations:alternateWordRelations,questionCount:50,blueprint:DAEHAN_FIELD_BLUEPRINTS["5"]});
 for(const q of questions.filter(q=>q.id.startsWith("word-relation:OPPOSITE:1:"))){
  const alternative=words.find(w=>w.id===(q.correct===words[20].word?22:21))?.word;
  if(alternative&&q.choices.includes(alternative))throw new Error("Alternative correct relation answer included as distractor");
 }
}
console.log("Alternate relation answers excluded from distractors.");

const limitedRelationWords=words.slice(0,3).concat(words.slice(20,22));
const ambiguousRelations=[{from_word_id:1,to_word_id:21,relation_type:"SIMILAR"},{from_word_id:1,to_word_id:22,relation_type:"SIMILAR"}];
const ambiguousReadiness=examReadinessSummary({...base,words:limitedRelationWords,wordRelations:ambiguousRelations});
if(ambiguousReadiness.WORD_RELATIONS!==0)throw new Error("Relation readiness must reject records without three non-answer distractors");
console.log("Word relation readiness and distractor eligibility agree.");

const gradeFiveExpandedRelations=[...wordRelations.slice(0,5),{from_word_id:6,to_word_id:26,relation_type:"SIMILAR"}];
const expandedFiveIssues=examRotationShortages({...base,wordRelations:gradeFiveExpandedRelations},DAEHAN_FIELD_BLUEPRINTS["5"],3);
if(expandedFiveIssues.some(issue=>issue.type==="WORD_SYNONYM_ANTONYM"))throw new Error("Six distinct grade 5 relations should satisfy three two-question exams");
console.log("Grade 5 relation expansion threshold verified.");

const expandedFiveRecent:string[]=[];
for(let exam=0;exam<3;exam++){
 const questions=generateExamQuestions({...base,wordRelations:gradeFiveExpandedRelations,questionCount:50,blueprint:DAEHAN_FIELD_BLUEPRINTS["5"],recentQuestionKeys:new Set(expandedFiveRecent)});
 const relations=questions.filter(q=>q.id.startsWith("word-relation:"));
 if(relations.length!==2)throw new Error("Grade 5 relation expansion must generate two relation questions per exam");
 for(const q of relations){
  if(expandedFiveRecent.includes(q.id))throw new Error("Grade 5 relation expansion reused a relation across three exams");
  expandedFiveRecent.push(q.id);
 }
}
console.log("Grade 5 six distinct relations generate three nonrepeating exams.");


const nonHanjaRelationInput={...base,words:[{...words[0],word:"가나다"},...words.slice(1,3),...words.slice(20,23)],wordRelations:[{from_word_id:1,to_word_id:21,relation_type:"SIMILAR"}]};
if(examReadinessSummary(nonHanjaRelationInput).WORD_RELATIONS!==0)throw new Error("Non-Hanja source must not count as relation ready");
const nonHanjaAnswerInput={...nonHanjaRelationInput,words:[words[0],...words.slice(1,3),{...words[20],word:"가나다"},...words.slice(21,23)]};
if(examReadinessSummary(nonHanjaAnswerInput).WORD_RELATIONS!==0)throw new Error("Non-Hanja answer must not count as relation ready");
console.log("Relation readiness rejects non-Hanja source and answer.");

const sameStemRelations=[...wordRelations,{from_word_id:1,to_word_id:22,relation_type:"OPPOSITE"}];
for(let attempt=0;attempt<100;attempt++){
 const questions=generateExamQuestions({...base,wordRelations:sameStemRelations,questionCount:50,blueprint:DAEHAN_FIELD_BLUEPRINTS["5"]});
 const seen=new Set<string>();
 for(const q of questions.filter(q=>q.id.startsWith("word-relation:"))){
  const key=q.stem+"|"+q.prompt;
  if(seen.has(key))throw new Error("Repeated source and relation type in the same mock exam");
  seen.add(key);
 }
}
console.log("Relation questions avoid duplicate source/type prompts.");
