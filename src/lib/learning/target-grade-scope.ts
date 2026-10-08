import {requireActiveUser} from "@/lib/auth/require-active-user";

export async function getTargetGradeScope(){
 const {supabase,user}=await requireActiveUser();
 const [{data:profile},{data:settings}]=await Promise.all([
  supabase.from("profiles").select("target_grade").eq("user_id",user.id).maybeSingle(),
  supabase.from("user_settings").select("exam_provider_id").eq("user_id",user.id).maybeSingle()
 ]);
 const grade=profile?.target_grade??"5";
 let query=supabase.from("exam_grades").select("id").eq("code",grade);
 if(settings?.exam_provider_id)query=query.eq("provider_id",settings.exam_provider_id);
 const {data:grades}=await query;
 const scopes=await Promise.all((grades??[]).map(g=>supabase.rpc("list_grade_hanja_ids",{target_grade_id:g.id})));
 return {supabase,grade,allowed:new Set(scopes.flatMap(x=>(x.data??[]).map((h:{hanja_id:number})=>h.hanja_id)))};
}
