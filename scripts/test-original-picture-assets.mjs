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
