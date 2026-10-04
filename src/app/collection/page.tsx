import Link from "next/link";
import { requireActiveUser } from "@/lib/auth/require-active-user";
export default async function CollectionPage(){
 const {supabase:s,user}=await requireActiveUser();
 const {data:p}=await s.from("profiles").select("target_grade").eq("user_id",user.id).maybeSingle();
 const {data:st}=await s.from("user_settings").select("exam_provider_id").eq("user_id",user.id).maybeSingle();
 let gq=s.from("exam_grades").select("id,name").eq("code",p?.target_grade??"5");if(st?.exam_provider_id)gq=gq.eq("provider_id",st.exam_provider_id);
 const {data:grades}=await gq;if(!grades?.length)return <main className="app-shell"><section className="study-card"><h1>한자 도감</h1><p>목표 급수를 먼저 설정해 주세요.</p><Link href="/settings">설정하기</Link></section></main>;
 const gradeIds=grades.map(g=>g.id);const {data:maps}=await s.from("grade_hanja").select("hanja_id").in("grade_id",gradeIds);const ids=[...new Set((maps??[]).map(x=>x.hanja_id))];
 const [{data:h},{data:r},{data:prog}]=await Promise.all([s.from("hanja").select("id,character").in("id",ids),s.from("hanja_readings").select("hanja_id,reading,meaning").in("hanja_id",ids).eq("is_primary",true),s.from("user_hanja_progress").select("hanja_id,mastery_score,study_count,is_favorite").eq("user_id",user.id).in("hanja_id",ids)]);
 const rm=new Map((r??[]).map(x=>[x.hanja_id,x]));const pm=new Map((prog??[]).map(x=>[x.hanja_id,x]));const rows=(h??[]).map(x=>({id:x.id,character:x.character,reading:rm.get(x.id),progress:pm.get(x.id)})).sort((a,b)=>(b.progress?.study_count??0)-(a.progress?.study_count??0)||a.id-b.id);
 return <main className="app-shell"><section className="hero-card"><p className="eyebrow">{p?.target_grade??"목표 급수"}</p><h1>한자 도감</h1><p className="subtitle">배운 한자와 앞으로 만날 한자를 한눈에 봐요.</p></section><section className="collection-grid">{rows.map(x=><article className={"hanja-tile "+((x.progress?.study_count??0)>0?"learned":"locked")} key={x.id}><strong>{x.character}</strong>{(x.progress?.study_count??0)>0?<><span>{x.reading?.meaning} · {x.reading?.reading}</span><small>숙련도 {x.progress?.mastery_score??0}</small></>:<span>아직 안 배웠어요</span>}</article>)}</section><Link className="settings-link" href="/">홈으로</Link></main>;
}