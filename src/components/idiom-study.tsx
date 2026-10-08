"use client";
import {useRef,useState} from "react";
import {createClient} from "@/lib/supabase/client";
type Idiom={id:number;idiom:string;reading:string|null;meaning:string|null;child_explanation:string|null;characters:{character:string;meaning:string;reading:string}[];inGrade:boolean};
export default function IdiomStudy({rows}:{rows:Idiom[]}){
 const [gradeOnly,setGradeOnly]=useState(true);
 const visible=gradeOnly?rows.filter(x=>x.inGrade):rows;
 const [index,setIndex]=useState(0);
 const [revealed,setRevealed]=useState(false);
 const recorded=useRef(new Set<number>());
 const touchStart=useRef<{x:number;y:number}|null>(null);
 const row=visible[index];
 async function reveal(){
  if(!row||revealed)return;
  setRevealed(true);
  if(recorded.current.has(row.id))return;
  const {error}=await createClient().rpc("record_expanded_learning",{p_content_type:"IDIOM",p_content_id:row.id});
  if(!error)recorded.current.add(row.id);
 }
 function move(delta:number){
  if(!visible.length)return;
  setIndex(i=>(i+delta+visible.length)%visible.length);
  setRevealed(false);
 }
 function onTouchEnd(event:React.TouchEvent<HTMLElement>){
  const start=touchStart.current;
  touchStart.current=null;
  if(!start)return;
  const dx=event.changedTouches[0].clientX-start.x;
  const dy=event.changedTouches[0].clientY-start.y;
  if(Math.abs(dx)<55||Math.abs(dx)<Math.abs(dy)*1.4)return;
  move(dx<0?1:-1);
 }
 if(!row)return <section className="study-card"><div className="card-mode-selector"><button type="button" className={!gradeOnly?"primary-button":"secondary-button"} onClick={()=>{setGradeOnly(false);setIndex(0);setRevealed(false);}}>전체 보기</button><button type="button" className={gradeOnly?"primary-button":"secondary-button"} onClick={()=>{setGradeOnly(true);setIndex(0);setRevealed(false);}}>목표 급수</button></div><p>해당 급수에 맞는 사자성어가 없습니다. 전체 보기를 선택해 주세요.</p></section>;
 return <section className="study-card free-study-card" onTouchStart={event=>{touchStart.current={x:event.touches[0].clientX,y:event.touches[0].clientY};}} onTouchEnd={onTouchEnd} onTouchCancel={()=>{touchStart.current=null;}}><div className="card-mode-selector"><button type="button" className={!gradeOnly?"primary-button":"secondary-button"} onClick={()=>{setGradeOnly(false);setIndex(0);setRevealed(false);}}>전체 보기</button><button type="button" className={gradeOnly?"primary-button":"secondary-button"} onClick={()=>{setGradeOnly(true);setIndex(0);setRevealed(false);}}>목표 급수</button></div><p className="free-study-counter">{index+1} / {visible.length}</p><button type="button" className="free-study-reveal" onClick={reveal} aria-label={revealed?"사자성어 뜻 확인됨":"사자성어 뜻 확인하기"}><strong>{row.idiom}</strong>{revealed?<><strong className="free-study-detail">{row.reading}</strong><span className="free-study-detail">{row.child_explanation||row.meaning}</span><span className="idiom-character-glosses">{row.characters.map((item,i)=><span key={i} className="idiom-character-gloss"><strong>{item.character}</strong><span>{item.meaning} {item.reading}</span></span>)}</span></>:<span className="free-study-hint">눌러서 뜻 확인하기</span>}</button><div className="free-study-actions"><button type="button" className="secondary-button" onClick={()=>move(-1)}>← 이전</button><button type="button" className="primary-button" onClick={()=>move(1)}>다음 →</button></div></section>;
}