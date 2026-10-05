// Abstract question-type distribution derived from the user-provided official
// 대한검정회 108회~112회 papers supplied by the user. Store only abstract distributions, never copyrighted question text.
export type ExamQuestionType =
  | "IMAGE_RECOGNITION"
  | "HANJA_TO_READING_MEANING"
  | "READING_MEANING_TO_HANJA"
  | "CHARACTER_PRINCIPLE"
  | "CHARACTER_USAGE"
  | "SPECIAL_READING"
  | "DICTIONARY_LOOKUP"
  | "CHAR_SYNONYM_ANTONYM"
  | "WORD_SYNONYM_ANTONYM"
  | "COMMON_CHARACTER"
  | "WORD_READING"
  | "WORD_MEANING"
  | "WORD_TO_HANJA"
  | "CONTEXT_READING"
  | "CONTEXT_TO_HANJA"
  | "WORD_STRUCTURE"
  | "IDIOM"
  | "CULTURE_ETIQUETTE"
  | "STROKE_ORDER"
  | "VARIABLE_VERIFIED";

export type ExamBlueprintItem={type:ExamQuestionType;count:number};
export type ExamDataRequirement="HANJA_READING"|"WORDS"|"RELATIONS"|"CHARACTER_METADATA"|"WORD_CONTEXTS"|"WORD_STRUCTURES"|"COMMON_CHARACTER_SETS"|"USAGE_ITEMS"|"SPECIAL_READINGS"|"ORIGINAL_IMAGES"|"IDIOMS"|"CULTURE_CONTENT";

export const EXAM_TYPE_REQUIREMENTS:Record<ExamQuestionType,ExamDataRequirement[]>={
  IMAGE_RECOGNITION:["HANJA_READING","ORIGINAL_IMAGES"],
  HANJA_TO_READING_MEANING:["HANJA_READING"],
  READING_MEANING_TO_HANJA:["HANJA_READING"],
  CHARACTER_PRINCIPLE:["CHARACTER_METADATA"],
  CHARACTER_USAGE:["HANJA_READING","USAGE_ITEMS"],
  SPECIAL_READING:["HANJA_READING","SPECIAL_READINGS"],
  DICTIONARY_LOOKUP:["CHARACTER_METADATA"],
  CHAR_SYNONYM_ANTONYM:["RELATIONS"],
  WORD_SYNONYM_ANTONYM:["WORDS","RELATIONS"],
  COMMON_CHARACTER:["WORDS","COMMON_CHARACTER_SETS"],
  WORD_READING:["WORDS"],
  WORD_MEANING:["WORDS"],
  WORD_TO_HANJA:["WORDS"],
  CONTEXT_READING:["WORDS","WORD_CONTEXTS"],
  CONTEXT_TO_HANJA:["WORDS","WORD_CONTEXTS"],
  WORD_STRUCTURE:["WORDS","WORD_STRUCTURES"],
  IDIOM:["IDIOMS"],
  CULTURE_ETIQUETTE:["CULTURE_CONTENT"],
  STROKE_ORDER:["CHARACTER_METADATA"],
  VARIABLE_VERIFIED:[]
};
export type ExamBlueprint={gradeCode:string;questionCount:number;items:ExamBlueprintItem[];status:"VERIFIED_111_112"|"PENDING_FINAL_CHECK"};

