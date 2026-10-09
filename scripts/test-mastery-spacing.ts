// Guard the proposed SQL migration against accidental removal of spaced-review rules.
// Run with: node --experimental-strip-types scripts/test-mastery-spacing.ts
import { readFileSync } from "node:fs";
import { strict as assert } from "node:assert";

const sql = readFileSync("supabase/migrations/202610090800_spaced_review_stage.sql", "utf8");
assert.match(sql, /old_row\.next_review_at\s*<=\s*now_at/);
assert.match(sql, /when is_correct and eligible_review then least\(7/);
assert.match(sql, /when is_correct then coalesce\(old_row\.review_stage,0\)/);
assert.match(sql, /when is_correct and eligible_review then 8 when is_correct then 0 else -12/);
assert.match(sql, /when is_correct and not eligible_review then old_row\.next_review_at/);
assert.match(sql, /perform pg_advisory_xact_lock/);
assert.match(sql, /where user_id=uid and hanja_id=target_hanja_id for update/);
assert.match(sql, /revoke all on function public\.record_study_result/);
assert.match(sql, /grant execute on function public\.record_study_result.*to authenticated/);

type Progress = { score:number; stage:number; nextReviewAt:number|null };
function applyKnown(p:Progress|null, now:number):Progress {
  const due = p === null || p.nextReviewAt === null || p.nextReviewAt <= now;
  const stage = due ? Math.min(7,(p?.stage ?? 0)+1) : p.stage;
  const score = Math.min(85,(p?.score ?? 0)+(due?8:0));
  const days=[0,1,3,7,14,30,60,120];
  return {score,stage,nextReviewAt:due?now+days[stage]*86400000:p.nextReviewAt};
}
const day=86400000;
let p=applyKnown(null,0);
assert.deepEqual(p,{score:8,stage:1,nextReviewAt:day});
for(let i=0;i<20;i++)p=applyKnown(p,0);
assert.deepEqual(p,{score:8,stage:1,nextReviewAt:day},"same-day repeats must not advance");
p=applyKnown(p,day);
assert.deepEqual(p,{score:16,stage:2,nextReviewAt:day+3*day});
p=applyKnown(p,day+day);
assert.equal(p.stage,2);
assert.equal(p.score,16);
console.log("PASS: migration invariants and spaced-review model scenarios");
