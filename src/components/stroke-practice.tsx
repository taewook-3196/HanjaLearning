"use client";
import {useEffect,useRef,useState,type PointerEvent as ReactPointerEvent,type ReactNode} from "react";
import HanziWriter from "hanzi-writer";

type Props={character:string;onPracticeComplete?:()=>void;onAvailabilityChange?:(available:boolean)=>void;compact?:boolean;details?:ReactNode;controlsEnabled?:boolean};

// CJK compatibility ideographs need separate Korean-form verification before enabling.
export function isCompatibilityIdeograph(character:string){
 const cp=character.codePointAt(0);
 return cp!==undefined&&((cp>=0xf900&&cp<=0xfaff)||(cp>=0x2f800&&cp<=0x2fa1f));
}
export function supportsStrokePractice(character:string){return !isCompatibilityIdeograph(character);}


function FreeWritingPad({character,onComplete,compact=false}:{character:string;onComplete?:()=>void;compact?:boolean}){
 const canvas=useRef<HTMLCanvasElement>(null);const [drawn,setDrawn]=useState(false);const drawing=useRef(false);
 function point(e:ReactPointerEvent<HTMLCanvasElement>){const el=e.currentTarget,r=el.getBoundingClientRect();return{x:(e.clientX-r.left)*(el.width/r.width),y:(e.clientY-r.top)*(el.height/r.height)};}
 function down(e:ReactPointerEvent<HTMLCanvasElement>){const el=e.currentTarget,ctx=el.getContext("2d");if(!ctx)return;el.setPointerCapture(e.pointerId);drawing.current=true;const p=point(e);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineCap="round";ctx.lineJoin="round";ctx.lineWidth=compact?12:15;ctx.strokeStyle="#24313d";}
 function move(e:ReactPointerEvent<HTMLCanvasElement>){if(!drawing.current)return;const ctx=e.currentTarget.getContext("2d");if(!ctx)return;const p=point(e);ctx.lineTo(p.x,p.y);ctx.stroke();setDrawn(true);}
 function up(){drawing.current=false;}
 function clear(){const el=canvas.current;if(el)el.getContext("2d")?.clearRect(0,0,el.width,el.height);setDrawn(false);}
 return <div className="free-writing-wrap"><div className="free-writing-pad"><span aria-hidden="true">{character}</span><canvas ref={canvas} width={512} height={512} aria-label={character+" 자유 쓰기판"} style={{touchAction:"none"}} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onLostPointerCapture={up}/></div><div className="practice-actions"><button type="button" className="secondary-button" onClick={clear}>다시 쓰기</button><button type="button" disabled={!drawn} onClick={onComplete}>쓰기 완료</button></div></div>;
}

