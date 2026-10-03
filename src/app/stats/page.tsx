import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
export default async function StatsPage(){
 const s=await createClient();const {data:{user}}=await s.auth.getUser();if(!user)redirect("/login");
 const since=new Date(); since.setUTCDate(since.getUTCDate()-7); const sinceIso=since.toISOString();
 const [{data:history},{data:progress}]=await Promise.all([
  s.from("review_history").select("result,created_at").eq("user_id",user.id).gte("created_at",sinceIso).order("created_at",{ascending:false}),
  s.from("user_hanja_progress").select("mastery_score,study_count,wrong_streak").eq("user_id",user.id).gt("study_count",0)
 ]);
 const attempts=history??[];const correct=attempts.filter(x=>x.result==="CORRECT"||x.result==="KNOWN").length;const accuracy=attempts.length?Math.round(correct/attempts.length*100):0;
 const learned=(progress??[]).length;const mastered=(progress??[]).filter(x=>(x.mastery_score??0)>=75).length;const difficult=(progress??[]).filter(x=>(x.wrong_streak??0)>0).length;
 const days=new Set(attempts.map(x=>x.created_at.slice(0,10))).size;
 return <main className="app-shell"><section className="hero-card"><p className="eyebrow">최근 7일</p><h1>나의 학습 기록</h1><p className="subtitle">점수보다 꾸준히 배운 기록을 확인해요.</p></section><section className="study-card"><div className="study-grid"><div className="study-item"><span>학습한 한자</span><strong>{learned}자</strong></div><div className="study-item"><span>학습한 날</span><strong>{days}일</strong></div><div className="study-item"><span>정답률</span><strong>{accuracy}%</strong></div><div className="study-item"><span>익숙한 한자</span><strong>{mastered}자</strong></div><div className="study-item"><span>다시 볼 한자</span><strong>{difficult}자</strong></div><div className="study-item"><span>문제·복습</span><strong>{attempts.length}회</strong></div></div></section><Link className="settings-link" href="/">홈으로</Link></main>;
}