"use client";
import {useRef,useState} from "react";
import {createClient} from "@/lib/supabase/client";
type Word={id:number;word:string;hanja_form:string|null;reading:string|null;meaning:string|null;characters:{character:string;meaning:string;reading:string}[]};
type Row={id:number;inGrade:boolean;type:string;from:Word;to:Word;note?:string|null};
const learningNotes:Record<number,string>={
 14:"선생은 상대를 높여 부르는 말이고, 교사는 가르치는 일을 하는 사람을 가리켜요.",
 21:"본인은 바로 그 당사자, 자기는 자신을 가리키는 말이에요. 문장에 따라 다르게 써요.",
 23:"노력은 힘써 애쓰는 일, 진력은 온 힘을 다한다는 뜻으로 글에서 자주 써요.",
};
function CharacterGloss({word}:{word:Word}){return <span className="relation-character-glosses">{word.characters.map((item,i)=><span className="relation-character-gloss" key={i}><strong>{item.character}</strong><span>{item.meaning&&item.reading?`${item.meaning} ${item.reading}`:"훈음 확인 중"}</span></span>)}</span>;}
export default function WordRelationStudy({rows}:{rows:Row[]}){
 const touchStart=useRef<{x:number;y:number}|null>(null);
 const [gradeOnly,setGradeOnly]=useState(true);
 const visible=gradeOnly?rows.filter(x=>x.inGrade):rows;
 const [index,setIndex]=useState(0); const [revealed,setRevealed]=useState(false); const row=visible[index];
 async function reveal(){if(!row||revealed)return;setRevealed(true);const s=createClient();await s.rpc("record_expanded_learning",{p_content_type:"WORD_RELATION",p_content_id:row.id});}
 function move(delta:number){if(!visible.length)return;setIndex(i=>(i+delta+visible.length)%visible.length);setRevealed(false);}
 function onTouchEnd(event:React.TouchEvent<HTMLElement>){const start=touchStart.current;touchStart.current=null;if(!start)return;const dx=event.changedTouches[0].clientX-start.x;const dy=event.changedTouches[0].clientY-start.y;if(Math.abs(dx)>=55&&Math.abs(dx)>Math.abs(dy)*1.4)move(dx<0?1:-1);}
 if(!row)return <section className="study-card"><div className="card-mode-selector"><button type="button" className={!gradeOnly?"primary-button":"secondary-button"} onClick={()=>{setGradeOnly(false);setIndex(0);setRevealed(false);}}>전체 보기</button><button type="button" className={gradeOnly?"primary-button":"secondary-button"} onClick={()=>{setGradeOnly(true);setIndex(0);setRevealed(false);}}>목표 급수</button></div><p>해당 급수에 맞는 유의어·반의어가 없습니다. 전체 보기를 선택해 주세요.</p></section>;
 const label=row.type==="OPPOSITE"?"반의어":"유의어";
 const learningNote=learningNotes[row.id];
 return <section className="study-card free-study-card" onTouchStart={event=>{touchStart.current={x:event.touches[0].clientX,y:event.touches[0].clientY};}} onTouchEnd={onTouchEnd} onTouchCancel={()=>{touchStart.current=null;}}><div className="card-mode-selector"><button type="button" className={!gradeOnly?"primary-button":"secondary-button"} onClick={()=>{setGradeOnly(false);setIndex(0);setRevealed(false);}}>전체 보기</button><button type="button" className={gradeOnly?"primary-button":"secondary-button"} onClick={()=>{setGradeOnly(true);setIndex(0);setRevealed(false);}}>목표 급수</button></div><p className="free-study-counter">{label} {index+1}/{visible.length}</p><button className="free-study-reveal" type="button" onClick={reveal}><strong className="relation-hanja">{row.from.hanja_form||row.from.word}</strong><span className="relation-reading">{row.from.reading||row.from.word}</span><span className="free-study-detail">{row.from.meaning}</span><CharacterGloss word={row.from}/>{revealed?<><span className="free-study-hint">{label}</span><strong className="relation-hanja">{row.to.hanja_form||row.to.word}</strong><span className="relation-reading">{row.to.reading||row.to.word}</span><span className="free-study-detail">{row.to.meaning}</span><CharacterGloss word={row.to}/>{learningNote?<span className="free-study-detail" role="note">💡 {learningNote}</span>:null}</>:<span className="free-study-hint">눌러서 짝 확인</span>}</button><div className="free-study-actions"><button className="secondary-button" type="button" onClick={()=>move(-1)}>← 이전</button><button className="primary-button" type="button" onClick={()=>move(1)}>다음 →</button></div></section>;
}