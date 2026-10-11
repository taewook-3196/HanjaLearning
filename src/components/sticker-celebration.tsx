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
   setVisible(false);router.refresh();
  }catch(e){
   setError("스티커 수령 기록을 저장하지 못했어요. 다시 눌러 주세요.");
   console.error("Sticker celebration acknowledgement failed",e);
  }finally{busy.current=false;setSaving(false);}
 }
 useEffect(()=>{
  if(!visible)return;
  const timer=window.setTimeout(()=>{void acknowledge();},3000);
  return()=>window.clearTimeout(timer);
 // Timer is per celebration identity; never restart on save-state changes.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[visible,kind,stickerKey,eventId]);
 if(!visible)return null;
 return <section className="sticker-celebration" role="status" aria-live="polite"><div className="sticker-celebration-card"><p className="eyebrow">{kind==="growth"?"새 성장 스티커":"새 반복 스티커"}</p><span className="sticker-celebration-art" aria-hidden="true">{kind==="growth"&&stickerKey?<GrowthStickerArt kind={stickerKey as "first"|"stack"|"write"|"retry"|"master"|"week"}/>: "★"}</span><h2>{name}</h2><p>{message}</p><button className="primary-button" type="button" disabled={saving} onClick={()=>void acknowledge()}>{saving?"저장 중...":"스티커 받기"}</button>{error?<p role="alert">{error}</p>:null}</div></section>;
}
