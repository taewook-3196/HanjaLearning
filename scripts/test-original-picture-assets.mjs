// Static safety checks for original pictorial exam candidates.
// No database access and no publishing.
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";

const grade8 = {
  "original-sun.svg": "태양",
  "original-moon.svg": "달",
  "original-tree.svg": "나무",
  "original-fire.svg": "불",
  "original-water.svg": "물",
  "original-person.svg": "사람",
  "original-earth.svg": "흙",
  "original-gate.svg": "대문",
  "original-mother.svg": "어머니와 아이",
};
const grade7Extra = {
  "original-mountain.svg": "산",
  "original-mouth.svg": "입",
  "original-hand.svg": "손",
};
const all = { ...grade8, ...grade7Extra };
assert.equal(Object.keys(grade8).length, 9);
assert.equal(Object.keys(grade7Extra).length, 3);
assert.equal(new Set(Object.keys(all)).size, 12);
for (const [filename, label] of Object.entries(all)) {
  const svg = readFileSync(`public/exam-images/${filename}`, "utf8");
  assert.match(svg, /^<svg\s/);
  assert.match(svg, /xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  assert.match(svg, /viewBox="0 0 240 240"/);
  assert.ok(svg.includes(`aria-label="${label}"`), `${filename}: missing alt label`);
  assert.match(svg, /<\/svg>\s*$/);
  assert.doesNotMatch(svg, /<(?:script|foreignObject|image|use)\b/i);
  assert.doesNotMatch(svg, /\b(?:href|onload|onclick)\s*=/i);
  assert.doesNotMatch(svg, /(?:https?:\/\/|data:)/i, `${filename}: external or embedded reference`);
}
console.log("PASS: 12 local SVG candidates, expected labels, dimensions and no active/external content.");
console.log("NOT VERIFIED: visual clarity, grade eligibility, 4-choice quality, mobile display or database publication.");

const answerByFile = {
  "original-sun.svg": "日", "original-moon.svg": "月",
  "original-tree.svg": "木", "original-fire.svg": "火",
  "original-water.svg": "水", "original-person.svg": "人",
  "original-earth.svg": "土", "original-gate.svg": "門",
  "original-mother.svg": "母", "original-mountain.svg": "山",
  "original-mouth.svg": "口", "original-hand.svg": "手",
};
const grade8Characters = new Set("一七三九二五人兄八六北十南四土女子弟日月木東母水火父男西金門");
const grade7Characters = new Set([...grade8Characters, "山", "口", "手"]);
assert.equal(new Set(Object.values(answerByFile)).size, 12, "duplicate pictorial answers");
for (const filename of Object.keys(grade8)) {
  assert.ok(grade8Characters.has(answerByFile[filename]), `${filename}: not in 8급`);
}
for (const filename of Object.keys(grade7Extra)) {
  assert.ok(grade7Characters.has(answerByFile[filename]), `${filename}: not in 7급`);
}
for (const filename of Object.keys(all)) {
  const correct = answerByFile[filename];
  const eligible = filename in grade8 ? grade8Characters : grade7Characters;
  const wrong = [...eligible].filter(x => x !== correct).slice(0, 3);
  assert.equal(new Set([correct, ...wrong]).size, 4, `${filename}: not four distinct choices`);
}
console.log("PASS: unique character mappings, candidate grade eligibility and sufficient distinct choices.");
console.log("NOTE: this is a candidate-level check, not an end-to-end exam generator test.");

const preview=readFileSync("docs/original-picture-preview.html","utf8");
assert.match(preview, /<meta name="viewport"/, "mobile viewport is required");
assert.match(preview, /<main class="grid">/, "review grid is required");
assert.match(preview, /80px 시험 보기 크기로 전환/, "small-screen size toggle is required");
for(const [filename,label] of Object.entries(all)){
 const occurrences=preview.split(`../public/exam-images/${filename}`).length-1;
 assert.equal(occurrences,1,`${filename}: preview should reference each candidate exactly once`);
 assert.ok(preview.includes(`alt="${label}"`),`${filename}: preview image needs meaningful alt`);
}
console.log("PASS: review sheet references all 12 images once with Korean alt labels and mobile size toggle.");