export const DAEHAN_FIELD_BLUEPRINTS:Record<string,ExamBlueprint>={
  "8":{gradeCode:"8",questionCount:25,status:"VERIFIED_111_112",items:[
    {type:"IMAGE_RECOGNITION",count:3},{type:"HANJA_TO_READING_MEANING",count:5},
    {type:"READING_MEANING_TO_HANJA",count:10},{type:"WORD_READING",count:2},
    {type:"WORD_TO_HANJA",count:2},{type:"CONTEXT_READING",count:2},{type:"CONTEXT_TO_HANJA",count:1}
  ]},

  "7":{gradeCode:"7",questionCount:25,status:"VERIFIED_111_112",items:[
    {type:"IMAGE_RECOGNITION",count:1},{type:"HANJA_TO_READING_MEANING",count:7},
    {type:"READING_MEANING_TO_HANJA",count:10},{type:"WORD_READING",count:2},
    {type:"WORD_MEANING",count:2},{type:"CONTEXT_READING",count:2},{type:"WORD_TO_HANJA",count:1}
  ]},
  "6":{gradeCode:"6",questionCount:50,status:"VERIFIED_111_112",items:[
    {type:"HANJA_TO_READING_MEANING",count:10},{type:"READING_MEANING_TO_HANJA",count:10},
    {type:"CHARACTER_PRINCIPLE",count:1},{type:"CHARACTER_USAGE",count:1},{type:"DICTIONARY_LOOKUP",count:1},
    {type:"CHAR_SYNONYM_ANTONYM",count:1},{type:"WORD_READING",count:5},{type:"WORD_MEANING",count:4},
    {type:"WORD_TO_HANJA",count:4},{type:"CONTEXT_READING",count:7},{type:"CONTEXT_TO_HANJA",count:2},
    {type:"WORD_SYNONYM_ANTONYM",count:1},{type:"VARIABLE_VERIFIED",count:1},{type:"IDIOM",count:1},
    {type:"CULTURE_ETIQUETTE",count:1}
  ]},
  "PRE5":{gradeCode:"PRE5",questionCount:50,status:"VERIFIED_111_112",items:[
    {type:"HANJA_TO_READING_MEANING",count:10},{type:"READING_MEANING_TO_HANJA",count:10},
    {type:"CHARACTER_PRINCIPLE",count:1},{type:"CHARACTER_USAGE",count:1},{type:"DICTIONARY_LOOKUP",count:1},
    {type:"CHAR_SYNONYM_ANTONYM",count:1},{type:"WORD_READING",count:5},{type:"WORD_MEANING",count:4},
    {type:"WORD_TO_HANJA",count:4},{type:"CONTEXT_READING",count:7},{type:"CONTEXT_TO_HANJA",count:2},
    {type:"WORD_SYNONYM_ANTONYM",count:1},{type:"VARIABLE_VERIFIED",count:2},
    {type:"CULTURE_ETIQUETTE",count:1}
  ]},
  "5":{gradeCode:"5",questionCount:50,status:"VERIFIED_111_112",items:[
    {type:"HANJA_TO_READING_MEANING",count:8},{type:"READING_MEANING_TO_HANJA",count:7},
    {type:"CHARACTER_PRINCIPLE",count:1},{type:"SPECIAL_READING",count:2},{type:"DICTIONARY_LOOKUP",count:1},
    {type:"CHAR_SYNONYM_ANTONYM",count:2},{type:"COMMON_CHARACTER",count:1},{type:"WORD_READING",count:9},
    {type:"WORD_MEANING",count:3},{type:"WORD_TO_HANJA",count:3},{type:"CONTEXT_READING",count:4},
    {type:"CONTEXT_TO_HANJA",count:3},{type:"WORD_STRUCTURE",count:1},{type:"WORD_SYNONYM_ANTONYM",count:2},
    {type:"IDIOM",count:1},{type:"CULTURE_ETIQUETTE",count:2}
  ]},
  "PRE4":{gradeCode:"PRE4",questionCount:50,status:"VERIFIED_111_112",items:[
    {type:"HANJA_TO_READING_MEANING",count:8},{type:"READING_MEANING_TO_HANJA",count:7},
    {type:"CHARACTER_PRINCIPLE",count:1},{type:"SPECIAL_READING",count:2},{type:"DICTIONARY_LOOKUP",count:1},
    {type:"CHAR_SYNONYM_ANTONYM",count:2},{type:"COMMON_CHARACTER",count:1},{type:"WORD_READING",count:9},
    {type:"WORD_MEANING",count:3},{type:"WORD_TO_HANJA",count:3},{type:"CONTEXT_READING",count:4},
    {type:"CONTEXT_TO_HANJA",count:3},{type:"WORD_STRUCTURE",count:1},{type:"WORD_SYNONYM_ANTONYM",count:2},
    {type:"IDIOM",count:1},{type:"CULTURE_ETIQUETTE",count:2}
  ]},
  "4":{gradeCode:"4",questionCount:50,status:"VERIFIED_111_112",items:[
    {type:"HANJA_TO_READING_MEANING",count:8},{type:"READING_MEANING_TO_HANJA",count:7},
    {type:"CHARACTER_PRINCIPLE",count:1},{type:"SPECIAL_READING",count:2},{type:"DICTIONARY_LOOKUP",count:1},
    {type:"CHAR_SYNONYM_ANTONYM",count:2},{type:"COMMON_CHARACTER",count:1},{type:"WORD_READING",count:9},
    {type:"WORD_MEANING",count:3},{type:"WORD_TO_HANJA",count:3},{type:"CONTEXT_READING",count:4},
    {type:"CONTEXT_TO_HANJA",count:3},{type:"WORD_STRUCTURE",count:1},{type:"WORD_SYNONYM_ANTONYM",count:2},
    {type:"IDIOM",count:1},{type:"CULTURE_ETIQUETTE",count:2}
  ]},
  "PRE3":{gradeCode:"PRE3",questionCount:50,status:"VERIFIED_111_112",items:[
    {type:"HANJA_TO_READING_MEANING",count:8},{type:"READING_MEANING_TO_HANJA",count:7},
    {type:"CHARACTER_PRINCIPLE",count:1},{type:"SPECIAL_READING",count:2},{type:"DICTIONARY_LOOKUP",count:1},
    {type:"CHAR_SYNONYM_ANTONYM",count:2},{type:"COMMON_CHARACTER",count:1},{type:"WORD_READING",count:9},
    {type:"WORD_MEANING",count:3},{type:"WORD_TO_HANJA",count:3},{type:"CONTEXT_READING",count:4},
    {type:"CONTEXT_TO_HANJA",count:3},{type:"WORD_STRUCTURE",count:1},{type:"WORD_SYNONYM_ANTONYM",count:2},
    {type:"IDIOM",count:1},{type:"CULTURE_ETIQUETTE",count:1},{type:"VARIABLE_VERIFIED",count:1}
  ]},
  "3":{gradeCode:"3",questionCount:50,status:"VERIFIED_111_112",items:[
    {type:"HANJA_TO_READING_MEANING",count:10},{type:"READING_MEANING_TO_HANJA",count:10},
    {type:"CHARACTER_PRINCIPLE",count:1},{type:"SPECIAL_READING",count:2},{type:"DICTIONARY_LOOKUP",count:1},
    {type:"CHAR_SYNONYM_ANTONYM",count:2},{type:"COMMON_CHARACTER",count:1},{type:"WORD_READING",count:7},
    {type:"WORD_MEANING",count:3},{type:"WORD_TO_HANJA",count:2},{type:"CONTEXT_READING",count:3},
    {type:"CONTEXT_TO_HANJA",count:2},{type:"WORD_STRUCTURE",count:1},{type:"WORD_SYNONYM_ANTONYM",count:2},
    {type:"IDIOM",count:1},{type:"CULTURE_ETIQUETTE",count:2}
  ]}
};

