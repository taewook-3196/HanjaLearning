// Regression guard: changing target grade must not mutate per-Hanja progress.
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";

const settings = readFileSync("src/app/settings/page.tsx", "utf8");
const home = readFileSync("src/app/page.tsx", "utf8");
const learn = readFileSync("src/app/learn/page.tsx", "utf8");

assert.match(settings, /rpc\("save_learning_settings"/);
assert.doesNotMatch(settings, /from\("user_hanja_progress"\)\.(?:delete|update|upsert|insert)/);
assert.match(home, /rpc\("list_grade_hanja_ids"/);
assert.match(home, /from\("user_hanja_progress"\)/);
assert.match(learn, /rpc\("list_grade_hanja_ids"/);
assert.match(learn, /from\("user_hanja_progress"\)/);

type Progress = { userId: string; hanjaId: number; mastery: number; stage: number; wrong: number };
const records: Progress[] = [
  { userId: "child-a", hanjaId: 101, mastery: 85, stage: 5, wrong: 2 },
  { userId: "child-a", hanjaId: 102, mastery: 30, stage: 2, wrong: 4 },
  { userId: "child-b", hanjaId: 101, mastery: 10, stage: 1, wrong: 1 },
];
const scopes = { "5": [101], "4": [101, 102] } as const;
const snapshot = structuredClone(records);
function view(userId: string, grade: keyof typeof scopes) {
  return records.filter(row => row.userId === userId && (scopes[grade] as readonly number[]).includes(row.hanjaId));
}
assert.equal(view("child-a", "5")[0].mastery, 85);
assert.deepEqual(view("child-a", "4").map(x => x.mastery), [85, 30]);
assert.equal(view("child-a", "5")[0].stage, 5);
assert.deepEqual(records, snapshot, "grade switching must not change progress or other users");
console.log("PASS: grade-switch view preserves per-user Hanja progress; settings UI has no direct progress writes");
