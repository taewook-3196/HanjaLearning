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
// Only fully valid four-choice questions may count toward exam readiness.
const validCulture=culture(6);
const invalidDuplicate={...validCulture[0],id:100,choice_d:"가"};
const invalidAnswer={...validCulture[1],id:101,correct_choice:5};
const invalidPrompt={...validCulture[2],id:102,prompt_summary:"  "};
const invalidMissing={...validCulture[3],id:103,choice_c:""};
const invalidInput={...empty,cultureItems:[...validCulture,invalidDuplicate,invalidAnswer,invalidPrompt,invalidMissing]};
const invalidIssues=examRotationShortages(invalidInput,DAEHAN_FIELD_BLUEPRINTS["5"],3);
assert.equal(invalidIssues.find(x=>x.type==="CULTURE_ETIQUETTE"),undefined);
assert.deepEqual(examRotationShortages({...invalidInput,cultureItems:[...validCulture.slice(0,5),invalidDuplicate,invalidAnswer,invalidPrompt,invalidMissing]},DAEHAN_FIELD_BLUEPRINTS["5"],3).find(x=>x.type==="CULTURE_ETIQUETTE"),{type:"CULTURE_ETIQUETTE",required:6,available:5});
// Special readings count only when the answer matches the selected choice and the hanja exists.
const readingPool=Array.from({length:6},(_,i)=>({id:i+1,character:String.fromCodePoint(0x4e00+i),answer:"뜻 음",examples:[]}));
const special=(n:number)=>Array.from({length:n},(_,i)=>({id:i+1,hanja_id:i+1,reading:`음${i}`,meaning:"뜻",usage_note:"용례",choice_a:`음${i}`,choice_b:"가",choice_c:"나",choice_d:"다",correct_choice:1}));
const specialIssue=(items:ReturnType<typeof special>)=>examRotationShortages({...empty,pool:readingPool,specialReadings:items},DAEHAN_FIELD_BLUEPRINTS["5"],3).find(x=>x.type==="SPECIAL_READING");
assert.deepEqual(specialIssue(special(5)),{type:"SPECIAL_READING",required:6,available:5});
assert.equal(specialIssue(special(6)),undefined);
const validSpecial=special(5);
assert.deepEqual(specialIssue([...validSpecial,{...special(6)[5],correct_choice:2}]),{type:"SPECIAL_READING",required:6,available:5});
assert.deepEqual(specialIssue([...validSpecial,{...special(6)[5],choice_d:"가"}]),{type:"SPECIAL_READING",required:6,available:5});
assert.deepEqual(specialIssue([...validSpecial,{...special(6)[5],hanja_id:999}]),{type:"SPECIAL_READING",required:6,available:5});
assert.deepEqual(specialIssue([...validSpecial,{...special(6)[5],reading:""}]),{type:"SPECIAL_READING",required:6,available:5});
console.log("Exam rotation culture and special-reading readiness assertions passed");
