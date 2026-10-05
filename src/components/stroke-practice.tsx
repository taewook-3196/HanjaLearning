"use client";
import {useEffect,useRef,useState} from "react";
import HanziWriter from "hanzi-writer";

type Props={character:string;onPracticeComplete?:()=>void;onAvailabilityChange?:(available:boolean)=>void;compact?:boolean};

// CJK compatibility ideographs need separate Korean-form verification before enabling.
export function isCompatibilityIdeograph(character:string){
 const cp=character.codePointAt(0);
 return cp!==undefined&&((cp>=0xf900&&cp<=0xfaff)||(cp>=0x2f800&&cp<=0x2fa1f));
}
export function supportsStrokePractice(character:string){return !isCompatibilityIdeograph(character);}

export default function StrokePractice({character,onPracticeComplete,onAvailabilityChange,compact=false}:Props){
 const target=useRef<HTMLDivElement>(null);
 const writer=useRef<HanziWriter|null>(null);
 const [mode,setMode]=useState<"LOADING"|"WATCH"|"TRACE"|"DONE"|"ERROR">("LOADING");
 const [message,setMessage]=useState("획순을 준비하고 있어요.");

 useEffect(()=>{
  let active=true;
  if(!supportsStrokePractice(character)){onAvailabilityChange?.(false);return;}
  if(!target.current)return;
  target.current.innerHTML="";
  writer.current=HanziWriter.create(target.current,character,{
   width:compact?190:260,height:compact?190:260,padding:compact?8:12,
   showOutline:true,showCharacter:true,
   strokeAnimationSpeed:1,delayBetweenStrokes:180,
   onLoadCharDataError:()=>{
    if(!active)return;
    writer.current=null;onAvailabilityChange?.(false);setMode("ERROR");setMessage("이 글자의 획순 자료를 불러오지 못했어요. 뜻과 소리 학습은 계속할 수 있어요.");
   },
   onLoadCharDataSuccess:()=>{if(active){onAvailabilityChange?.(true);setMode("WATCH");setMessage("먼저 획순을 보고 따라 써 보세요.");}},
  });
  return()=>{active=false;writer.current=null;if(target.current)target.current.innerHTML="";};
 },[character,onAvailabilityChange]);

 if(!supportsStrokePractice(character)){
  return <section className={`stroke-practice${compact?" compact":""}`}><h2>쓰기 연습</h2><p>이 글자는 한국식 자형의 획순 확인이 끝난 뒤 쓰기 연습을 제공할게요.</p></section>;
 }

 function animate(){
  if(!writer.current||mode==="LOADING"||mode==="ERROR")return;
  writer.current.cancelQuiz();setMode("WATCH");setMessage("획순을 천천히 살펴보세요.");writer.current.animateCharacter();
 }
 function practice(){
  if(!writer.current||mode==="LOADING"||mode==="ERROR")return;
  writer.current.cancelQuiz();setMode("TRACE");setMessage("화면의 획순대로 손가락이나 펜으로 써 보세요.");
  writer.current.quiz({
   showHintAfterMisses:2,
   highlightOnComplete:true,
   onComplete:()=>{setMode("DONE");setMessage("잘 썼어요. 이제 뜻과 소리를 기억했는지 확인해 보세요.");onPracticeComplete?.();}
  });
 }

 const disabled=mode==="LOADING"||mode==="ERROR";
 return <section className="stroke-practice">
  {!compact?<h2>획순 · 쓰기 연습</h2>:null}
  <p role={mode==="ERROR"?"alert":undefined}>{message}</p>
  <div ref={target} aria-label={character+" 획순과 쓰기 연습"} style={{width:compact?190:260,height:compact?190:260,margin:"0 auto",touchAction:"none"}}/>
  {!disabled?<div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
   <button type="button" className="secondary-button" onClick={animate}>▶ 획순 보기</button>
   <button type="button" onClick={practice}>{mode==="DONE"?"한 번 더 쓰기":"✍️ 따라 쓰기"}</button>
  </div>:null}
 </section>;
}
