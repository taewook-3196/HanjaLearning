"use client";
import {useMemo,useRef,useState} from "react";
import {createClient} from "@/lib/supabase/client";

type Card={id:number;character:string;reading:string;meaning:string;learned:boolean};

export default function HanjaCardStudy({cards}:{cards:Card[]}){
 const [onlyLearned,setOnlyLearned]=useState(false);
 const [index,setIndex]=useState(0);
 const [revealed,setRevealed]=useState(false);
 const touchX=useRef<number|null>(null);
 const visible=useMemo(()=>onlyLearned?cards.filter(x=>x.learned):cards,[cards,onlyLearned]);
 const card=visible[index%Math.max(visible.length,1)];
 function move(delta:number){if(!visible.length)return;setIndex(i=>(i+delta+visible.length)%visible.length);setRevealed(false);}
 async function reveal(){if(!card)return;setRevealed(true);const s=createClient();await s.rpc("record_expanded_learning",{p_content_type:"HANJA_CARD",p_content_id:card.id});}
 function changeMode(v:boolean){setOnlyLearned(v);setIndex(0);setRevealed(false);}
 if(!cards.length)return <section className="study-card"><p>카드로 공부할 한자가 아직 없습니다.</p></section>;
 return <section className="study-card">
  <div style={{display:"flex",gap:8,marginBottom:16}}>
   <button type="button" className={!onlyLearned?"primary-button":"secondary-button"} onClick={()=>changeMode(false)}>전체 한자</button>
   <button type="button" className={onlyLearned?"primary-button":"secondary-button"} onClick={()=>changeMode(true)}>배운 한자만</button>
  </div>
  {!visible.length?<p>아직 배운 한자가 없습니다. 오늘 학습을 먼저 해보세요.</p>:<>
   <p style={{textAlign:"center"}}>{index+1} / {visible.length}</p>
   <button type="button" onClick={reveal} onTouchStart={e=>{touchX.current=e.touches[0]?.clientX??null}} onTouchEnd={e=>{if(touchX.current===null)return;const dx=(e.changedTouches[0]?.clientX??touchX.current)-touchX.current;touchX.current=null;if(Math.abs(dx)>55)move(dx<0?1:-1)}} style={{width:"100%",minHeight:330,border:"1px solid var(--border)",borderRadius:24,background:"var(--card)",padding:24,cursor:"pointer"}}>
    <strong style={{display:"block",fontSize:"clamp(7rem,38vw,12rem)",lineHeight:1}}>{card.character}</strong>
    {revealed?<span style={{display:"block",fontSize:"1.35rem",marginTop:24,fontWeight:700}}>{card.meaning} · {card.reading}</span>:<span style={{display:"block",marginTop:24}}>눌러서 확인</span>}
   </button>
   <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:14}}>
    <button type="button" className="secondary-button" onClick={()=>move(-1)}>← 이전</button>
    <button type="button" className="primary-button" onClick={()=>move(1)}>다음 →</button>
   </div>
   <p style={{textAlign:"center",marginTop:12}}>좌우로 밀어서 넘길 수도 있어요.</p>
  </>}
 </section>;
}
