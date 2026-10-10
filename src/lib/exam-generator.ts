import { VERIFIED_VARIABLE_PATTERNS, type ExamBlueprint, type ExamQuestionType } from "./exam-blueprints.ts";

export type ExampleWord={word:string;reading:string|null;meaning:string;child_explanation:string|null};
export type ExamQuestion={id:string;type?:string;stem:string;prompt:string;correct:string;choices:string[];examples:ExampleWord[];image?:{src:string;alt:string};explanation?:string};
export type HanjaPoolItem={id:number;character:string;answer:string;examples:ExampleWord[]};
export type PublishedWord={id:number;word:string;reading:string|null;meaning:string;child_explanation?:string|null};
export type Relation={from_hanja_id:number;to_hanja_id:number;relation_type:string};
export type WordRelation={from_word_id:number;to_word_id:number;relation_type:string};
export type Metadata={hanja_id:number;radical:string|null;total_strokes:number|null;formation_type:string|null};
export type WordContext={id:number;word_id:number;sentence:string;blank_text:string};
export type WordStructure={word_id:number;structure_type:string};
export type CommonCharacterSet={id:number;common_hanja_id:number;word_ids:number[];word_hanja_ids:Record<number,number[]>};
export type Idiom={id:number;idiom:string;reading:string|null;meaning:string;child_explanation:string|null};
export type CultureItem={id:number;prompt_summary:string;choice_a:string;choice_b:string;choice_c:string;choice_d:string;correct_choice:number;correct_explanation?:string|null};
export type UsageItem={id:number;hanja_id:number;prompt:string;choice_a:string;choice_b:string;choice_c:string;choice_d:string;correct_choice:number};
export type SpecialReading={id:number;hanja_id:number;reading:string;meaning:string;usage_note:string;choice_a:string;choice_b:string;choice_c:string;choice_d:string;correct_choice:number};
export type ImageItem={id:number;hanja_id:number;asset_path:string;alt_text:string};

export type ExamReadinessInput={pool:HanjaPoolItem[];words:PublishedWord[];relations:Relation[];wordRelations:WordRelation[];metadata:Metadata[];wordContexts:WordContext[];wordStructures:WordStructure[];commonCharacterSets:CommonCharacterSet[];idioms:Idiom[];cultureItems:CultureItem[];usageItems:UsageItem[];specialReadings:SpecialReading[];imageItems:ImageItem[]};

function validCharacter(value:string|undefined):value is string{return typeof value==="string"&&/^[\u3400-\u9fff\uf900-\ufaff]$/u.test(value.trim());}

function countDictionaryCandidates(input:ExamReadinessInput):number{
 const characters=new Map(input.pool.map(h=>[h.id,h.character]));
 const radicals=new Set(input.metadata.map(m=>m.radical).filter((v):v is string=>Boolean(v)));
 const strokes=new Set(input.metadata.map(m=>m.total_strokes).filter((v):v is number=>typeof v==="number"));
 let count=0;
 for(const m of input.metadata){
  const character=characters.get(m.hanja_id);
  if(!character||!validCharacter(character))continue;
  if(m.radical&&m.radical!==character&&radicals.size-(radicals.has(m.radical)?1:0)>=3)count++;
  if(typeof m.total_strokes==="number"&&strokes.size-(strokes.has(m.total_strokes)?1:0)>=3)count++;
 }
 return count;
}

export function examReadinessSummary(input:ExamReadinessInput){
 return {
  HANJA_READING:input.pool.length,
  WORDS:input.words.filter(x=>x.word&&x.reading&&x.meaning).length,
  RELATIONS:input.relations.length,
  WORD_RELATIONS:input.wordRelations.length,
  CHARACTER_PRINCIPLE:input.metadata.filter(x=>Boolean(x.formation_type)).length,
  DICTIONARY_LOOKUP:countDictionaryCandidates(input),
  WORD_CONTEXTS:input.wordContexts.length,
  WORD_STRUCTURES:input.wordStructures.length,
  COMMON_CHARACTER_SETS:input.commonCharacterSets.length,
  IDIOMS:input.idioms.length,
  CULTURE_CONTENT:input.cultureItems.length,
  USAGE_ITEMS:input.usageItems.length,
  SPECIAL_READINGS:input.specialReadings.filter(x=>x.reading&&x.meaning&&input.pool.some(h=>h.id===x.hanja_id)&&x.correct_choice>=1&&x.correct_choice<=4&&[x.choice_a,x.choice_b,x.choice_c,x.choice_d].every(Boolean)&&new Set([x.choice_a,x.choice_b,x.choice_c,x.choice_d]).size===4&&[x.choice_a,x.choice_b,x.choice_c,x.choice_d][x.correct_choice-1]===x.reading).length,
  ORIGINAL_IMAGES:input.imageItems.length,
 };
}


export type ExamReadinessIssue={type:string;required:number;available:number};

