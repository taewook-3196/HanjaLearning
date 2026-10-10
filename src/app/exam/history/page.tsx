"use client";
import Link from "next/link";
import { useEffect,useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/bottom-nav";
import { createClient } from "@/lib/supabase/client";
import { officialGradeDisplayName } from "@/lib/grade-display";

type Attempt={id:number;exam_mode:string;question_count:number;correct_count:number;score_percent:number;passed:boolean;submitted_at:string|null;exam_grades:{code:string}|null};

export default function ExamHistoryPage(){
 const router=useRouter();
 const [rows,setRows]=useState<Attempt[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState("");
 useEffect(()=>{void(async()=>{const s=createClient();const {data:{user}}=await s.auth.getUser();if(!user){router.replace("/login");return}const {data,error:e}=await s.from("exam_attempts").select("id,exam_mode,question_count,correct_count,score_percent,passed,submitted_at,exam_grades(code)").order("submitted_at",{ascending:false}).limit(50);if(e){setError("시험 기록을 불러오지 못했어요.");setLoading(false);return}setRows((data??[]) as unknown as Attempt[]);setLoading(false)})()},[router]);
 return <main className="app-shell"><section className="study-card"><p className="eyebrow">모의시험</p><h1>시험 기록</h1><p>최근 모의시험 결과를 확인하고 저장된 시험은 문제별 답안을 다시 볼 수 있어요.</p>{loading?<p>기록을 불러오는 중…</p>:error?<p role="alert">{error}</p>:rows.length===0?<p>아직 저장된 모의시험 기록이 없어요.</p>:<div style={{display:"grid",gap:12,marginTop:18}}>{rows.map(a=><Link key={a.id} href={"/exam/history/"+a.id} style={{display:"block",border:"1px solid #ddd",borderRadius:16,padding:16,textDecoration:"none",color:"inherit"}}><strong>{officialGradeDisplayName(a.exam_grades?.code)} · {a.exam_mode==="FIELD"?"현장":"온라인"} 모의시험</strong><p style={{margin:"8px 0 4px",fontWeight:800}}>{a.correct_count}/{a.question_count} 정답 · {a.score_percent}점 · {a.passed?"합격":"불합격"}</p><small>{a.submitted_at?new Date(a.submitted_at).toLocaleString("ko-KR"):"제출 시간 없음"}</small></Link>)}</div>}<div style={{marginTop:20}}><Link className="primary-link" href="/exam">새 모의시험</Link></div></section><BottomNav active="exam"/></main>;
}