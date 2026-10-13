import assert from "node:assert/strict";
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
