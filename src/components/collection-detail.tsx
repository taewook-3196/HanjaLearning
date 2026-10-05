"use client";
import {useEffect,useState} from "react";
import StrokePractice from "@/components/stroke-practice";
import {speakKorean,type SpeechVoicePreference} from "@/lib/speech";
import {createClient} from "@/lib/supabase/client";

type Example={word:string;reading:string|null;meaning:string;child_explanation:string|null;chars:{character:string;grade:string|null;isCurrent:boolean}[]};
type Props={id:number;character:string;reading:string;meaning:string;mastery:number;examples:Example[];soundEnabled:boolean;speechVoice:string;onClose:()=>void};

export default function CollectionDetail({id,character,reading,meaning,mastery,examples,soundEnabled,speechVoice,onClose}:Props){
 const [message,setMessage]=useState("");
 useEffect(()=>{document.getElementById("collection-detail")?.scrollIntoView({behavior:"smooth",block:"nearest"});},[id]);
 async function recordWriting(){const s=createClient();const {error}=await s.rpc("record_writing_practice",{target_hanja_id:id});setMessage(error?"쓰기 연습은 했지만 기록 저장에 실패했어요.":"✓ 쓰기 연습을 기록했어요.");}
 return <section id="collection-detail" className="flash-card collection-detail" aria-live="polite">
  <div className="collection-detail-top"><p className="eyebrow">도감 상세</p><button type="button" className="text-button" onClick={onClose}>닫기</button></div>
  <div className="hanja-character">{character}</div>
  <h2>{meaning} {reading}</h2>
  <p>현재 숙련도 {mastery}</p>
  {soundEnabled?<button type="button" className="speak-button" onClick={()=>speakKorean(meaning+" "+reading,speechVoice as SpeechVoicePreference,()=>setMessage("이 기기에서는 음성 읽어주기를 사용할 수 없어요."))}>🔊 읽어주기</button>:null}
  {examples.length?<div className="collection-examples"><h3>함께 알아둘 말</h3>{examples.map((w,i)=><div key={w.word+"-"+i} className="collection-example"><strong>{w.chars.map(c=>c.character).join("")||w.word}</strong>{w.reading?` (${w.reading.replace(/\\n|\n/g," ").trim()})`:""} · {(w.child_explanation||w.meaning).replace(/\\n|\n/g," ").trim()}<span className="word-grade-row">{w.chars.map((c,j)=><small key={c.character+"-"+j} className={c.isCurrent?"current":""}>{c.character}{c.grade?` ${c.grade}`:""}</small>)}</span></div>)}</div>:<p>등록된 예시 단어가 아직 없어요.</p>}
  <StrokePractice key={id} character={character} onPracticeComplete={()=>void recordWriting()}/>
  {message?<p className="form-message" role="status">{message}</p>:null}
 </section>;
}
