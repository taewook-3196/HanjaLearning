"use client";
import {useState} from "react";
import {createClient} from "@/lib/supabase/client";
type Word={id:number;word:string;reading:string|null;meaning:string|null};
type Row={id:number;type:string;from:Word;to:Word};
export default function WordRelationStudy({rows}:{rows:Row[]}){
 const [index,setIndex]=useState(0); const [revealed,setRevealed]=useState(false); const row=rows[index];
 async function reveal(){if(!row)return;setRevealed(true);const s=createClient();await s.rpc("record_expanded_learning",{p_content_type:"WORD_RELATION",p_content_id:row.id});}
 function move(delta:number){if(!rows.length)return;setIndex(i=>(i+delta+rows.length)%rows.length);setRevealed(false);}
 if(!row)return <section className="study-card"><h2>준비 중이에요</h2><p>검수 완료된 학습 자료를 준비하고 있습니다.</p></section>;
 const label=row.type==="OPPOSITE"?"반의어":"유의어";
 return <section className="study-card"><p>{label} {index+1}/{rows.length}</p><button type="button" onClick={reveal}><strong>{row.from.word}</strong><span>{row.from.meaning}</span>{revealed?<><span>{label}</span><strong>{row.to.word}</strong><span>{row.to.meaning}</span></>:<span>눌러서 짝 확인</span>}</button><div><button type="button" onClick={()=>move(-1)}>이전</button><button type="button" onClick={()=>move(1)}>다음</button></div></section>;
}