export function fieldExamReadinessIssues(input:ExamReadinessInput,blueprint:ExamBlueprint):ExamReadinessIssue[]{
 const summary=examReadinessSummary(input);
 const required=new Map<string,number>();
 const add=(type:string,count:number)=>required.set(type,(required.get(type)??0)+count);
 for(const item of blueprint.items){
  if(item.type==="VARIABLE_VERIFIED")continue;
  add(item.type,item.count);
 }
 const variableCount=blueprint.items.filter(x=>x.type==="VARIABLE_VERIFIED").reduce((n,x)=>n+x.count,0);
 if(blueprint.gradeCode==="6"&&variableCount)add("CHARACTER_USAGE",1);
 if(blueprint.gradeCode==="PRE5"&&variableCount){add("CHARACTER_USAGE",1);add("IDIOM",1);}
 if(blueprint.gradeCode==="PRE3"&&variableCount)add("CHARACTER_PRINCIPLE",1);
 const available:Record<string,number>={
  HANJA_TO_READING_MEANING:summary.HANJA_READING,
  READING_MEANING_TO_HANJA:summary.HANJA_READING,
  WORD_READING:summary.WORDS,WORD_MEANING:summary.WORDS,WORD_TO_HANJA:summary.WORDS,
  CHAR_SYNONYM_ANTONYM:summary.RELATIONS,WORD_SYNONYM_ANTONYM:summary.WORD_RELATIONS,
  CHARACTER_PRINCIPLE:summary.CHARACTER_PRINCIPLE,DICTIONARY_LOOKUP:summary.DICTIONARY_LOOKUP,
  CONTEXT_READING:summary.WORD_CONTEXTS,CONTEXT_TO_HANJA:summary.WORD_CONTEXTS,
  WORD_STRUCTURE:summary.WORD_STRUCTURES,COMMON_CHARACTER:summary.COMMON_CHARACTER_SETS,
  IDIOM:summary.IDIOMS,CULTURE_ETIQUETTE:summary.CULTURE_CONTENT,
  CHARACTER_USAGE:summary.USAGE_ITEMS,SPECIAL_READING:summary.SPECIAL_READINGS,
  IMAGE_RECOGNITION:summary.ORIGINAL_IMAGES
 };
 return [...required].flatMap(([type,count])=>(available[type]??0)<count?[{type,required:count,available:available[type]??0}]:[]);
}

/** Flags types that can repeat across consecutive exams even when generation succeeds. */
export function examRotationShortages(input:ExamReadinessInput,blueprint:ExamBlueprint,examCount=3):ExamReadinessIssue[]{
 const summary=examReadinessSummary(input);
 const available:Record<string,number>={
  HANJA_TO_READING_MEANING:summary.HANJA_READING,READING_MEANING_TO_HANJA:summary.HANJA_READING,
  WORD_READING:summary.WORDS,WORD_MEANING:summary.WORDS,WORD_TO_HANJA:summary.WORDS,
  CHAR_SYNONYM_ANTONYM:summary.RELATIONS,WORD_SYNONYM_ANTONYM:summary.WORD_RELATIONS,
  CHARACTER_PRINCIPLE:summary.CHARACTER_PRINCIPLE,DICTIONARY_LOOKUP:summary.DICTIONARY_LOOKUP,
  CONTEXT_READING:summary.WORD_CONTEXTS,CONTEXT_TO_HANJA:summary.WORD_CONTEXTS,
  WORD_STRUCTURE:summary.WORD_STRUCTURES,COMMON_CHARACTER:summary.COMMON_CHARACTER_SETS,
  IDIOM:summary.IDIOMS,CULTURE_ETIQUETTE:summary.CULTURE_CONTENT,
  CHARACTER_USAGE:summary.USAGE_ITEMS,SPECIAL_READING:summary.SPECIAL_READINGS,
  IMAGE_RECOGNITION:summary.ORIGINAL_IMAGES
 };
 const required=new Map<string,number>();
 for(const item of blueprint.items){
  if(item.type==="VARIABLE_VERIFIED")continue;
  required.set(item.type,(required.get(item.type)??0)+item.count*examCount);
 }
 return [...required].flatMap(([type,needed])=>(available[type]??0)<needed?[{type,required:needed,available:available[type]??0}]:[]);
}

