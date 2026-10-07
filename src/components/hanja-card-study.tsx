"use client";
import {useMemo,useRef,useState} from "react";
import {createClient} from "@/lib/supabase/client";

type Card={id:number;character:string;reading:string;meaning:string;learned:boolean;example:{word:string;reading:string|null;meaning:string|null}|null;relation:{label:string;word:string}|null;idiom:{idiom:string;reading:string|null;meaning:string|null}|null};

export default function HanjaCardStudy({cards}:{cards:Card[]}){
 const [onlyLearned,setOnlyLearned]=useState(false);
 const [index,setIndex]=useState(0);
 const [revealed,setRevealed]=useState(false);
 const touchX=useRef<number|null>(null);
 const skipClick=useRef(false);
 const recorded=useRef(new Set<number>());
 const pending=useRef(new Set<number>());
 const visible=useMemo(()=>onlyLearned?cards.filter(x=>x.learned):cards,[cards,onlyLearned]);
 const card=visible[index%Math.max(visible.length,1)];
 function move(delta:number){if(!visible.length)return;setIndex(i=>(i+delta+visible.length)%visible.length);setRevealed(false);}
 async function reveal(){
  if(skipClick.current){skipClick.current=false;return;}
  if(!card||revealed)return;
  setRevealed(true);
  const id=card.id;
  if(recorded.current.has(id)||pending.current.has(id))return;
  pending.current.add(id);
  try{
   const {error}=await createClient().rpc("record_expanded_learning",{p_content_type:"HANJA_CARD",p_content_id:id});
   if(!error)recorded.current.add(id);
  }finally{pending.current.delete(id);}
 }
 function changeMode(v:boolean){setOnlyLearned(v);setIndex(0);setRevealed(false);}
 if(!cards.length)return <section className="study-card free-study-card"><p>카드로 공부할 한자가 아직 없습니다.</p></section>;
 return <section className="study-card">
  <div className="card-mode-selector" style={{display:"flex",gap:8,marginBottom:16}}>
   <button type="button" className={!onlyLearned?"primary-button":"secondary-button"} onClick={()=>changeMode(false)}>전체 한자</button>
   <button type="button" className={onlyLearned?"primary-button":"secondary-button"} onClick={()=>changeMode(true)}>배운 한자만</button>
  </div>
  {!visible.length?<p>아직 배운 한자가 없습니다. 오늘 학습을 먼저 해보세요.</p>:<>
   <p className="free-study-counter" style={{textAlign:"center"}}>{index+1} / {visible.length}</p>
   <button type="button" className="free-study-reveal" onClick={reveal} onTouchStart={e=>{touchX.current=e.touches[0]?.clientX??null}} onTouchCancel={()=>{touchX.current=null}} onTouchEnd={e=>{if(touchX.current===null)return;const dx=(e.changedTouches[0]?.clientX??touchX.current)-touchX.current;touchX.current=null;if(Math.abs(dx)>55){skipClick.current=true;move(dx<0?1:-1)}}}>
    <strong className="free-study-character">{card.character}</strong>
    {revealed?<span style={{display:"block",marginTop:24}}><strong style={{display:"block",fontSize:"1.35rem"}}>{card.meaning} · {card.reading}</strong>{card.example?<span style={{display:"block",marginTop:16}}>예시 단어: {card.example.word}({card.example.reading}){card.example.meaning?` · ${card.example.meaning}`:""}</span>:null}{card.relation?<span style={{display:"block",marginTop:10}}>{card.relation.label}: {card.relation.word}</span>:null}{card.idiom?<span style={{display:"block",marginTop:10}}>사자성어: {card.idiom.idiom}({card.idiom.reading}){card.idiom.meaning?` · ${card.idiom.meaning}`:""}</span>:null}</span>:<span style={{display:"block",marginTop:24}}>눌러서 확인</span>}
   </button>
   <div className="free-study-actions">
    <button type="button" className="secondary-button" onClick={()=>move(-1)}>← 이전</button>
    <button type="button" className="primary-button" onClick={()=>move(1)}>다음 →</button>
   </div>
   <p style={{textAlign:"center",marginTop:12}}>좌우로 밀어서 넘길 수도 있어요.</p>
  </>}
 </section>;
}
