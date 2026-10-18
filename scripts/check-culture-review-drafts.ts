import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {resolve,dirname} from "node:path";

const file=resolve(dirname(fileURLToPath(import.meta.url)),"../docs/upper-grade-culture-review.md");
const doc=readFileSync(file,"utf8");
const body=doc.split("## 공개 단어 기반 4지선다 신규 문항 초안 (검토 대기)")[1]?.split("## 편집 1차 검토 결과")[0];
if(!body)throw new Error("Culture draft section missing");
const sections=body.split(/^### /m).slice(1);
if(sections.length!==10)throw new Error(`Expected 10 draft questions, got ${sections.length}`);
const distribution=[0,0,0,0];
const seen=new Set<string>();
const seenPrompts=new Set<string>();
const normalize=(value:string)=>value.normalize("NFKC").replace(/\s+/g,"").replace(/[.,!?？。]/g,"").toLowerCase();
const expected:Record<string,string[]>={"5":["信用","共同","平和"],"4":["交通","孝道"],"PRE3":["信用","共同","孝道"],"3":["共同","平和"]};
for(const section of sections){
 const [heading,...rest]=section.split("\n");
 const match=heading.match(/^(5|4|PRE3|3)급 — (.+)$/);
 if(!match)throw new Error(`Unexpected heading: ${heading}`);
 const [,grade,term]=match;
 if(!expected[grade].includes(term))throw new Error(`Unverified grade term: ${heading}`);
 if(seen.has(heading))throw new Error(`Repeated grade term: ${heading}`);
 seen.add(heading);
 const text=rest.join("\n");
 const prompt=rest.find(line=>line.trim().endsWith("?"))?.trim();
 if(!prompt)throw new Error(`Missing question prompt: ${heading}`);
 const normalizedPrompt=normalize(prompt);
 if(seenPrompts.has(normalizedPrompt))throw new Error(`Repeated question scenario: ${heading}`);
 seenPrompts.add(normalizedPrompt);
 const choices=[...text.matchAll(/^([1-4])\. (.+)$/gm)];
 if(choices.length!==4||choices.some((m,i)=>Number(m[1])!==i+1))throw new Error(`Invalid four-choice list: ${heading}`);
 if(new Set(choices.map(m=>normalize(m[2]))).size!==4)throw new Error(`Duplicate or whitespace-variant choices: ${heading}`);
 if(choices.some(m=>normalize(m[2])===normalizedPrompt))throw new Error(`Choice repeats prompt: ${heading}`);
 const answer=text.match(/^정답: ([1-4])번\./m);
 if(!answer)throw new Error(`Missing answer: ${heading}`);
 distribution[Number(answer[1])-1]++;
}
if(distribution.some(n=>n<2||n>3))throw new Error(`Unbalanced answers: ${distribution.join(",")}`);
console.log(`Culture review drafts: ${sections.length} questions, 4 distinct options each, answer positions ${distribution.join("/")}. No DB writes.`);
