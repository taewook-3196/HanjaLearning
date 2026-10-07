"use client";
import {useRef,useState} from "react";
import {createClient} from "@/lib/supabase/client";
type Idiom={id:number;idiom:string;reading:string|null;meaning:string|null;child_explanation:string|null};
export default function IdiomStudy({rows}:{rows:Idiom[]}){
 const [index,setIndex]=useState(0);
 const [revealed,setRevealed]=useState(false);
 const recorded=useRef(new Set<number>());
 const row=rows[index];
 async function reveal(){
  if(!row||revealed)return;
  setRevealed(true);
  if(recorded.current.has(row.id))return;
  const {error}=await createClient().rpc("record_expanded_learning",{p_content_type:"IDIOM",p_content_id:row.id});
  if(!error)recorded.current.add(row.id);
 }
 function move(delta:number){
  if(!rows.length)return;
  setIndex(i=>(i+delta+rows.length)%rows.length);
  setRevealed(false);
 }
 if(!row)return <section className="study-card"><h2>학습 자료 준비 중</h2><p>검수 완료된 사자성어가 아직 없습니다.</p></section>;
 return <section className="study-card"><p className="eyebrow">{index+1} / {rows.length}</p><button type="button" onClick={reveal} aria-label={revealed?"사자성어 뜻 확인됨":"사자성어 뜻 확인하기"} style={{display:"block",width:"100%",padding:24,minHeight:240,border:"1px solid var(--border)",borderRadius:20,background:"var(--card)",cursor:"pointer"}}><strong style={{display:"block",fontSize:"2.8rem",letterSpacing:".1em"}}>{row.idiom}</strong>{revealed?<><strong style={{display:"block",marginTop:16}}>{row.reading}</strong><span style={{display:"block",marginTop:12}}>{row.child_explanation||row.meaning}</span></>:<span style={{display:"block",marginTop:24}}>눌러서 뜻 확인하기</span>}</button><div style={{display:"flex",gap:12,marginTop:14}}><button type="button" className="secondary-button" onClick={()=>move(-1)}>← 이전</button><button type="button" className="primary-button" onClick={()=>move(1)}>다음 →</button></div></section>;
}