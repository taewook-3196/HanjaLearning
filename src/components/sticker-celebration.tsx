"use client";
import {useEffect,useRef,useState} from "react";
import {createClient} from "@/lib/supabase/client";
import {GrowthStickerArt} from "@/components/growth-sticker-art";
import type {GrowthStickerKind} from "@/lib/growth-stickers";

export type StickerNotice={kind:"growth"|"repeatable";name:string;message:string;stickerKey?:GrowthStickerKind;eventId?:number};
export function StickerCelebration({notices,userId}:{notices:StickerNotice[];userId:string}){
 const [index,setIndex]=useState(0);
 const [ready,setReady]=useState(false);
 const [visibleCount,setVisibleCount]=useState(notices.length);
 const [shownCount,setShownCount]=useState(0);
 const advancing=useRef(false);
 const inFlight=useRef(new Set<string>());
 const notice=notices[index];
 const viewedKey=(item:StickerNotice)=>`sticker-viewed:${userId}:${item.kind}:${item.kind==="growth"?item.stickerKey:item.eventId}`;
 function wasViewed(item:StickerNotice){try{return window.sessionStorage.getItem(viewedKey(item))==="1";}catch{return false;}}
 function markViewed(item:StickerNotice){try{window.sessionStorage.setItem(viewedKey(item),"1");}catch{/* Storage is optional. */}}
 function clearViewed(item:StickerNotice){try{window.sessionStorage.removeItem(viewedKey(item));}catch{/* Storage is optional. */}}
 useEffect(()=>{
  // Only play notices not yet shown during this tab session.
  const first=notices.findIndex(item=>!wasViewed(item));
  queueMicrotask(()=>{
   setIndex(first<0?notices.length:first);
   setVisibleCount(notices.filter(item=>!wasViewed(item)).length);
   setShownCount(0);
   advancing.current=false;
   setReady(true);
  });
 },[]);
 async function record(item:StickerNotice){
  const key=viewedKey(item);
  if(inFlight.current.has(key))return;
  inFlight.current.add(key);
  try{
   const s=createClient();
   const {data:{user},error:authError}=await s.auth.getUser();
   if(authError||!user||user.id!==userId)throw authError??new Error("Sticker acknowledgement user mismatch");
   const result=item.kind==="growth"
    ?await s.from("user_growth_stickers").update({celebrated_at:new Date().toISOString()}).eq("user_id",user.id).eq("sticker_key",item.stickerKey??"").is("celebrated_at",null).select("sticker_key")
    :await s.from("user_repeatable_sticker_events").update({celebrated_at:new Date().toISOString()}).eq("user_id",user.id).eq("id",item.eventId??-1).is("celebrated_at",null).select("id");
   if(result.error)throw result.error;
   if(!result.data?.length){
    const check=item.kind==="growth"
     ?await s.from("user_growth_stickers").select("celebrated_at").eq("user_id",user.id).eq("sticker_key",item.stickerKey??"").maybeSingle()
     :await s.from("user_repeatable_sticker_events").select("celebrated_at").eq("user_id",user.id).eq("id",item.eventId??-1).maybeSingle();
    if(check.error||!check.data?.celebrated_at)throw check.error??new Error("Acknowledgement not persisted");
   }
  }catch(e){
   // If the write failed, allow another attempt on the next visit even in this tab.
   clearViewed(item);
   console.error("Sticker celebration acknowledgement failed",e);
  }
  finally{inFlight.current.delete(key);}
 }
 function next(){
  if(!notice||advancing.current)return;
  advancing.current=true;
  // The animation is never blocked by network latency. Failed writes remain pending.
  markViewed(notice);
  setShownCount(count=>count+1);
  void record(notice);
  setIndex(value=>{
   let nextIndex=value+1;
   while(nextIndex<notices.length&&wasViewed(notices[nextIndex]))nextIndex++;
   return nextIndex;
  });
 }
 useEffect(()=>{
  if(!ready||!notice)return;
  advancing.current=false;
  let remaining=2000;
  let started=0;
  let timer:number|undefined;
  const pause=()=>{
   if(timer!==undefined){
    window.clearTimeout(timer);
    timer=undefined;
    remaining=Math.max(0,remaining-(Date.now()-started));
   }
  };
  const resume=()=>{
   if(document.visibilityState!=="visible"||timer!==undefined)return;
   started=Date.now();
   timer=window.setTimeout(()=>{timer=undefined;next();},remaining);
  };
  const onVisibilityChange=()=>{if(document.visibilityState==="visible")resume();else pause();};
  document.addEventListener("visibilitychange",onVisibilityChange);
  resume();
  return()=>{pause();document.removeEventListener("visibilitychange",onVisibilityChange);};
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[index,ready]);
 if(!ready||!notice)return null;
 return <section className="sticker-celebration" role="status" aria-live="polite"><div className="sticker-celebration-card"><p className="eyebrow">새 {notice.kind==="growth"?"성장":"반복"} 스티커 · {shownCount+1}/{visibleCount}</p><span className="sticker-celebration-art" aria-hidden="true">{notice.kind==="growth"&&notice.stickerKey?<GrowthStickerArt kind={notice.stickerKey}/>:"★"}</span><h2>{notice.name}</h2><p>{notice.message}</p><button className="primary-button" type="button" onClick={next}>{notices.slice(index+1).some(item=>!wasViewed(item))?"다음 스티커 ›":"닫기"}</button></div></section>;
}
