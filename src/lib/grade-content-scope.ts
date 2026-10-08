import type {SupabaseClient} from "@supabase/supabase-js";

/** IDs included in the current user's selected exam provider and target grade. */
export async function getTargetGradeHanjaIds(s:SupabaseClient,userId:string):Promise<Set<number>>{
 const [{data:profile},{data:settings}]=await Promise.all([
  s.from("profiles").select("target_grade").eq("user_id",userId).maybeSingle(),
  s.from("user_settings").select("exam_provider_id").eq("user_id",userId).maybeSingle()
 ]);
 let query=s.from("exam_grades").select("id").eq("code",profile?.target_grade??"5");
 if(settings?.exam_provider_id)query=query.eq("provider_id",settings.exam_provider_id);
 const {data:grades}=await query;
 const results=await Promise.all((grades??[]).map(g=>s.rpc("list_grade_hanja_ids",{target_grade_id:g.id})));
 return new Set<number>(results.flatMap(r=>(r.data??[]).map((x:{hanja_id:number})=>x.hanja_id)));
}
