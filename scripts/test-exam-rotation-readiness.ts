import {strict as assert} from "node:assert";
import {DAEHAN_FIELD_BLUEPRINTS} from "../src/lib/exam-blueprints.ts";
import {examRotationShortages} from "../src/lib/exam-generator.ts";

// Synthetic fixtures only: no Supabase access and no production data changes.
const empty={pool:[],words:[],relations:[],wordRelations:[],metadata:[],wordContexts:[],wordStructures:[],commonCharacterSets:[],idioms:[],cultureItems:[],usageItems:[],specialReadings:[],imageItems:[]};
const culture=(n:number)=>Array.from({length:n},(_,i)=>({id:i+1,prompt_summary:`질문 ${i}?`,choice_a:"가",choice_b:"나",choice_c:"다",choice_d:"라",correct_choice:1,correct_explanation:"해설"}));
const issues=(grade:"5"|"PRE4"|"4"|"PRE3"|"3",n:number)=>examRotationShortages({...empty,cultureItems:culture(n)},DAEHAN_FIELD_BLUEPRINTS[grade],3);
const find=(grade:"5"|"PRE4"|"4"|"PRE3"|"3",n:number,type:string)=>issues(grade,n).find(x=>x.type===type);
assert.deepEqual(find("5",3,"CULTURE_ETIQUETTE"),{type:"CULTURE_ETIQUETTE",required:6,available:3});
assert.equal(find("PRE4",11,"CULTURE_ETIQUETTE"),undefined);
assert.deepEqual(find("4",4,"CULTURE_ETIQUETTE"),{type:"CULTURE_ETIQUETTE",required:6,available:4});
assert.deepEqual(find("3",4,"CULTURE_ETIQUETTE"),{type:"CULTURE_ETIQUETTE",required:6,available:4});
assert.equal(find("PRE3",4,"CULTURE_ETIQUETTE"),undefined);
assert.deepEqual(find("PRE3",4,"CULTURE_VARIABLE_WORST_CASE"),{type:"CULTURE_VARIABLE_WORST_CASE",required:6,available:4});
assert.equal(find("PRE3",6,"CULTURE_VARIABLE_WORST_CASE"),undefined);
console.log("Exam rotation culture readiness assertions passed");