export function blueprintCount(blueprint:ExamBlueprint){return blueprint.items.reduce((sum,item)=>sum+item.count,0)}


export const IMPLEMENTED_EXAM_TYPES=new Set<ExamQuestionType>([
  "HANJA_TO_READING_MEANING",
  "READING_MEANING_TO_HANJA",
  "CHARACTER_PRINCIPLE",
  "DICTIONARY_LOOKUP",
  "CHAR_SYNONYM_ANTONYM",
  "WORD_READING",
  "WORD_MEANING",
  "WORD_TO_HANJA",
  "WORD_SYNONYM_ANTONYM",
  "COMMON_CHARACTER",
  "CONTEXT_READING",
  "CONTEXT_TO_HANJA",
  "WORD_STRUCTURE",
  "IDIOM",
  "CULTURE_ETIQUETTE",
  "CHARACTER_USAGE",
  "SPECIAL_READING",
  "IMAGE_RECOGNITION",
  "VARIABLE_VERIFIED"
]);

export function unsupportedBlueprintItems(blueprint:ExamBlueprint){
  return blueprint.items.filter(item=>!IMPLEMENTED_EXAM_TYPES.has(item.type));
}

export function validateBlueprints(blueprints:Record<string,ExamBlueprint>){
 const errors:string[]=[];
 for(const [key,b] of Object.entries(blueprints)){
  const total=blueprintCount(b);
  if(key!==b.gradeCode)errors.push(`${key}: gradeCode is ${b.gradeCode}`);
  if(total!==b.questionCount)errors.push(`${key}: expected ${b.questionCount}, got ${total}`);
  if(b.items.some(item=>item.count<=0))errors.push(`${key}: item count must be positive`);
 }
 return errors;
}

export const DAEHAN_FIELD_BLUEPRINT_ERRORS=validateBlueprints(DAEHAN_FIELD_BLUEPRINTS);

if(DAEHAN_FIELD_BLUEPRINT_ERRORS.length){
 throw new Error(`Invalid DAEHAN field exam blueprints: ${DAEHAN_FIELD_BLUEPRINT_ERRORS.join("; ")}`);
}
