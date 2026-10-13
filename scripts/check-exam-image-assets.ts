import { strict as assert } from "node:assert";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { DAEHAN_FIELD_BLUEPRINTS } from "../src/lib/exam-blueprints.ts";

// This manifest describes source assets only. Production DB must be checked separately.
const imageAssets = [
  { hanja: "木", path: "/exam-images/tree.svg" },
  { hanja: "水", path: "/exam-images/water.svg" },
  { hanja: "火", path: "/exam-images/fire.svg" },
] as const;

for (const item of imageAssets) {
  const filename = join(process.cwd(), "public", item.path.slice(1));
  assert.ok(existsSync(filename), `Missing image asset for ${item.hanja}: ${filename}`);
  const svg = readFileSync(filename, "utf8");
  assert.match(svg, /<svg\\b/, `Invalid SVG for ${item.hanja}`);
  assert.match(svg, /<\\/svg>/, `Unclosed SVG for ${item.hanja}`);
}
for (const grade of ["7", "8"]) {
  const blueprint = DAEHAN_FIELD_BLUEPRINTS[grade];
  const required = blueprint.items.filter(x => x.type === "IMAGE_RECOGNITION").reduce((n,x)=>n+x.count,0);
  assert.ok(imageAssets.length >= required, `Grade ${grade}: ${imageAssets.length}/${required} image assets`);
  console.log(`PASS: grade ${grade} source images ${imageAssets.length}/${required}`);
}
console.log("PASS: pictorial source assets exist. NOTE: production DB readiness is NOT checked by this script.");
