"use client";
import {useRef,useState} from "react";
import {createClient} from "@/lib/supabase/client";
type Word={id:number;word:string;hanja_form:string|null;reading:string|null;meaning:string|null};
type Row={id:number;type:string;from:Word;to:Word};
export default function WordRelationStudy({rows}:{rows:Row[]}){
 const touchStart=useRef<{x:number;y:number}|null>(null);
 const [index,setIndex]=useState(0); const [revealed,setRevealed]=useState(false); const row=rows[index];
 async function reveal(){if(!row||revealed)return;setRevealed(true);const s=createClient();await s.rpc("record_expanded_learning",{p_content_type:"WORD_RELATION",p_content_id:row.id});}
 function move(delta:number){if(!rows.length)return;setIndex(i=>(i+delta+rows.length)%rows.length);setRevealed(false);}
 function onTouchEnd(event:React.TouchEvent<HTMLElement>){const start=touchStart.current;touchStart.current=null;if(!start)return;const dx=event.changedTouches[0].clientX-start.x;const dy=event.changedTouches[0].clientY-start.y;if(Math.abs(dx)>=55&&Math.abs(dx)>Math.abs(dy)*1.4)move(dx<0?1:-1);}
 if(!row)return <section className="study-card"><h2>준비 중이에요</h2><p>검수 완료된 학습 자료를 준비하고 있습니다.</p></section>;
 const label=row.type==="OPPOSITE"?"반의어":"유의어";
 return <section className="study-card free-study-card" onTouchStart={event=>{touchStart.current={x:event.touches[0].clientX,y:event.touches[0].clientY};}} onTouchEnd={onTouchEnd} onTouchCancel={()=>{touchStart.current=null;}}><p className="free-study-counter">{label} {index+1}/{rows.length}</p><button className="free-study-reveal" type="button" onClick={reveal}><strong className="relation-hanja">{row.from.hanja_form||row.from.word}</strong><span className="relation-reading">{row.from.reading||row.from.word}</span><span className="free-study-detail">{row.from.meaning}</span>{revealed?<><span className="free-study-hint">{label}</span><strong className="relation-hanja">{row.to.hanja_form||row.to.word}</strong><span className="relation-reading">{row.to.reading||row.to.word}</span><span className="free-study-detail">{row.to.meaning}</span></>:<span className="free-study-hint">눌러서 짝 확인</span>}</button><div className="free-study-actions"><button className="secondary-button" type="button" onClick={()=>move(-1)}>← 이전</button><button className="primary-button" type="button" onClick={()=>move(1)}>다음 →</button></div></section>;
}