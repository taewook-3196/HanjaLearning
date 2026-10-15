import { readFileSync } from "node:fs";
import { strict as assert } from "node:assert";

const sql = readFileSync("supabase/migrations/20261015075000_grade8_picture_bank_draft.sql", "utf8");
const expected: Record<string, string> = {
  sun: "22", moon: "19", person: "21", gate: "10", earth: "27", child: "24",
};
for (const [name, id] of Object.entries(expected)) {
  assert.match(sql, new RegExp(String.raw`\\(\\s*${id},\\s*'/exam-images/${name}\\.svg'`), `Missing or incorrect ${name} seed mapping`);
  const svg = readFileSync(`public/exam-images/${name}.svg`, "utf8");
  assert.match(svg, /<svg\\b/);
  assert.doesNotMatch(svg, /aria-label="[^"]*[日月人門土子][^"]*"/, `Answer leaked in ${name} SVG label`);
}
assert.match(sql, /'APP_ORIGINAL','DRAFT'/);
assert.match(sql, /pg_get_serial_sequence\\('hanja_image_items','id'\\)/);
assert.match(sql, /ON CONFLICT \\(asset_path\\) DO NOTHING/);
assert.doesNotMatch(sql, /'PUBLISHED'/);
console.log("Grade 8 picture seed contract: 6 verified DRAFT mappings");
