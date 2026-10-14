import { strict as assert } from "node:assert";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { DAEHAN_FIELD_BLUEPRINTS } from "../src/lib/exam-blueprints.ts";

// This manifest describes source assets only. Production DB must be checked separately.
// Run through PR CI on public GitHub; no production database writes are required.
const imageAssets = [
  { hanja: "木", path: "/exam-images/tree.svg" },
  { hanja: "水", path: "/exam-images/water.svg" },
  { hanja: "火", path: "/exam-images/fire.svg" },
  { hanja: "日", path: "/exam-images/sun.svg" },
  { hanja: "月", path: "/exam-images/moon.svg" },
  { hanja: "人", path: "/exam-images/person.svg" },
  { hanja: "門", path: "/exam-images/gate.svg" },
  { hanja: "土", path: "/exam-images/earth.svg" },
  { hanja: "子", path: "/exam-images/child.svg" },
] as const;

for (const item of imageAssets) {
  const filename = join(process.cwd(), "public", item.path.slice(1));
  assert.ok(existsSync(filename), `Missing image asset for ${item.hanja}: ${filename}`);
  const svg = readFileSync(filename, "utf8");
  assert.match(svg, /<svg\b/, `Invalid SVG for ${item.hanja}`);
  assert.match(svg, /<\/svg>/, `Unclosed SVG for ${item.hanja}`);
}
for (const grade of ["7", "8"]) {
  const blueprint = DAEHAN_FIELD_BLUEPRINTS[grade];
  const required = blueprint.items.filter(x => x.type === "IMAGE_RECOGNITION").reduce((n,x)=>n+x.count,0);
  assert.ok(imageAssets.length >= required, `Grade ${grade}: ${imageAssets.length}/${required} image assets`);
  console.log(`PASS: grade ${grade} source images ${imageAssets.length}/${required}`);
}
assert.equal(new Set(imageAssets.map(x=>x.hanja)).size,imageAssets.length,"Duplicate image hanja");
assert.equal(new Set(imageAssets.map(x=>x.path)).size,imageAssets.length,"Duplicate image path");
const grade8Pictures=DAEHAN_FIELD_BLUEPRINTS["8"].items.filter(x=>x.type==="IMAGE_RECOGNITION").reduce((n,x)=>n+x.count,0);
assert.ok(imageAssets.length>=grade8Pictures*3,`Grade 8: ${imageAssets.length}/${grade8Pictures*3} pictures required for three non-repeating exams`);
console.log("PASS: 8급 source picture pool supports three exams without repeats (pending DB publication).");
console.log("PASS: pictorial source assets exist. NOTE: production DB readiness is NOT checked by this script.");
