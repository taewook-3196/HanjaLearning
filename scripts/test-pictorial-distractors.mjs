// Regression guard: image choices use the same confusable-character ranking as other Hanja questions.
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
const source = readFileSync("src/lib/exam-generator.ts", "utf8");
const imageBlock = source.slice(source.indexOf("const imageQs="), source.indexOf("const usageQs="));
assert.ok(imageBlock.includes('selectHanjaDistractors(target,"character")'), "pictorial questions should prioritize confusable characters");
assert.ok(imageBlock.includes('characterById.has(x.hanja_id)'), "image must have a valid Hanja mapping");
assert.ok(imageBlock.includes('choices:shuffle([correct,...wrong])'), "image choices should be shuffled");
assert.ok(source.includes('new Set(q.choices).size===4'), "four unique choices validation must remain");
console.log("PASS: pictorial distractor priority and four-choice guards");
