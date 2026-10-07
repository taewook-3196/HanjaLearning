import Link from "next/link";
import {requireActiveUser} from "@/lib/auth/require-active-user";
import HanjaCardStudy from "@/components/hanja-card-study";

export default async function HanjaCardsPage(){
 const {supabase:s,user}=await requireActiveUser();
 const [{data:p},{data:st}]=await Promise.all([
  s.from("profiles").select("target_grade").eq("user_id",user.id).maybeSingle(),
  s.from("user_settings").select("exam_provider_id").eq("user_id",user.id).maybeSingle()
 ]);
 let gq=s.from("exam_grades").select("id,name").eq("code",p?.target_grade??"5");
 if(st?.exam_provider_id)gq=gq.eq("provider_id",st.exam_provider_id);
 const {data:grades}=await gq;
 if(!grades?.length)return <main className="app-shell"><section className="study-card"><h1>한자 카드</h1><p>목표 급수를 먼저 설정해 주세요.</p><Link href="/settings">설정하기</Link></section></main>;
 const scope=(await Promise.all(grades.map(g=>s.rpc("list_grade_hanja_ids",{target_grade_id:g.id})))).flatMap(x=>x.data??[]);
 const ids=[...new Set(scope.map(x=>x.hanja_id))];
 const [{data:h},{data:r},{data:prog}]=await Promise.all([
  s.from("hanja").select("id,character").in("id",ids),
  s.from("hanja_readings").select("hanja_id,reading,meaning").in("hanja_id",ids).eq("is_primary",true),
  s.from("user_hanja_progress").select("hanja_id,study_count").eq("user_id",user.id).in("hanja_id",ids)
 ]);
 const rm=new Map((r??[]).map(x=>[x.hanja_id,x]));
 const learned=new Set((prog??[]).filter(x=>(x.study_count??0)>0).map(x=>x.hanja_id));
 const cards=(h??[]).map(x=>({id:x.id,character:x.character,reading:rm.get(x.id)?.reading??"",meaning:rm.get(x.id)?.meaning??"",learned:learned.has(x.id)}));
 return <main className="app-shell"><div className="page-top-actions"><Link className="settings-link" href="/">← 홈</Link></div><section className="hero-card"><p className="eyebrow">{p?.target_grade??"목표 급수"}</p><h1>한자 카드</h1><p className="subtitle">한자를 보고 뜻과 소리를 떠올린 뒤 눌러서 확인해 보세요.</p></section><HanjaCardStudy cards={cards}/></main>;
}
