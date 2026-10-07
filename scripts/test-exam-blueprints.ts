import { DAEHAN_FIELD_BLUEPRINTS, VERIFIED_VARIABLE_PATTERNS, blueprintCount, validateBlueprints } from "../src/lib/exam-blueprints";

const errors=validateBlueprints(DAEHAN_FIELD_BLUEPRINTS);
if(errors.length) throw new Error(errors.join("\n"));

for(const [grade,b] of Object.entries(DAEHAN_FIELD_BLUEPRINTS)){
 if(blueprintCount(b)!==b.questionCount) throw new Error(`${grade}: blueprint total mismatch`);
 const seen=new Set<string>();
 for(const item of b.items){
  if(seen.has(item.type)) throw new Error(`${grade}: duplicate blueprint type ${item.type}`);
  seen.add(item.type);
 }
}

const pre3=DAEHAN_FIELD_BLUEPRINTS.PRE3;
if(pre3.questionCount!==50) throw new Error("PRE3 must have 50 questions");
if(pre3.items.find(x=>x.type==="VARIABLE_VERIFIED")?.count!==1) throw new Error("PRE3 variable block must be exactly one question");
const supported=(VERIFIED_VARIABLE_PATTERNS.PRE3??[]).filter(x=>x.supported);
if(!supported.some(x=>x.types.length===1&&x.types[0]==="CULTURE_ETIQUETTE")) throw new Error("PRE3 supported culture variable pattern missing");
if(!supported.some(x=>x.types.length===1&&x.types[0]==="CHARACTER_PRINCIPLE")) throw new Error("PRE3 supported principle variable pattern missing");
if(supported.some(x=>x.types.includes("STROKE_ORDER"))) throw new Error("PRE3 stroke-order pattern must remain unsupported until source/model support exists");

console.log(`Exam blueprint checks passed for ${Object.keys(DAEHAN_FIELD_BLUEPRINTS).length} grades.`);
