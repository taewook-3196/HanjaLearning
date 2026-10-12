"use client";
import {useEffect,useRef,useState} from "react";
import {useRouter} from "next/navigation";
import {createClient} from "@/lib/supabase/client";
import {GrowthStickerArt} from "@/components/growth-sticker-art";

type Props={kind:"growth"|"repeatable";name:string;message:string;stickerKey?:string;eventId?:number};
export function StickerCelebration({kind,name,message,stickerKey,eventId}:Props){
 const router=useRouter();
 const [visible,setVisible]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const busy=useRef(false);
 const dismissed=useRef(false);
 const identity=kind==="growth"?`growth-${stickerKey}`:`repeatable-${eventId}`;
 useEffect(()=>{
  const timer=window.setTimeout(()=>{if(!dismissed.current)void acknowledge();},2000);
  return()=>window.clearTimeout(timer);
 // One timer per sticker identity, not per saving state.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[identity]);
 useEffect(()=>{
  // Private browsing and restricted webviews may deny sessionStorage access.
  try{if(window.sessionStorage.getItem(`sticker-dismissed:${identity}`)==="1")setVisible(false);}
  catch(e){console.warn("Sticker session preference unavailable",e);}
 },[identity]);
 function close(refresh=false){
  dismissed.current=true;
  if(!refresh){
   try{window.sessionStorage.setItem(`sticker-dismissed:${identity}`,"1");}
   catch(e){console.warn("Sticker session preference unavailable",e);}
  }
  setVisible(false);
  if(refresh)router.refresh();
 }
 async function acknowledge(){
  if(busy.current)return;
  busy.current=true;setSaving(true);setError("");
  try{
   const s=createClient();
   const {data:{user},error:authError}=await s.auth.getUser();
   if(authError||!user)throw authError??new Error("Authentication required");
   const now=new Date().toISOString();
   const result=kind==="growth"
    ?await s.from("user_growth_stickers").update({celebrated_at:now}).eq("user_id",user.id).eq("sticker_key",stickerKey??"").is("celebrated_at",null).select("sticker_key")
    :await s.from("user_repeatable_sticker_events").update({celebrated_at:now}).eq("id",eventId??-1).eq("user_id",user.id).is("celebrated_at",null).select("id");
   if(result.error)throw result.error;
   // A zero-row update can mean the sticker was already acknowledged in another tab.
   // Confirm the persisted state before dismissing this celebration.
   if(!result.data?.length){
    const lookup=kind==="growth"
     ?await s.from("user_growth_stickers").select("celebrated_at").eq("user_id",user.id).eq("sticker_key",stickerKey??"").maybeSingle()
     :await s.from("user_repeatable_sticker_events").select("celebrated_at").eq("user_id",user.id).eq("id",eventId??-1).maybeSingle();
    if(lookup.error||!lookup.data?.celebrated_at)throw lookup.error??new Error("Sticker acknowledgement not persisted");
   }
   if(!dismissed.current)close(true);
  }catch(e){
   if(!dismissed.current)setError("수령 기록 저장에 실패했어요. 나중에 다시 받을 수 있어요.");
   console.error("Sticker celebration acknowledgement failed",e);
  }finally{busy.current=false;setSaving(false);}
 }
 if(!visible)return null;
 return <section className="sticker-celebration" role="status" aria-live="polite"><div className="sticker-celebration-card"><p className="eyebrow">{kind==="growth"?"새 성장 스티커":"새 반복 스티커"}</p><span className="sticker-celebration-art" aria-hidden="true">{kind==="growth"&&stickerKey?<GrowthStickerArt kind={stickerKey as "first"|"stack"|"write"|"retry"|"master"|"week"}/>: "★"}</span><h2>{name}</h2><p>{message}</p><button className="primary-button" type="button" disabled={saving} onClick={()=>void acknowledge()}>{saving?"저장 중...":"스티커 받기"}</button>{error?<p role="alert">{error}</p>:null}<button className="secondary-button" type="button" onClick={()=>close()}>나중에 받기 · 닫기</button></div></section>;
}
