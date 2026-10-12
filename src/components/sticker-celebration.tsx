"use client";
import {useEffect,useRef,useState} from "react";
import {createClient} from "@/lib/supabase/client";
import {GrowthStickerArt} from "@/components/growth-sticker-art";
import type {GrowthStickerKind} from "@/lib/growth-stickers";

export type StickerNotice={kind:"growth"|"repeatable";name:string;message:string;stickerKey?:GrowthStickerKind;eventId?:number};
export function StickerCelebration({notices}:{notices:StickerNotice[]}){
 const [index,setIndex]=useState(0);
 const indexRef=useRef(0);
 const advancing=useRef(false);
 const current=notices[index];
 // Acknowledgement is independent of the two-second animation.
 async function record(notice:StickerNotice){
  try{
   const s=createClient();
   const {data:{user},error:authError}=await s.auth.getUser();
   if(authError||!user)throw authError??new Error("Authentication required");
   const now=new Date().toISOString();
   const result=notice.kind==="growth"
    ?await s.from("user_growth_stickers").update({celebrated_at:now}).eq("user_id",user.id).eq("sticker_key",notice.stickerKey??"").is("celebrated_at",null).select("sticker_key")
    :await s.from("user_repeatable_sticker_events").update({celebrated_at:now}).eq("user_id",user.id).eq("id",notice.eventId??-1).is("celebrated_at",null).select("id");
   if(result.error)throw result.error;
   if(!result.data?.length){
    const lookup=notice.kind==="growth"
     ?await s.from("user_growth_stickers").select("celebrated_at").eq("user_id",user.id).eq("sticker_key",notice.stickerKey??"").maybeSingle()
     :await s.from("user_repeatable_sticker_events").select("celebrated_at").eq("user_id",user.id).eq("id",notice.eventId??-1).maybeSingle();
    if(lookup.error||!lookup.data?.celebrated_at)throw lookup.error??new Error("Sticker acknowledgement not persisted");
   }
  }catch(e){console.error("Sticker celebration acknowledgement failed",e);}
 }
 function advance(){
  if(advancing.current||indexRef.current>=notices.length)return;
  advancing.current=true;
  const notice=notices[indexRef.current];
  void record(notice);
  indexRef.current+=1;
  setIndex(indexRef.current);
 }
 useEffect(()=>{
  if(!current)return;
  advancing.current=false;
  const timer=window.setTimeout(advance,2000);
  return()=>window.clearTimeout(timer);
 // The timer restarts only when the displayed notice changes.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[index,current]);
 if(!current)return null;
 return <section className="sticker-celebration" role="status" aria-live="polite"><div className="sticker-celebration-card"><p className="eyebrow">새 {current.kind==="growth"?"성장":"반복"} 스티커 · {index+1}/{notices.length}</p><span className="sticker-celebration-art" aria-hidden="true">{current.kind==="growth"&&current.stickerKey?<GrowthStickerArt kind={current.stickerKey}/>:"★"}</span><h2>{current.name}</h2><p>{current.message}</p><button className="primary-button" type="button" onClick={advance}>{index+1===notices.length?"닫기":"다음 스티커 ›"}</button></div></section>;
}
