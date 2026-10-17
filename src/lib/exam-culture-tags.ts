import type {CultureItem} from "./exam-generator.ts";

/**
 * Convert a database culture row to the generator's optional concept tag shape.
 * The caller may select the legacy columns only (pre-migration) or include
 * concept_tags (post-migration). Neither path requires changing existing rows.
 */
export function normalizeCultureItem<T extends CultureItem>(row:T):T{
 const raw=(row as T & {concept_tags?:unknown}).concept_tags;
 if(!Array.isArray(raw))return {...row,concept_tags:null};
 const tags=[...new Set(raw.filter((tag):tag is string=>typeof tag==="string").map(tag=>tag.trim()).filter(Boolean))];
 return {...row,concept_tags:tags};
}

export function normalizeCultureItems<T extends CultureItem>(rows:T[]):T[]{
 return rows.map(normalizeCultureItem);
}