export default function StrokePractice({character,onPracticeComplete,onAvailabilityChange,compact=false,details,controlsEnabled=true}:Props){
 const target=useRef<HTMLDivElement>(null);
 const writer=useRef<HanziWriter|null>(null);
 const [mode,setMode]=useState<"LOADING"|"WATCH"|"TRACE"|"DONE"|"ERROR">("LOADING");
 const [stage,setStage]=useState<1|2|3>(1);
 const [message,setMessage]=useState("획순을 준비하고 있어요.");
 const nextStageTimer=useRef<ReturnType<typeof setTimeout>|null>(null);

 useEffect(()=>{
  let active=true;
  if(nextStageTimer.current!==null){clearTimeout(nextStageTimer.current);nextStageTimer.current=null;}
  if(!supportsStrokePractice(character)){onAvailabilityChange?.(false);return;}
  if(!target.current)return;
  target.current.innerHTML="";
  writer.current=HanziWriter.create(target.current,character,{
   width:compact?190:260,height:compact?190:260,padding:compact?8:12,
   showOutline:true,showCharacter:true,
   strokeAnimationSpeed:1,delayBetweenStrokes:180,
   onLoadCharDataError:()=>{
    if(!active)return;
    writer.current=null;onAvailabilityChange?.(false);setMode("ERROR");setMessage("이 글자의 획순 자료가 없어 자유 쓰기로 연습할 수 있어요.");
   },
   onLoadCharDataSuccess:()=>{if(active){onAvailabilityChange?.(true);setStage(1);setMode("WATCH");setMessage("1단계 · 글자를 보면서 따라 써 보세요.");}},
  });
  return()=>{active=false;if(nextStageTimer.current!==null){clearTimeout(nextStageTimer.current);nextStageTimer.current=null;}writer.current=null;if(target.current)target.current.innerHTML="";};
 },[character,onAvailabilityChange]);

 if(!supportsStrokePractice(character)){
  return <section className={`stroke-practice${compact?" compact":""}`}>{!compact?<h2>쓰기 연습</h2>:null}<p>이 글자는 획순 자료가 아직 없어요. 희미한 글자를 보며 자유롭게 따라 써 보세요.</p><FreeWritingPad character={character} compact={compact} onComplete={onPracticeComplete}/>{details}</section>;
 }

 if(mode==="ERROR")return <section className={`stroke-practice${compact?" compact":""}`}>{!compact?<h2>쓰기 연습</h2>:null}<p>{message}</p><FreeWritingPad character={character} compact={compact} onComplete={onPracticeComplete}/>{details}</section>;

 function animate(){
  if(!writer.current||mode==="LOADING"||mode==="ERROR")return;
  if(nextStageTimer.current!==null){clearTimeout(nextStageTimer.current);nextStageTimer.current=null;}
  writer.current.cancelQuiz();setMode("WATCH");setMessage("획순을 천천히 살펴보세요.");writer.current.animateCharacter();
 }
 function practice(targetStage:1|2|3=stage){
  if(!writer.current||mode==="LOADING"||mode==="ERROR")return;
  if(nextStageTimer.current!==null){clearTimeout(nextStageTimer.current);nextStageTimer.current=null;}
  writer.current.cancelQuiz();setStage(targetStage);setMode("TRACE");
  if(targetStage===1){writer.current.showCharacter();writer.current.showOutline();setMessage("1단계 · 글자를 보면서 따라 써 보세요.");}
  else if(targetStage===2){writer.current.hideCharacter();writer.current.showOutline();setMessage("2단계 · 흐린 윤곽을 힌트로 써 보세요.");}
  else {writer.current.hideCharacter();writer.current.hideOutline();setMessage("3단계 · 가이드 없이 기억해서 써 보세요.");}
  writer.current.quiz({
   // Allow more positional drift on touch screens; keep HanziWriter stroke-order checks.
   leniency:targetStage===1?1.8:targetStage===2?1.65:1.5,
   showHintAfterMisses:targetStage===3?3:2,
   highlightOnComplete:true,
   onComplete:()=>{
    if(targetStage<3){const next=(targetStage+1) as 2|3;setMode("DONE");setMessage(targetStage===1?"좋아요. 이제 힌트만 보고 써 보세요.":"좋아요. 마지막은 가이드 없이 기억해서 써 보세요.");nextStageTimer.current=setTimeout(()=>{nextStageTimer.current=null;practice(next);},450);}
    else {setMode("DONE");setMessage("3단계 쓰기 완료! 기억해서 잘 썼어요.");onPracticeComplete?.();}
   }
  });
 }

 const disabled=mode==="LOADING";
 return <section className={`stroke-practice${compact?" compact":""}`}>
  {!compact?<h2>획순 · 쓰기 연습</h2>:null}
  <div className="writing-stage-indicator" aria-label={"쓰기 "+stage+"단계"}><span className={stage>=1?"active":""}>1 따라쓰기</span><span className={stage>=2?"active":""}>2 힌트쓰기</span><span className={stage>=3?"active":""}>3 기억쓰기</span></div>
  <p>{message}</p>
  <div className="stroke-character-stage" style={{width:compact?190:260,height:compact?190:260,margin:"0 auto"}}><div ref={target} aria-label={character+" 획순과 쓰기 연습"} style={{width:"100%",height:"100%",touchAction:"none"}}/></div>
  {details}
  {!disabled&&controlsEnabled?<div className="practice-actions">
   <button type="button" className="secondary-button" onClick={animate}>획순 보기</button>
   <button type="button" onClick={()=>practice(stage)}>{stage===1?"따라 쓰기":stage===2?"힌트 쓰기":mode==="DONE"?"한 번 더 기억쓰기":"기억 쓰기"}</button>
  </div>:null}
 </section>;
}
