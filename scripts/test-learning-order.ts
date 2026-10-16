import assert from "node:assert/strict";
import { buildStudyPlan } from "../src/lib/study-plan.ts";
import { orderLearningIds } from "../src/lib/learning-order.ts";

const ids = [5, 3, 2, 4, 1];
const readings = new Map([[1, "가"], [2, "나"], [3, "다"], [4, "라"], [5, "마"]]);
const strokes = new Map([[1, 5], [2, 2], [3, 2], [4, 3], [5, 1]]);
assert.deepEqual(orderLearningIds(ids, "READING", { readings }), [1, 2, 3, 4, 5]);
assert.deepEqual(orderLearningIds(ids, "STROKE", { readings, strokes }), [5, 2, 3, 4, 1]);
assert.deepEqual(ids, [5, 3, 2, 4, 1], "sorting must not mutate input");
const random = orderLearningIds(ids, "RANDOM", { userId: "student-1", day: "2026-10-14" });
assert.deepEqual(random, orderLearningIds([...ids].reverse(), "RANDOM", { userId: "student-1", day: "2026-10-14" }));
assert.deepEqual([...random].sort(), [...ids].sort());
console.log("Learning order regression checks passed");

for(const dueReviews of [0,3,8,12,30]){
 const plan=buildStudyPlan({unseen:100,dueReviews,examDate:null});
 assert.ok(plan.newCount>=3,`new characters must remain available with ${dueReviews} due reviews`);
 assert.ok(plan.reviewCount<=dueReviews);
 assert.equal(plan.total,plan.newCount+plan.reviewCount);
 assert.ok(plan.total<=16);
}
assert.equal(buildStudyPlan({unseen:0,dueReviews:20}).newCount,0);
assert.equal(buildStudyPlan({unseen:5,dueReviews:8}).newCount,3);
assert.equal(buildStudyPlan({unseen:5,dueReviews:8}).reviewCount,5);
console.log("No-deadline daily learning balances new and review characters.");
