export type LearningOrder = "STROKE" | "READING" | "RANDOM";

export function orderLearningIds(ids: number[], order: LearningOrder, options: {
 readings?: ReadonlyMap<number, string>;
 strokes?: ReadonlyMap<number, number>;
 userId?: string;
 day?: string;
} = {}): number[] {
 const result = ids.slice();
 if (order === "READING" || order === "STROKE") {
  const readings = options.readings ?? new Map<number, string>();
  const strokes = options.strokes ?? new Map<number, number>();
  return result.sort((a, b) => order === "READING"
   ? (readings.get(a) ?? "").localeCompare(readings.get(b) ?? "", "ko") || a - b
   : (strokes.get(a) ?? 999) - (strokes.get(b) ?? 999)
    || (readings.get(a) ?? "").localeCompare(readings.get(b) ?? "", "ko") || a - b);
 }
 if (order === "RANDOM") {
  const seedText = (options.userId ?? "") + ":" + (options.day ?? "");
  let seed = 2166136261;
  for (let i = 0; i < seedText.length; i++) seed = Math.imul(seed ^ seedText.charCodeAt(i), 16777619);
  const randomRank = (id: number) => {
   let x = seed ^ id;
   x = Math.imul(x ^ (x >>> 16), 0x7feb352d);
   x = Math.imul(x ^ (x >>> 15), 0x846ca68b);
   return (x ^ (x >>> 16)) >>> 0;
  };
  return result.sort((a, b) => randomRank(a) - randomRank(b) || a - b);
 }
 return result;
}
