import type { ExamBlueprint } from "@/lib/exam-blueprints";

export type ExampleWord={word:string;reading:string|null;meaning:string;child_explanation:string|null};
export type ExamQuestion={id:string;stem:string;prompt:string;correct:string;choices:string[];examples:ExampleWord[]};
export type HanjaPoolItem={id:number;character:string;answer:string;examples:ExampleWord[]};
export type PublishedWord={id:number;word:string;reading:string|null;meaning:string;child_explanation?:string|null};
export type Relation={from_hanja_id:number;to_hanja_id:number;relation_type:string};
export type WordRelation={from_word_id:number;to_word_id:number;relation_type:string};
export type Metadata={hanja_id:number;radical:string|null;total_strokes:number|null;formation_type:string|null};
export type WordContext={id:number;word_id:number;sentence:string;blank_text:string};
export type WordStructure={word_id:number;structure_type:string};
export type CommonCharacterSet={id:number;common_hanja_id:number;word_ids:number[]};
export type Idiom={id:number;idiom:string;reading:string|null;meaning:string;child_explanation:string|null};
export type CultureItem={id:number;prompt_summary:string;choice_a:string;choice_b:string;choice_c:string;choice_d:string;correct_choice:number};


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

export function generateExamQuestions(args:{pool:HanjaPoolItem[];words:PublishedWord[];relations:Relation[];wordRelations:WordRelation[];metadata:Metadata[];wordContexts:WordContext[];wordStructures:WordStructure[];commonCharacterSets:CommonCharacterSet[];idioms:Idiom[];cultureItems:CultureItem[];characterById:Map<number,string>;questionCount:number;blueprint?:ExamBlueprint}):ExamQuestion[]{
 const {pool,words,relations,wordRelations,metadata,wordContexts,wordStructures,commonCharacterSets,idioms,cultureItems,characterById,questionCount,blueprint}=args;
 const forwardCount=blueprint?.items.filter(x=>x.type==="HANJA_TO_READING_MEANING").reduce((n,x)=>n+x.count,0)??0;
 const reverseCount=blueprint?.items.filter(x=>x.type==="READING_MEANING_TO_HANJA").reduce((n,x)=>n+x.count,0)??0;
 const wordReadingCount=blueprint?.items.filter(x=>x.type==="WORD_READING").reduce((n,x)=>n+x.count,0)??0;
 const wordHanjaCount=blueprint?.items.filter(x=>x.type==="WORD_TO_HANJA").reduce((n,x)=>n+x.count,0)??0;
 const wordMeaningCount=blueprint?.items.filter(x=>x.type==="WORD_MEANING").reduce((n,x)=>n+x.count,0)??0;
 const relationCount=blueprint?.items.filter(x=>x.type==="CHAR_SYNONYM_ANTONYM").reduce((n,x)=>n+x.count,0)??0;
 const wordRelationCount=blueprint?.items.filter(x=>x.type==="WORD_SYNONYM_ANTONYM").reduce((n,x)=>n+x.count,0)??0;
 const principleCount=blueprint?.items.filter(x=>x.type==="CHARACTER_PRINCIPLE").reduce((n,x)=>n+x.count,0)??0;
 const dictionaryCount=blueprint?.items.filter(x=>x.type==="DICTIONARY_LOOKUP").reduce((n,x)=>n+x.count,0)??0;
 const contextReadingCount=blueprint?.items.filter(x=>x.type==="CONTEXT_READING").reduce((n,x)=>n+x.count,0)??0;
 const contextHanjaCount=blueprint?.items.filter(x=>x.type==="CONTEXT_TO_HANJA").reduce((n,x)=>n+x.count,0)??0;
 const structureCount=blueprint?.items.filter(x=>x.type==="WORD_STRUCTURE").reduce((n,x)=>n+x.count,0)??0;
 const commonCount=blueprint?.items.filter(x=>x.type==="COMMON_CHARACTER").reduce((n,x)=>n+x.count,0)??0;
 const idiomCount=blueprint?.items.filter(x=>x.type==="IDIOM").reduce((n,x)=>n+x.count,0)??0;
 const cultureCount=blueprint?.items.filter(x=>x.type==="CULTURE_ETIQUETTE").reduce((n,x)=>n+x.count,0)??0;
 const forward=(items:HanjaPoolItem[],count:number)=>shuffle(items).slice(0,count).map(x=>{const wrong=[...new Set(shuffle(pool.filter(y=>y.id!==x.id&&y.answer!==x.answer)).map(y=>y.answer))].slice(0,3);return{id:`hanja-forward:${x.id}`,stem:x.character,prompt:"알맞은 뜻과 소리를 고르세요.",correct:x.answer,choices:shuffle([x.answer,...wrong]),examples:x.examples}}).filter(x=>x.choices.length===4);
 const reverse=(items:HanjaPoolItem[],count:number)=>shuffle(items).slice(0,count).map(x=>{const wrong=[...new Set(shuffle(pool.filter(y=>y.id!==x.id&&y.character!==x.character)).map(y=>y.character))].slice(0,3);return{id:`hanja-reverse:${x.id}`,stem:x.answer,prompt:"뜻과 소리에 맞는 한자를 고르세요.",correct:x.character,choices:shuffle([x.character,...wrong]),examples:x.examples}}).filter(x=>x.choices.length===4);
 if(!blueprint)return forward(pool,questionCount);
 const first=forward(pool,forwardCount),usedHanjaIds=new Set(first.map(q=>Number(q.id.split(":").at(-1)))),second=reverse(pool.filter(x=>!usedHanjaIds.has(x.id)),reverseCount);
 if(first.length!==forwardCount||second.length!==reverseCount)return[];
 const goodWords=words.filter(w=>w.word&&w.reading&&w.meaning);
 const wordReading=goodWords.length<4?[]:shuffle(goodWords).slice(0,wordReadingCount).map(w=>{const wrong=[...new Set(shuffle(goodWords.filter(x=>x.id!==w.id&&x.reading!==w.reading)).map(x=>x.reading).filter((x):x is string=>Boolean(x)))].slice(0,3);return{id:`word-reading:${w.id}`,stem:w.word,prompt:"이 한자어를 바르게 읽은 것을 고르세요.",correct:w.reading!,choices:shuffle([w.reading!,...wrong]),examples:[]}}).filter(q=>q.choices.length===4);
 const wordHanja=goodWords.length<4?[]:shuffle(goodWords).slice(0,wordHanjaCount).map(w=>{const wrong=[...new Set(shuffle(goodWords.filter(x=>x.id!==w.id&&x.word!==w.word)).map(x=>x.word))].slice(0,3);return{id:`word-hanja:${w.id}`,stem:`${w.reading} · ${w.meaning}`,prompt:"뜻과 읽기에 맞는 한자어를 고르세요.",correct:w.word,choices:shuffle([w.word,...wrong]),examples:[]}}).filter(q=>q.choices.length===4);
 const wordMeaning=goodWords.length<4?[]:shuffle(goodWords).filter(w=>{const meanings=new Set(goodWords.filter(x=>x.id!==w.id&&x.meaning!==w.meaning).map(x=>x.meaning));return meanings.size>=3}).slice(0,wordMeaningCount).map(w=>{const wrong=[...new Set(shuffle(goodWords.filter(x=>x.id!==w.id&&x.meaning!==w.meaning)).map(x=>x.meaning))].slice(0,3);return{id:`word-meaning:${w.id}`,stem:w.word,prompt:"이 한자어의 뜻으로 알맞은 것을 고르세요.",correct:w.meaning,choices:shuffle([w.meaning,...wrong]),examples:[]}}).filter(q=>q.choices.length===4);
 const relationQs=shuffle(relations).filter(r=>characterById.has(r.from_hanja_id)&&characterById.has(r.to_hanja_id)).slice(0,relationCount).map(r=>{const stem=characterById.get(r.from_hanja_id)!,correct=characterById.get(r.to_hanja_id)!;const wrong=[...new Set(shuffle(pool.filter(x=>x.character!==stem&&x.character!==correct)).map(x=>x.character))].slice(0,3);return{id:`relation:${r.relation_type}:${r.from_hanja_id}:${r.to_hanja_id}`,stem,prompt:`이 한자의 ${r.relation_type==="SIMILAR"?"유의자":"반의자"}를 고르세요.`,correct,choices:shuffle([correct,...wrong]),examples:[]}}).filter(q=>q.choices.length===4);
 const wordById=new Map(goodWords.map(w=>[w.id,w]));const wordRelationQs=shuffle(wordRelations).filter(r=>wordById.has(r.from_word_id)&&wordById.has(r.to_word_id)).slice(0,wordRelationCount).map(r=>{const from=wordById.get(r.from_word_id)!,to=wordById.get(r.to_word_id)!;const wrong=[...new Set(shuffle(goodWords.filter(w=>w.id!==from.id&&w.id!==to.id&&w.word!==to.word)).map(w=>w.word))].slice(0,3);return{id:`word-relation:${r.relation_type}:${r.from_word_id}:${r.to_word_id}`,stem:from.word,prompt:`이 한자어의 ${r.relation_type==="SIMILAR"?"유의어":"반의어"}를 고르세요.`,correct:to.word,choices:shuffle([to.word,...wrong]),examples:[]}}).filter(q=>q.choices.length===4);
 const contextReadingQs=shuffle(wordContexts).filter(ctx=>wordById.has(ctx.word_id)&&Boolean(wordById.get(ctx.word_id)?.reading)).slice(0,contextReadingCount).map(ctx=>{const w=wordById.get(ctx.word_id)!;const wrong=[...new Set(shuffle(goodWords.filter(x=>x.id!==w.id&&x.reading!==w.reading)).map(x=>x.reading).filter((x):x is string=>Boolean(x)))].slice(0,3);return{id:`context-reading:${ctx.id}`,stem:ctx.sentence,prompt:"밑줄 친 한자어를 바르게 읽은 것을 고르세요.",correct:w.reading!,choices:shuffle([w.reading!,...wrong]),examples:[]}}).filter(q=>q.choices.length===4);
 const contextHanjaQs=shuffle(wordContexts).filter(ctx=>wordById.has(ctx.word_id)).slice(0,contextHanjaCount).map(ctx=>{const w=wordById.get(ctx.word_id)!;const wrong=[...new Set(shuffle(goodWords.filter(x=>x.id!==w.id&&x.word!==w.word)).map(x=>x.word))].slice(0,3);return{id:`context-hanja:${ctx.id}`,stem:ctx.sentence,prompt:"문맥에 알맞은 한자어를 고르세요.",correct:w.word,choices:shuffle([w.word,...wrong]),examples:[]}}).filter(q=>q.choices.length===4);
 const structureLabels:Record<string,string>={SUBJECT_PREDICATE:"주술 관계",VERB_OBJECT:"술목 관계",MODIFIER_HEAD:"수식 관계",PARALLEL:"병렬 관계",OTHER:"기타 관계"};
 const structureQs=shuffle(wordStructures).filter(s=>wordById.has(s.word_id)&&Boolean(structureLabels[s.structure_type])).slice(0,structureCount).map(s=>{const w=wordById.get(s.word_id)!,correct=structureLabels[s.structure_type];const wrong=shuffle(Object.entries(structureLabels).filter(([k])=>k!==s.structure_type&&k!=="OTHER").map(([,v])=>v)).slice(0,3);return{id:`word-structure:${s.word_id}`,stem:w.word,prompt:"이 한자어의 짜임으로 알맞은 것을 고르세요.",correct,choices:shuffle([correct,...wrong]),examples:[]}}).filter(q=>q.choices.length===4);
 const commonQs=shuffle(commonCharacterSets).slice(0,commonCount).map(set=>{const correct=characterById.get(set.common_hanja_id),setWords=set.word_ids.map(id=>wordById.get(id)?.word).filter((x):x is string=>Boolean(x));if(!correct||setWords.length<2)return null;const wrong=[...new Set(shuffle(pool.filter(x=>x.id!==set.common_hanja_id&&x.character!==correct)).map(x=>x.character))].slice(0,3);return{id:`common-character:${set.id}`,stem:setWords.join(" · "),prompt:"이 한자어들에 공통으로 들어가는 한자를 고르세요.",correct,choices:shuffle([correct,...wrong]),examples:[]}}).filter((q):q is ExamQuestion=>Boolean(q)&&q.choices.length===4);
 const goodIdioms=idioms.filter(i=>i.idiom&&i.meaning);const idiomQs=goodIdioms.length<4?[]:shuffle(goodIdioms).filter(i=>new Set(goodIdioms.filter(x=>x.id!==i.id&&x.meaning!==i.meaning).map(x=>x.meaning)).size>=3).slice(0,idiomCount).map(i=>{const wrong=[...new Set(shuffle(goodIdioms.filter(x=>x.id!==i.id&&x.meaning!==i.meaning)).map(x=>x.meaning))].slice(0,3);return{id:`idiom:${i.id}`,stem:i.idiom,prompt:"이 사자성어의 뜻으로 알맞은 것을 고르세요.",correct:i.meaning,choices:shuffle([i.meaning,...wrong]),examples:[]}}).filter(q=>q.choices.length===4);
 const cultureQs=shuffle(cultureItems).slice(0,cultureCount).map(i=>{const choices=[i.choice_a,i.choice_b,i.choice_c,i.choice_d];const correct=choices[i.correct_choice-1];return{id:`culture:${i.id}`,stem:i.prompt_summary,prompt:"알맞은 답을 고르세요.",correct,choices,examples:[]}}).filter(q=>Boolean(q.correct)&&q.choices.length===4&&new Set(q.choices).size===4);
 const principleQs:ExamQuestion[]=[];for(const m of shuffle(metadata.filter(x=>Boolean(x.formation_type)))){if(principleQs.length>=principleCount)break;const stem=characterById.get(m.hanja_id),correct=m.formation_type?formationLabels[m.formation_type]:undefined;if(!stem||!correct)continue;const wrong=shuffle(Object.entries(formationLabels).filter(([k])=>k!==m.formation_type).map(([,v])=>v)).slice(0,3);if(wrong.length===3)principleQs.push({id:`formation:${m.hanja_id}`,stem,prompt:"이 한자의 만들어진 원리로 알맞은 것을 고르세요.",correct,choices:shuffle([correct,...wrong]),examples:[]})}
 const dictionaryQs:ExamQuestion[]=[];for(const m of shuffle(metadata.filter(x=>Boolean(x.radical)||typeof x.total_strokes==="number"))){if(dictionaryQs.length>=dictionaryCount)break;const stem=characterById.get(m.hanja_id);if(!stem)continue;if(m.radical){const radicals=[...new Set(metadata.map(x=>x.radical).filter((x):x is string=>Boolean(x)&&x!==m.radical))];if(radicals.length>=3){dictionaryQs.push({id:`radical:${m.hanja_id}`,stem,prompt:"이 한자의 부수로 알맞은 것을 고르세요.",correct:m.radical,choices:shuffle([m.radical,...shuffle(radicals).slice(0,3)]),examples:[]});continue}}if(typeof m.total_strokes==="number"){const nums=[...new Set(metadata.map(x=>x.total_strokes).filter((x):x is number=>typeof x==="number"&&x!==m.total_strokes))];if(nums.length>=3){const correct=`${m.total_strokes}획`;dictionaryQs.push({id:`strokes:${m.hanja_id}`,stem,prompt:"이 한자의 총획으로 알맞은 것을 고르세요.",correct,choices:shuffle([correct,...shuffle(nums).slice(0,3).map(x=>`${x}획`)]),examples:[]})}}}
 const buckets:Partial<Record<string,ExamQuestion[]>>={
  HANJA_TO_READING_MEANING:[...first],
  READING_MEANING_TO_HANJA:[...second],
  WORD_READING:[...wordReading],
  WORD_TO_HANJA:[...wordHanja],
  WORD_MEANING:[...wordMeaning],
  CHAR_SYNONYM_ANTONYM:[...relationQs],
  WORD_SYNONYM_ANTONYM:[...wordRelationQs],
  CHARACTER_PRINCIPLE:[...principleQs],
  DICTIONARY_LOOKUP:[...dictionaryQs],
  CONTEXT_READING:[...contextReadingQs],
  CONTEXT_TO_HANJA:[...contextHanjaQs],
  WORD_STRUCTURE:[...structureQs],
  COMMON_CHARACTER:[...commonQs],
  IDIOM:[...idiomQs],
  CULTURE_ETIQUETTE:[...cultureQs]
 };
 const supported:ExamQuestion[]=[];
 for(const item of blueprint.items){
  const bucket=buckets[item.type]??[];
  supported.push(...bucket.splice(0,item.count));
 }
 const usedHanja=new Set([...first,...second].map(q=>Number(q.id.split(":").at(-1))));for(const r of relationQs){const parts=r.id.split(":");usedHanja.add(Number(parts.at(-2)));usedHanja.add(Number(parts.at(-1)))}for(const m of [...principleQs,...dictionaryQs])usedHanja.add(Number(m.id.split(":").at(-1)));const remainingPool=pool.filter(x=>!usedHanja.has(x.id));
 return [...supported,...forward(remainingPool,questionCount-supported.length)];
}
