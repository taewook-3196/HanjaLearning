"use client";
import {useEffect,useRef,useState} from "react";
import HanziWriter from "hanzi-writer";

type Props={character:string;onPracticeComplete?:()=>void};

// Compatibility/variant forms need separate Korean-form verification before enabling.
export const UNSAFE_COMPATIBILITY_FORMS=new Set(["六","車","不","樂"]);
export function supportsStrokePractice(character:string){return !UNSAFE_COMPATIBILITY_FORMS.has(character);}

export default function StrokePractice({character,onPracticeComplete}:Props){
 const target=useRef<HTMLDivElement>(null);
 const writer=useRef<HanziWriter|null>(null);
 const [mode,setMode]=useState<"WATCH"|"TRACE"|"DONE">("WATCH");
 const [message,setMessage]=useState("");

 useEffect(()=>{
  if(!target.current||!supportsStrokePractice(character))return;
  target.current.innerHTML="";
  writer.current=HanziWriter.create(target.current,character,{
   width:260,height:260,padding:12,
   showOutline:true,showCharacter:true,
   strokeAnimationSpeed:1,delayBetweenStrokes:180,
  });
  return()=>{writer.current=null};
 },[character]);

 if(!supportsStrokePractice(character)){
  return <section className="stroke-practice"><h2>쓰기 연습</h2><p>이 글자는 한국식 자형의 획순 확인이 끝난 뒤 쓰기 연습을 제공할게요.</p></section>;
 }

 function animate(){setMode("WATCH");setMessage("획순을 천천히 살펴보세요.");writer.current?.animateCharacter();}
 function practice(){
  setMode("TRACE");setMessage("화면의 획순대로 손가락이나 펜으로 써 보세요.");
  writer.current?.quiz({
   showHintAfterMisses:2,
   highlightOnComplete:true,
   onComplete:()=>{setMode("DONE");setMessage("잘 썼어요. 이제 뜻과 소리를 기억했는지 확인해 보세요.");onPracticeComplete?.();}
  });
 }

 return <section className="stroke-practice">
  <h2>획순 · 쓰기 연습</h2>
  <p>{mode==="WATCH"?"먼저 획순을 보고 따라 써 보세요.":message}</p>
  <div ref={target} aria-label={character+" 획순과 쓰기 연습"} style={{width:260,height:260,margin:"0 auto",touchAction:"none"}}/>
  <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
   <button type="button" className="secondary-button" onClick={animate}>▶ 획순 보기</button>
   <button type="button" onClick={practice}>{mode==="DONE"?"한 번 더 쓰기":"✍️ 따라 쓰기"}</button>
  </div>
 </section>;
}