export function validateExamQuestions(questions:ExamQuestion[],expectedCount:number,blueprint?:ExamBlueprint){
 const errors:string[]=[];
 if(questions.length!==expectedCount)errors.push(`expected ${expectedCount} questions, got ${questions.length}`);
 if(blueprint){
  const expectedByType=new Map<string,number>();
  for(const item of blueprint.items)expectedByType.set(item.type,(expectedByType.get(item.type)??0)+item.count);
  for(const [type,required] of expectedByType){
   const actual=questions.filter(q=>q.type===type).length;
   if(actual!==required)errors.push(`blueprint ${type}: expected ${required}, got ${actual}`);
  }
 }
 const ids=new Set<string>();
 const fingerprints=new Set<string>();
 questions.forEach((q,index)=>{
  const label=`question ${index+1}`;
  if(ids.has(q.id))errors.push(`${label}: duplicate id ${q.id}`); else ids.add(q.id);
  const fingerprint=[q.type??"",q.stem.trim(),q.prompt.trim(),q.correct.trim()].join("|");
  if(fingerprints.has(fingerprint))errors.push(`${label}: duplicate question content`); else fingerprints.add(fingerprint);
  if(!q.stem.trim())errors.push(`${label}: empty stem`);
  if(!q.prompt.trim())errors.push(`${label}: empty prompt`);if(q.image&&(!q.image.src.startsWith("/exam-images/")||q.image.src.includes("..")||q.image.src.includes("?")||q.image.src.includes("#")||q.image.src.includes("\\")||!q.image.alt.trim()))errors.push(`${label}: invalid image metadata`);
  if(q.choices.length!==4)errors.push(`${label}: expected 4 choices, got ${q.choices.length}`);
  if(new Set(q.choices).size!==q.choices.length)errors.push(`${label}: duplicate choices`);
  if(!q.choices.includes(q.correct))errors.push(`${label}: correct answer is missing from choices`);
  if(q.type==="SPECIAL_READING"&&q.correct.trim()&&q.prompt.includes(q.correct.trim()))errors.push(`${label}: special reading answer leaked in prompt`);
  if(q.type==="COMMON_CHARACTER"&&q.correct.trim()&&q.stem.includes(q.correct.trim()))errors.push(`${label}: common character answer leaked in stem`);
  if(q.type==="COMMON_CHARACTER"&&!q.stem.includes("□"))errors.push(`${label}: common character blank is missing`);
  if(q.type==="WORD_READING"||q.type==="WORD_MEANING"){if(!/^[\u3400-\u9fff\uf900-\ufaff]+$/u.test(q.stem))errors.push(`${label}: expected Hanja word stem`)}
  if(q.type==="WORD_TO_HANJA"){if(!/^[\u3400-\u9fff\uf900-\ufaff]+$/u.test(q.correct))errors.push(`${label}: expected Hanja answer`);if(!q.choices.every(choice=>/^[\u3400-\u9fff\uf900-\ufaff]+$/u.test(choice)))errors.push(`${label}: expected Hanja choices`)}
 });
 return errors;
}

export function shuffle<T>(items:T[]):T[]{const a=[...items];for(let n=a.length-1;n>0;n--){const j=Math.floor(Math.random()*(n+1));[a[n],a[j]]=[a[j],a[n]]}return a}

const formationLabels:Record<string,string>={PICTOGRAPH:"상형",IDEOGRAPH:"지사",COMPOUND_IDEOGRAPH:"회의",PHONO_SEMANTIC:"형성",LOAN:"가차",DERIVATIVE:"전주"};

