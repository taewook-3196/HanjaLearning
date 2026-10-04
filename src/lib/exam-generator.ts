import type { ExamBlueprint } from "@/lib/exam-blueprints";

export type ExampleWord={word:string;reading:string|null;meaning:string;child_explanation:string|null};
export type ExamQuestion={id:string;stem:string;prompt:string;correct:string;choices:string[];examples:ExampleWord[]};
export type HanjaPoolItem={id:number;character:string;answer:string;examples:ExampleWord[]};
export type PublishedWord={id:number;word:string;reading:string|null;meaning:string;child_explanation?:string|null};
export type Relation={from_hanja_id:number;to_hanja_id:number;relation_type:string};
export type Metadata={hanja_id:number;radical:string|null;total_strokes:number|null;formation_type:string|null};


export function validateExamQuestions(questions:ExamQuestion[],expectedCount:number){
 const errors:string[]=[];
 if(questions.length!==expectedCount)errors.push(`expected ${expectedCount} questions, got ${questions.length}`);
 const ids=new Set<string>();
 questions.forEach((q,index)=>{
  const label=`question ${index+1}`;
  if(ids.has(q.id))errors.push(`${label}: duplicate id ${q.id}`); else ids.add(q.id);
  if(!q.stem.trim())errors.push(`${label}: empty stem`);
  if(!q.prompt.trim())errors.push(`${label}: empty prompt`);
  if(q.choices.length!==4)errors.push(`${label}: expected 4 choices, got ${q.choices.length}`);
  if(new Set(q.choices).size!==q.choices.length)errors.push(`${label}: duplicate choices`);
  if(!q.choices.includes(q.correct))errors.push(`${label}: correct answer is missing from choices`);
 });
 return errors;
}

export function shuffle<T>(items:T[]):T[]{const a=[...items];for(let n=a.length-1;n>0;n--){const j=Math.floor(Math.random()*(n+1));[a[n],a[j]]=[a[j],a[n]]}return a}

const formationLabels:Record<string,string>={PICTOGRAPH:"상형",IDEOGRAPH:"지사",COMPOUND_IDEOGRAPH:"회의",PHONO_SEMANTIC:"형성",LOAN:"가차",DERIVATIVE:"전주"};

