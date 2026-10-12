"use client";
import {useState} from "react";
import {createClient} from "@/lib/supabase/client";

export function GiftRequestReward({initialAvailable,totalEarned,nextLevel,xpRemaining}:{initialAvailable:number;totalEarned:number;nextLevel:number;xpRemaining:number}){
 const [available,setAvailable]=useState(initialAvailable);
 const [confirming,setConfirming]=useState(false);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 async function consume(){
  if(saving||available<=0)return;
  setSaving(true);setError("");
  try{
   const {data,error:rpcError}=await createClient().rpc("consume_gift_request_reward");
   if(rpcError)throw rpcError;
   if(typeof data!=="number"||data<0){setAvailable(0);setConfirming(false);return;}
   setAvailable(data);setConfirming(false);
  }catch(e){console.error("Gift request redemption failed",e);setError("사용 기록을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.");}
  finally{setSaving(false);}
 }
 return <section className="study-card gift-reward-card">
  <div className="section-heading"><div><p className="eyebrow">5레벨 보상</p><h2>🎁 선물 요구권 {available}장</h2></div><span>Lv.5, 10, 15…마다 1장</span></div>
  <div className="gift-reward-summary"><span>받은 요구권 <strong>{totalEarned}장</strong></span><span>다음 보상 <strong>Lv.{nextLevel}</strong></span><span>남은 XP <strong>{xpRemaining}</strong></span></div>
  <p className="subtitle">5레벨씩 성장할 때마다 부모님께 원하는 선물을 요청할 수 있는 요구권을 받아요.</p>
  <button type="button" className="secondary-button" disabled={available===0||saving} onClick={()=>{if(available>0){setError("");setConfirming(true);}}}>{available===0?"사용 가능한 요구권이 없어요":"선물요구권 사용하기"}</button>
  {confirming&&available>0?<div role="dialog" aria-modal="true" aria-labelledby="gift-request-title" className="gift-request-confirm" style={{padding:"16px",border:"1px solid #a8b2be",borderRadius:"12px",marginTop:"12px"}}>
   <h3 id="gift-request-title">선물요구권 1장을 사용하시겠습니까?</h3>
   <p>부모님께 원하는 선물을 요청할 수 있지만, 부모님에게는 요청을 거절할 권리가 있습니다.</p>
   <p>네를 선택하면 1장이 차감됩니다.</p>
   <div className="practice-actions"><button type="button" disabled={saving} onClick={()=>void consume()}>{saving?"처리 중...":"네, 사용하기"}</button><button type="button" className="secondary-button" disabled={saving} onClick={()=>setConfirming(false)}>아니오</button></div>
  </div>:null}
  {error?<p role="alert" className="form-message">{error}</p>:null}
 </section>;
}