export function generateExamQuestions(args:{recentQuestionKeys?:Set<string>;pool:HanjaPoolItem[];words:PublishedWord[];relations:Relation[];wordRelations:WordRelation[];metadata:Metadata[];wordContexts:WordContext[];wordStructures:WordStructure[];commonCharacterSets:CommonCharacterSet[];idioms:Idiom[];cultureItems:CultureItem[];usageItems:UsageItem[];specialReadings:SpecialReading[];imageItems:ImageItem[];characterById:Map<number,string>;questionCount:number;blueprint?:ExamBlueprint}):ExamQuestion[]{
 const {pool,words,relations,wordRelations,metadata,wordContexts,wordStructures,commonCharacterSets,idioms,cultureItems,usageItems,specialReadings,imageItems,characterById,questionCount,blueprint}=args;
 const recentQuestionKeys=args.recentQuestionKeys??new Set<string>();
 const preferFresh=<T>(items:T[],key:(item:T)=>string)=>{const shuffled=shuffle(items);const fresh:T[]=[],recent:T[]=[];for(const item of shuffled)(recentQuestionKeys.has(key(item))?recent:fresh).push(item);return [...fresh,...recent];};
 const forwardCount=blueprint?.items.filter(x=>x.type==="HANJA_TO_READING_MEANING").reduce((n,x)=>n+x.count,0)??0;
 const reverseCount=blueprint?.items.filter(x=>x.type==="READING_MEANING_TO_HANJA").reduce((n,x)=>n+x.count,0)??0;
 const wordReadingCount=blueprint?.items.filter(x=>x.type==="WORD_READING").reduce((n,x)=>n+x.count,0)??0;
 const wordHanjaCount=blueprint?.items.filter(x=>x.type==="WORD_TO_HANJA").reduce((n,x)=>n+x.count,0)??0;
 const wordMeaningCount=blueprint?.items.filter(x=>x.type==="WORD_MEANING").reduce((n,x)=>n+x.count,0)??0;
 const relationCount=blueprint?.items.filter(x=>x.type==="CHAR_SYNONYM_ANTONYM").reduce((n,x)=>n+x.count,0)??0;
 const wordRelationCount=blueprint?.items.filter(x=>x.type==="WORD_SYNONYM_ANTONYM").reduce((n,x)=>n+x.count,0)??0;
 const variableCount=blueprint?.items.filter(x=>x.type==="VARIABLE_VERIFIED").reduce((n,x)=>n+x.count,0)??0;
 const pre5Variable=blueprint?.gradeCode==="PRE5"&&variableCount===2;
 const pre3Variable=blueprint?.gradeCode==="PRE3"&&variableCount===1;
 const grade6Variable=blueprint?.gradeCode==="6"&&variableCount===1;
 const principleCount=(blueprint?.items.filter(x=>x.type==="CHARACTER_PRINCIPLE").reduce((n,x)=>n+x.count,0)??0)+(pre3Variable?1:0);
 const dictionaryCount=blueprint?.items.filter(x=>x.type==="DICTIONARY_LOOKUP").reduce((n,x)=>n+x.count,0)??0;
 const contextReadingCount=blueprint?.items.filter(x=>x.type==="CONTEXT_READING").reduce((n,x)=>n+x.count,0)??0;
 const contextHanjaCount=blueprint?.items.filter(x=>x.type==="CONTEXT_TO_HANJA").reduce((n,x)=>n+x.count,0)??0;
 const structureCount=blueprint?.items.filter(x=>x.type==="WORD_STRUCTURE").reduce((n,x)=>n+x.count,0)??0;
 const baseCommonCount=blueprint?.items.filter(x=>x.type==="COMMON_CHARACTER").reduce((n,x)=>n+x.count,0)??0;
 const commonCount=baseCommonCount+(grade6Variable?1:0);
 const idiomCount=(blueprint?.items.filter(x=>x.type==="IDIOM").reduce((n,x)=>n+x.count,0)??0)+(pre5Variable?2:0);
 const cultureCount=(blueprint?.items.filter(x=>x.type==="CULTURE_ETIQUETTE").reduce((n,x)=>n+x.count,0)??0)+(pre5Variable?1:0)+(pre3Variable?1:0);
 const usageCount=(blueprint?.items.filter(x=>x.type==="CHARACTER_USAGE").reduce((n,x)=>n+x.count,0)??0)+(pre5Variable?1:0)+(grade6Variable?1:0);
 const specialReadingCount=blueprint?.items.filter(x=>x.type==="SPECIAL_READING").reduce((n,x)=>n+x.count,0)??0;
 const imageCount=blueprint?.items.filter(x=>x.type==="IMAGE_RECOGNITION").reduce((n,x)=>n+x.count,0)??0;
 
 const similarCharacterGroups=["田甲由申","日目白自百","土士干千","未末朱","人入八","大太犬天夫","木本禾","口囗回","王玉主","己已巳","牛午","刀力","右石","左工","問間聞","晴睛情清請","休体","鳥烏","貝見","手毛","水永氷"];
 const similarCharacters=(character:string)=>similarCharacterGroups.find(group=>group.includes(character))??"";
 const readingOf=(answer:string)=>answer.trim().split(/\s+/).at(-1)??"";
 const selectHanjaDistractors=(target:HanjaPoolItem,kind:"answer"|"character")=>{
  const candidates=shuffle(pool.filter(y=>y.id!==target.id&&validCharacter(y.character)&&y.answer!==target.answer&&y.character!==target.character));
  const similar=similarCharacters(target.character);
  candidates.sort((a,b)=>{
   const score=(y:HanjaPoolItem)=>(similar&&similar.includes(y.character)?100:0)+(readingOf(y.answer)===readingOf(target.answer)?30:0)+(y.character.length===target.character.length?1:0);
   return score(b)-score(a);
  });
  return [...new Set(candidates.map(y=>kind==="answer"?y.answer:y.character))].filter(x=>x!==(kind==="answer"?target.answer:target.character)).slice(0,3);
 };
 const forward=(items:HanjaPoolItem[],count:number)=>preferFresh(items,x=>`hanja-forward:${x.id}`).filter(x=>validCharacter(x.character)&&new Set(pool.filter(y=>y.id!==x.id&&y.answer!==x.answer).map(y=>y.answer)).size>=3).slice(0,count).map(x=>{const wrong=selectHanjaDistractors(x,"answer");return{id:`hanja-forward:${x.id}`,stem:x.character,prompt:"알맞은 뜻과 소리를 고르세요.",correct:x.answer,choices:shuffle([x.answer,...wrong]),examples:x.examples}}).filter(x=>x.choices.length===4);
 const reverse=(items:HanjaPoolItem[],count:number)=>preferFresh(items,x=>`hanja-reverse:${x.id}`).filter(x=>validCharacter(x.character)&&new Set(pool.filter(y=>y.id!==x.id&&y.character!==x.character).map(y=>y.character)).size>=3).slice(0,count).map(x=>{const wrong=selectHanjaDistractors(x,"character");return{id:`hanja-reverse:${x.id}`,stem:x.answer,prompt:"뜻과 소리에 맞는 한자를 고르세요.",correct:x.character,choices:shuffle([x.character,...wrong]),examples:x.examples}}).filter(x=>x.choices.length===4);
 if(!blueprint)return forward(pool,questionCount);
 const first=forward(pool,forwardCount),usedHanjaIds=new Set(first.map(q=>Number(q.id.split(":").at(-1)))),second=reverse(pool.filter(x=>!usedHanjaIds.has(x.id)),reverseCount);
 if(first.length!==forwardCount||second.length!==reverseCount)return[];
 const goodWords=words.filter(w=>w.word&&w.reading&&w.meaning&&/^[\u3400-\u9fff\uf900-\ufaff]+$/u.test(w.word));
 const wordReading=goodWords.length<4?[]:preferFresh(goodWords,w=>`word-reading:${w.id}`).filter(w=>new Set(goodWords.filter(x=>x.id!==w.id&&x.reading!==w.reading).map(x=>x.reading).filter(Boolean)).size>=3).slice(0,wordReadingCount).map(w=>{const wrong=[...new Set(shuffle(goodWords.filter(x=>x.id!==w.id&&x.reading!==w.reading)).map(x=>x.reading).filter((x):x is string=>Boolean(x)))].slice(0,3);return{id:`word-reading:${w.id}`,stem:w.word,prompt:"이 한자어를 바르게 읽은 것을 고르세요.",correct:w.reading!,choices:shuffle([w.reading!,...wrong]),examples:[]}}).filter(q=>q.choices.length===4);
 const wordHanja=goodWords.length<4?[]:preferFresh(goodWords,w=>`word-hanja:${w.id}`).filter(w=>new Set(goodWords.filter(x=>x.id!==w.id&&x.word!==w.word).map(x=>x.word)).size>=3).slice(0,wordHanjaCount).map(w=>{const wrong=[...new Set(shuffle(goodWords.filter(x=>x.id!==w.id&&x.word!==w.word)).map(x=>x.word))].slice(0,3);return{id:`word-hanja:${w.id}`,stem:w.meaning,prompt:"뜻에 맞는 한자어를 고르세요.",correct:w.word,choices:shuffle([w.word,...wrong]),examples:[]}}).filter(q=>q.choices.length===4);
 const wordMeaning=goodWords.length<4?[]:preferFresh(goodWords,w=>`word-meaning:${w.id}`).filter(w=>{const meanings=new Set(goodWords.filter(x=>x.id!==w.id&&x.meaning!==w.meaning).map(x=>x.meaning));return meanings.size>=3}).slice(0,wordMeaningCount).map(w=>{const wrong=[...new Set(shuffle(goodWords.filter(x=>x.id!==w.id&&x.meaning!==w.meaning)).map(x=>x.meaning))].slice(0,3);return{id:`word-meaning:${w.id}`,stem:w.word,prompt:"이 한자어의 뜻으로 알맞은 것을 고르세요.",correct:w.meaning,choices:shuffle([w.meaning,...wrong]),examples:[]}}).filter(q=>q.choices.length===4);
 const relationQs=preferFresh(relations,r=>`relation:${r.relation_type}:${r.from_hanja_id}:${r.to_hanja_id}`).filter(r=>characterById.has(r.from_hanja_id)&&characterById.has(r.to_hanja_id)&&new Set(pool.filter(x=>x.character!==characterById.get(r.from_hanja_id)&&x.character!==characterById.get(r.to_hanja_id)&&!relations.some(other=>other.from_hanja_id===r.from_hanja_id&&other.relation_type===r.relation_type&&characterById.get(other.to_hanja_id)===x.character)).map(x=>x.character)).size>=3).slice(0,relationCount).map(r=>{const stem=characterById.get(r.from_hanja_id)!,correct=characterById.get(r.to_hanja_id)!;const otherCorrect=new Set(relations.filter(other=>other.from_hanja_id===r.from_hanja_id&&other.relation_type===r.relation_type).map(other=>characterById.get(other.to_hanja_id)));const distractorPool=pool.filter(x=>x.character!==stem&&x.character!==correct&&!otherCorrect.has(x.character));const relatedCharacters=new Set(relations.filter(other=>other.relation_type===r.relation_type&&other.from_hanja_id!==r.from_hanja_id).flatMap(other=>[characterById.get(other.from_hanja_id),characterById.get(other.to_hanja_id)]));const plausible=shuffle(distractorPool.filter(x=>relatedCharacters.has(x.character)));const fallback=shuffle(distractorPool.filter(x=>!relatedCharacters.has(x.character)));const wrong=[...new Set([...plausible,...fallback].map(x=>x.character))].slice(0,3);return{id:`relation:${r.relation_type}:${r.from_hanja_id}:${r.to_hanja_id}`,stem,prompt:`이 한자의 ${r.relation_type==="SIMILAR"?"유의자":"반의자"}를 고르세요.`,correct,choices:shuffle([correct,...wrong]),examples:[]}}).filter(q=>q.choices.length===4);
 const wordById=new Map(goodWords.map(w=>[w.id,w]));const wordRelationQs=preferFresh(wordRelations,r=>`word-relation:${r.relation_type}:${r.from_word_id}:${r.to_word_id}`).filter(r=>wordById.has(r.from_word_id)&&wordById.has(r.to_word_id)&&new Set(goodWords.filter(w=>w.id!==r.from_word_id&&w.id!==r.to_word_id&&w.word!==wordById.get(r.to_word_id)?.word).map(w=>w.word)).size>=3).slice(0,wordRelationCount).map(r=>{const from=wordById.get(r.from_word_id)!,to=wordById.get(r.to_word_id)!;const wrong=[...new Set(shuffle(goodWords.filter(w=>w.id!==from.id&&w.id!==to.id&&w.word!==to.word)).map(w=>w.word))].slice(0,3);return{id:`word-relation:${r.relation_type}:${r.from_word_id}:${r.to_word_id}`,stem:from.word,prompt:`이 한자어의 ${r.relation_type==="SIMILAR"?"유의어":"반의어"}를 고르세요.`,correct:to.word,choices:shuffle([to.word,...wrong]),examples:[]}}).filter(q=>q.choices.length===4);
 const contextReadingQs=preferFresh(wordContexts,ctx=>`context-reading:${ctx.id}`).filter(ctx=>{const w=wordById.get(ctx.word_id);return Boolean(w?.reading&&ctx.blank_text===w.reading&&ctx.sentence.includes(ctx.blank_text))&&new Set(goodWords.filter(x=>x.id!==w?.id&&x.reading!==w?.reading).map(x=>x.reading).filter(Boolean)).size>=3}).slice(0,contextReadingCount).map(ctx=>{const w=wordById.get(ctx.word_id)!;const wrong=[...new Set(shuffle(goodWords.filter(x=>x.id!==w.id&&x.reading!==w.reading)).map(x=>x.reading).filter((x):x is string=>Boolean(x)))].slice(0,3);const stem=ctx.blank_text&&ctx.sentence.includes(ctx.blank_text)?ctx.sentence.replace(ctx.blank_text,`【${w.word}】`):ctx.sentence;return{id:`context-reading:${ctx.id}`,stem,prompt:"【 】로 표시한 한자어를 바르게 읽은 것을 고르세요.",correct:w.reading!,choices:shuffle([w.reading!,...wrong]),examples:[]}}).filter(q=>q.choices.length===4);
 const contextHanjaQs=preferFresh(wordContexts,ctx=>`context-hanja:${ctx.id}`)
  .filter(ctx=>{
   const w=wordById.get(ctx.word_id);
   if(!w||ctx.blank_text!==w.reading||!ctx.sentence.includes(ctx.blank_text))return false;
   return new Set(goodWords.filter(x=>x.id!==w.id&&x.word!==w.word).map(x=>x.word)).size>=3;
  })
  .slice(0,contextHanjaCount)
  .map(ctx=>{
   const w=wordById.get(ctx.word_id)!;
   const wrong=[...new Set(shuffle(goodWords.filter(x=>x.id!==w.id&&x.word!==w.word)).map(x=>x.word))].slice(0,3);
   const stem=ctx.sentence.replace(ctx.blank_text,"【　　】");
   return{id:`context-hanja:${ctx.id}`,stem,prompt:"빈칸에 알맞은 한자어를 고르세요.",correct:w.word,choices:shuffle([w.word,...wrong]),examples:[]};
  })
  .filter(q=>q.choices.length===4);
 const structureLabels:Record<string,string>={SUBJECT_PREDICATE:"주술 관계",VERB_OBJECT:"술목 관계",MODIFIER_HEAD:"수식 관계",PARALLEL:"병렬 관계",OTHER:"기타 관계"};
 const structureQs=preferFresh(wordStructures,s=>`word-structure:${s.word_id}`).filter(s=>wordById.has(s.word_id)&&Boolean(structureLabels[s.structure_type])).slice(0,structureCount).map(s=>{const w=wordById.get(s.word_id)!,correct=structureLabels[s.structure_type];const wrong=shuffle(Object.entries(structureLabels).filter(([k])=>k!==s.structure_type&&k!=="OTHER").map(([,v])=>v)).slice(0,3);return{id:`word-structure:${s.word_id}`,stem:w.word,prompt:"이 한자어의 짜임으로 알맞은 것을 고르세요.",correct,choices:shuffle([correct,...wrong]),examples:[]}}).filter(q=>q.choices.length===4);
 const commonQs:ExamQuestion[]=preferFresh(commonCharacterSets,set=>`common-character:${set.id}`).filter(set=>{const correct=characterById.get(set.common_hanja_id),setWords=set.word_ids.map(id=>wordById.get(id)?.word).filter(Boolean),allWordMaps=set.word_ids.map(id=>set.word_hanja_ids[id]??[]);return Boolean(correct)&&setWords.length>=2&&allWordMaps.length===set.word_ids.length&&allWordMaps.every(xs=>xs.includes(set.common_hanja_id))}).slice(0,commonCount).flatMap(set=>{const correct=characterById.get(set.common_hanja_id),setWords=set.word_ids.map(id=>wordById.get(id)?.word).filter((x):x is string=>Boolean(x));if(!correct||setWords.length<2)return [];const eligible=pool.filter(x=>x.id!==set.common_hanja_id&&x.character!==correct&&!set.word_ids.every(wordId=>(set.word_hanja_ids[wordId]??[]).includes(x.id)));const otherCommon=new Set(commonCharacterSets.filter(other=>other.id!==set.id).map(other=>other.common_hanja_id));const related=new Set(set.word_ids.flatMap(id=>set.word_hanja_ids[id]??[]));const rank=(x:HanjaPoolItem)=>related.has(x.id)?0:otherCommon.has(x.id)?1:2;const wrong=[...new Set(shuffle(eligible).sort((a,b)=>rank(a)-rank(b)).map(x=>x.character))].slice(0,3);if(wrong.length<3)return [];return [{id:`common-character:${set.id}`,stem:setWords.map(word=>word.split(correct).join("□")).join(" · "),prompt:"□에 공통으로 들어갈 한자를 고르세요.",correct,choices:shuffle([correct,...wrong]),examples:[]}];});
 const goodIdioms=idioms.filter(i=>i.idiom&&i.meaning);const idiomQs=goodIdioms.length<4?[]:preferFresh(goodIdioms,i=>`idiom:${i.id}`).filter(i=>new Set(goodIdioms.filter(x=>x.id!==i.id&&x.meaning!==i.meaning).map(x=>x.meaning)).size>=3).slice(0,idiomCount).map(i=>{const wrong=[...new Set(shuffle(goodIdioms.filter(x=>x.id!==i.id&&x.meaning!==i.meaning)).map(x=>x.meaning))].slice(0,3);return{id:`idiom:${i.id}`,stem:i.idiom,prompt:"이 사자성어의 뜻으로 알맞은 것을 고르세요.",correct:i.meaning,choices:shuffle([i.meaning,...wrong]),examples:[]}}).filter(q=>q.choices.length===4);
 const cultureQs=preferFresh(cultureItems,i=>`culture:${i.id}`).filter(i=>{const cs=[i.choice_a,i.choice_b,i.choice_c,i.choice_d];return i.correct_choice>=1&&i.correct_choice<=4&&cs.every(Boolean)&&new Set(cs).size===4}).slice(0,cultureCount).map(i=>{const choices=[i.choice_a,i.choice_b,i.choice_c,i.choice_d];const correct=choices[i.correct_choice-1];return{id:`culture:${i.id}`,stem:i.prompt_summary,prompt:"알맞은 답을 고르세요.",correct,choices:shuffle(choices),examples:[],explanation:i.correct_explanation?.trim()||undefined}}).filter(q=>Boolean(q.correct)&&q.choices.length===4&&new Set(q.choices).size===4);
 const imageQs=preferFresh(imageItems,x=>`image:${x.id}`).filter(x=>characterById.has(x.hanja_id)&&new Set(pool.filter(h=>h.id!==x.hanja_id&&h.character!==characterById.get(x.hanja_id)).map(h=>h.character)).size>=3).slice(0,imageCount).map(x=>{const correct=characterById.get(x.hanja_id)!;const wrong=[...new Set(shuffle(pool.filter(h=>h.id!==x.hanja_id&&h.character!==correct)).map(h=>h.character))].slice(0,3);return{id:`image:${x.id}`,stem:"그림 한자 찾기",prompt:"그림과 알맞은 한자를 고르세요.",correct,choices:shuffle([correct,...wrong]),examples:[],image:{src:x.asset_path,alt:x.alt_text}}}).filter(q=>q.choices.length===4);
 const usageQs=preferFresh(usageItems,i=>`usage:${i.id}`).filter(i=>{const cs=[i.choice_a,i.choice_b,i.choice_c,i.choice_d];return i.correct_choice>=1&&i.correct_choice<=4&&cs.every(Boolean)&&new Set(cs).size===4}).slice(0,usageCount).map(i=>{const choices=[i.choice_a,i.choice_b,i.choice_c,i.choice_d],correct=choices[i.correct_choice-1];return{id:`usage:${i.id}`,stem:i.prompt,prompt:"한자의 쓰임이 알맞은 것을 고르세요.",correct,choices,examples:[]}}).filter(q=>Boolean(q.correct)&&q.choices.length===4&&new Set(q.choices).size===4);
 const goodSpecial=specialReadings.filter(x=>x.reading&&x.meaning&&characterById.has(x.hanja_id)&&x.correct_choice>=1&&x.correct_choice<=4&&[x.choice_a,x.choice_b,x.choice_c,x.choice_d].every(Boolean)&&new Set([x.choice_a,x.choice_b,x.choice_c,x.choice_d]).size===4&&[x.choice_a,x.choice_b,x.choice_c,x.choice_d][x.correct_choice-1]===x.reading);const specialQs=preferFresh(goodSpecial,x=>`special-reading:${x.id}`).slice(0,specialReadingCount).map(x=>{const choices=[x.choice_a,x.choice_b,x.choice_c,x.choice_d];return{id:`special-reading:${x.id}`,stem:characterById.get(x.hanja_id)!,prompt:`${x.usage_note.replace(/\([^)]*\)/g,"")} — 이때의 읽기로 알맞은 것을 고르세요.`,correct:choices[x.correct_choice-1],choices:shuffle(choices),examples:[]}});
 const principleQs:ExamQuestion[]=[];for(const m of preferFresh(metadata.filter(x=>Boolean(x.formation_type)),m=>`formation:${m.hanja_id}`)){if(principleQs.length>=principleCount)break;const stem=characterById.get(m.hanja_id),correct=m.formation_type?formationLabels[m.formation_type]:undefined;if(!validCharacter(stem)||!correct)continue;const wrong=shuffle(Object.entries(formationLabels).filter(([k])=>k!==m.formation_type).map(([,v])=>v)).slice(0,3);if(wrong.length===3)principleQs.push({id:`formation:${m.hanja_id}`,stem,prompt:"이 한자의 만들어진 원리로 알맞은 것을 고르세요.",correct,choices:shuffle([correct,...wrong]),examples:[]})}
 const dictionaryCandidates:ExamQuestion[]=[];
 const eligibleDictionaryIds=new Set(pool.filter(h=>validCharacter(h.character)).map(h=>h.id));
 const allRadicals=[...new Set(metadata.map(x=>x.radical).filter((x):x is string=>Boolean(x)))];
 const allStrokes=[...new Set(metadata.map(x=>x.total_strokes).filter((x):x is number=>typeof x==="number"))];
 for(const m of metadata){
  if(!eligibleDictionaryIds.has(m.hanja_id))continue;
  const stem=characterById.get(m.hanja_id);
  if(!validCharacter(stem))continue;
  if(m.radical&&m.radical!==stem){
   const distractors=allRadicals.filter(x=>x!==m.radical);
   if(distractors.length>=3)dictionaryCandidates.push({id:`radical:${m.hanja_id}`,stem,prompt:"이 한자의 부수로 알맞은 것을 고르세요.",correct:m.radical,choices:shuffle([m.radical,...shuffle(distractors).slice(0,3)]),examples:[]});
  }
  if(typeof m.total_strokes==="number"){
   const distractors=allStrokes.filter(x=>x!==m.total_strokes);
   if(distractors.length>=3){const correct=`${m.total_strokes}획`;dictionaryCandidates.push({id:`strokes:${m.hanja_id}`,stem,prompt:"이 한자의 총획으로 알맞은 것을 고르세요.",correct,choices:shuffle([correct,...shuffle(distractors).slice(0,3).map(x=>`${x}획`)]),examples:[]});}
  }
 }
 const dictionaryQs=preferFresh(dictionaryCandidates,q=>q.id).slice(0,dictionaryCount);
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
  CULTURE_ETIQUETTE:[...cultureQs],
  CHARACTER_USAGE:[...usageQs],
  SPECIAL_READING:[...specialQs],
  IMAGE_RECOGNITION:[...imageQs]
 };
 // PRE5 has a verified two-question variable block. The 111-session variant
 // requires stroke-order source data that is not modeled yet, so only the
 // fully supported 112-session pair (character usage + idiom usage) is eligible.
 if(blueprint.gradeCode==="6"&&blueprint.items.some(x=>x.type==="VARIABLE_VERIFIED")){
  const fixedUsageCount=blueprint.items.filter(x=>x.type==="CHARACTER_USAGE").reduce((n,x)=>n+x.count,0);
  const fixedCommonCount=blueprint.items.filter(x=>x.type==="COMMON_CHARACTER").reduce((n,x)=>n+x.count,0);
  const candidates:ExamQuestion[]=[usageQs[fixedUsageCount],commonQs[fixedCommonCount]].filter((q):q is ExamQuestion=>q!==undefined);
  buckets.VARIABLE_VERIFIED=shuffle(candidates).slice(0,1).map(q=>({...q,id:`variable-grade6:${q.id}`}));
 }
 if(blueprint.gradeCode==="PRE5"&&blueprint.items.some(x=>x.type==="VARIABLE_VERIFIED")){
  const fixedCounts=(type:ExamQuestionType)=>blueprint.items.filter(x=>x.type===type).reduce((n,x)=>n+x.count,0);
  const source:Partial<Record<ExamQuestionType,ExamQuestion[]>>={
   CHARACTER_USAGE:usageQs,IDIOM:idiomQs,CULTURE_ETIQUETTE:cultureQs,COMMON_CHARACTER:commonQs
  };
  const supported=VERIFIED_VARIABLE_PATTERNS.PRE5?.filter(pattern=>pattern.supported)??[];
  const viable=supported.filter(pattern=>{
   const needed=new Map<ExamQuestionType,number>();
   for(const type of pattern.types)needed.set(type,(needed.get(type)??0)+1);
   return [...needed].every(([type,count])=>(source[type]?.length??0)>=fixedCounts(type)+count);
  });
  const pattern=shuffle(viable)[0];
  if(pattern){
   const offsets=new Map<ExamQuestionType,number>();
   const variableQs:ExamQuestion[]=[];
   for(const type of pattern.types){
    const offset=offsets.get(type)??0;offsets.set(type,offset+1);
    const q=source[type]?.[fixedCounts(type)+offset];
    if(q)variableQs.push({...q,id:`variable-pre5-${pattern.sessions.join("-")}:${q.id}`});
   }
   buckets.VARIABLE_VERIFIED=variableQs;
  }else buckets.VARIABLE_VERIFIED=[];
 }
 if(blueprint.gradeCode==="PRE3"&&blueprint.items.some(x=>x.type==="VARIABLE_VERIFIED")){
  const fixedPrincipleCount=blueprint.items.filter(x=>x.type==="CHARACTER_PRINCIPLE").reduce((n,x)=>n+x.count,0);
  const fixedCultureCount=blueprint.items.filter(x=>x.type==="CULTURE_ETIQUETTE").reduce((n,x)=>n+x.count,0);
  const candidates:ExamQuestion[]=[principleQs[fixedPrincipleCount],cultureQs[fixedCultureCount]].filter((q):q is ExamQuestion=>q!==undefined);
  buckets.VARIABLE_VERIFIED=shuffle(candidates).slice(0,1).map(q=>({...q,id:`variable-pre3:${q.id}`}));
 }
 const typedBuckets=Object.entries(buckets) as [string,ExamQuestion[]][];
 for(const [type,items] of typedBuckets)for(const q of items)q.type=type;
 const ordered:ExamQuestion[]=[];
 const usedIds=new Set<string>();
 for(const item of blueprint.items){
  const bucket=buckets[item.type]??[];
  let placed=0;
  while(bucket.length&&placed<item.count){
   const q=bucket.shift()!;
   if(usedIds.has(q.id))continue;
   usedIds.add(q.id);ordered.push(q);placed++;
  }
  // An official blueprint must never silently substitute another question type.
  if(placed!==item.count){console.warn("[exam-generation] insufficient blueprint questions",{grade:blueprint.gradeCode,type:item.type,required:item.count,generated:placed});return[]}
 }
 if(ordered.length!==questionCount)return[];
 return ordered;
}