export function generateExamQuestions(args:{pool:HanjaPoolItem[];words:PublishedWord[];relations:Relation[];metadata:Metadata[];characterById:Map<number,string>;questionCount:number;blueprint?:ExamBlueprint}):ExamQuestion[]{
 const {pool,words,relations,metadata,characterById,questionCount,blueprint}=args;
 const forwardCount=blueprint?.items.filter(x=>x.type==="HANJA_TO_READING_MEANING").reduce((n,x)=>n+x.count,0)??0;
 const reverseCount=blueprint?.items.filter(x=>x.type==="READING_MEANING_TO_HANJA").reduce((n,x)=>n+x.count,0)??0;
 const wordReadingCount=blueprint?.items.filter(x=>x.type==="WORD_READING").reduce((n,x)=>n+x.count,0)??0;
 const wordHanjaCount=blueprint?.items.filter(x=>x.type==="WORD_TO_HANJA").reduce((n,x)=>n+x.count,0)??0;
 const relationCount=blueprint?.items.filter(x=>x.type==="SYNONYM_ANTONYM").reduce((n,x)=>n+x.count,0)??0;
 const metadataCount=blueprint?.items.filter(x=>x.type==="DICTIONARY_LOOKUP"||x.type==="CHARACTER_PRINCIPLE").reduce((n,x)=>n+x.count,0)??0;
 const forward=(items:HanjaPoolItem[],count:number)=>shuffle(items).slice(0,count).map(x=>{const wrong=[...new Set(shuffle(pool.filter(y=>y.id!==x.id&&y.answer!==x.answer)).map(y=>y.answer))].slice(0,3);return{id:`hanja-forward:${x.id}`,stem:x.character,prompt:"알맞은 뜻과 소리를 고르세요.",correct:x.answer,choices:shuffle([x.answer,...wrong]),examples:x.examples}}).filter(x=>x.choices.length===4);
 const reverse=(items:HanjaPoolItem[],count:number)=>shuffle(items).slice(0,count).map(x=>{const wrong=[...new Set(shuffle(pool.filter(y=>y.id!==x.id&&y.character!==x.character)).map(y=>y.character))].slice(0,3);return{id:`hanja-reverse:${x.id}`,stem:x.answer,prompt:"뜻과 소리에 맞는 한자를 고르세요.",correct:x.character,choices:shuffle([x.character,...wrong]),examples:x.examples}}).filter(x=>x.choices.length===4);
 if(!blueprint)return forward(pool,questionCount);
 const first=forward(pool,forwardCount),usedHanjaIds=new Set(first.map(q=>Number(q.id.split(":").at(-1)))),second=reverse(pool.filter(x=>!usedHanjaIds.has(x.id)),reverseCount);
 if(first.length!==forwardCount||second.length!==reverseCount)return[];
 const goodWords=words.filter(w=>w.word&&w.reading&&w.meaning);
 const wordReading=goodWords.length<4?[]:shuffle(goodWords).slice(0,wordReadingCount).map(w=>{const wrong=[...new Set(shuffle(goodWords.filter(x=>x.id!==w.id&&x.reading!==w.reading)).map(x=>x.reading).filter((x):x is string=>Boolean(x)))].slice(0,3);return{id:`word-reading:${w.id}`,stem:w.word,prompt:"이 한자어를 바르게 읽은 것을 고르세요.",correct:w.reading!,choices:shuffle([w.reading!,...wrong]),examples:[]}}).filter(q=>q.choices.length===4);
 const wordHanja=goodWords.length<4?[]:shuffle(goodWords).slice(0,wordHanjaCount).map(w=>{const wrong=[...new Set(shuffle(goodWords.filter(x=>x.id!==w.id&&x.word!==w.word)).map(x=>x.word))].slice(0,3);return{id:`word-hanja:${w.id}`,stem:`${w.reading} · ${w.meaning}`,prompt:"뜻과 읽기에 맞는 한자어를 고르세요.",correct:w.word,choices:shuffle([w.word,...wrong]),examples:[]}}).filter(q=>q.choices.length===4);
 const relationQs=shuffle(relations).filter(r=>characterById.has(r.from_hanja_id)&&characterById.has(r.to_hanja_id)).slice(0,relationCount).map(r=>{const stem=characterById.get(r.from_hanja_id)!,correct=characterById.get(r.to_hanja_id)!;const wrong=[...new Set(shuffle(pool.filter(x=>x.character!==stem&&x.character!==correct)).map(x=>x.character))].slice(0,3);return{id:`relation:${r.relation_type}:${r.from_hanja_id}:${r.to_hanja_id}`,stem,prompt:`이 한자의 ${r.relation_type==="SIMILAR"?"유의자":"반의자"}를 고르세요.`,correct,choices:shuffle([correct,...wrong]),examples:[]}}).filter(q=>q.choices.length===4);
 const metadataQs:ExamQuestion[]=[];for(const m of shuffle(metadata)){if(metadataQs.length>=metadataCount)break;const stem=characterById.get(m.hanja_id);if(!stem)continue;if(m.total_strokes){const nums=[...new Set(metadata.map(x=>x.total_strokes).filter((x):x is number=>typeof x==="number"&&x!==m.total_strokes))];if(nums.length>=3){const correct=`${m.total_strokes}획`;metadataQs.push({id:`strokes:${m.hanja_id}`,stem,prompt:"이 한자의 총획으로 알맞은 것을 고르세요.",correct,choices:shuffle([correct,...shuffle(nums).slice(0,3).map(x=>`${x}획`)]),examples:[]});continue}}if(m.formation_type&&formationLabels[m.formation_type]){const correct=formationLabels[m.formation_type],wrong=shuffle(Object.entries(formationLabels).filter(([k])=>k!==m.formation_type).map(([,v])=>v)).slice(0,3);metadataQs.push({id:`formation:${m.hanja_id}`,stem,prompt:"이 한자의 만들어진 원리로 알맞은 것을 고르세요.",correct,choices:shuffle([correct,...wrong]),examples:[]})}}
 const buckets:Partial<Record<string,ExamQuestion[]>>={
  HANJA_TO_READING_MEANING:[...first],
  READING_MEANING_TO_HANJA:[...second],
  WORD_READING:[...wordReading],
  WORD_TO_HANJA:[...wordHanja],
  SYNONYM_ANTONYM:[...relationQs],
  CHARACTER_PRINCIPLE:[...metadataQs],
  DICTIONARY_LOOKUP:[]
 };
 const supported:ExamQuestion[]=[];
 for(const item of blueprint.items){
  const bucket=buckets[item.type]??[];
  supported.push(...bucket.splice(0,item.count));
 }
 const usedHanja=new Set([...first,...second].map(q=>Number(q.id.split(":").at(-1))));for(const r of relationQs){const parts=r.id.split(":");usedHanja.add(Number(parts.at(-2)));usedHanja.add(Number(parts.at(-1)))}for(const m of metadataQs)usedHanja.add(Number(m.id.split(":").at(-1)));const remainingPool=pool.filter(x=>!usedHanja.has(x.id));
 return [...supported,...forward(remainingPool,questionCount-supported.length)];
}
