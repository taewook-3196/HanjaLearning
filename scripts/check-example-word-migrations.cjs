const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const base = process.env.MIGRATION_CHECK_BASE || "HEAD^";
let changed = [];
try {
  changed = execFileSync("git", ["diff", "--name-only", "--diff-filter=AM", base + "...HEAD"], { encoding: "utf8" })
    .split(/\\r?\\n/)
    .filter((name) => /^supabase\\/migrations\\/.*\\.sql$/.test(name));
} catch {
  console.error("Could not determine changed migrations from " + base);
  process.exit(1);
}

const failures = [];
for (const file of changed) {
  const fullPath = path.join(process.cwd(), file);
  if (!fs.existsSync(fullPath)) continue;
  const sql = fs.readFileSync(fullPath, "utf8");
  if (!/hanja_words/i.test(sql) || !/hanja_word_map/i.test(sql)) continue;
  const mapInsert = /insert\\s+into\\s+public\\.hanja_word_map/i.exec(sql);
  if (!mapInsert) continue;
  const beforeMap = sql.slice(0, mapInsert.index);
  const withIndex = beforeMap.toLowerCase().lastIndexOf("with words");
  if (withIndex < 0) continue;
  const mappingSection = beforeMap.slice(withIndex);
  if (/with\\s+words[\\s\\S]*?as\\s*\\(\\s*values\\s*\\)/i.test(mappingSection)) {
    failures.push(file + ": hanja_word_map mapping words VALUES is empty");
  }
}

if (failures.length) {
  console.error("Example-word migration integrity check failed:");
  for (const failure of failures) console.error("- " + failure);
  process.exit(1);
}
console.log("Checked " + changed.length + " changed migrations: no empty example-word mapping lists found.");
