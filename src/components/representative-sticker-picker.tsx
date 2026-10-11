"use client";
import {useState} from "react";
import {createClient} from "@/lib/supabase/client";
import {GrowthStickerArt} from "@/components/growth-sticker-art";
import type {GrowthStickerKind} from "@/lib/growth-stickers";

const labels:Record<GrowthStickerKind,string>={first:"첫걸음",stack:"차곡차곡",learn50:"한자 탐험가",learn100:"백자 돌파",learn250:"한자 수집가",write:"쓰기 시작",write50:"또박또박",write100:"쓰기 고수",retry:"다시 도전",recover5:"칠전팔기",recover20:"오답 정복",master:"숙달 시작",week:"꾸준한 한 주",streak3:"3일 새싹",streak7:"7일 토끼",streak14:"14일 여우",streak30:"30일 호랑이"};

export function RepresentativeStickerPicker({earnedKeys,initialKey}:{earnedKeys:string[];initialKey:string|null}){
 const [selected,setSelected]=useState<string|null>(initialKey);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const available=[...new Set(earnedKeys)];
 async function save(key:string|null){
  if(saving)return;
  setSaving(true);setError("");
  const s=createClient();
  const {error:saveError}=await s.rpc("set_representative_sticker",{p_key:key});
  if(saveError)setError("대표 스티커를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
  else setSelected(key);
  setSaving(false);
 }
 return <div className="representative-sticker-picker">
  <h3>대표 스티커</h3><p className="subtitle">친구에게 보여줄 대표 스티커를 선택하세요.</p>
  <div className="sticker-preview-row">
   {available.map(key=><button key={key} type="button" disabled={saving} aria-pressed={selected===key} className="sticker-preview-item" onClick={()=>void save(key)}>
    <span className="sticker-art">{Object.hasOwn(labels,key)?<GrowthStickerArt kind={key as GrowthStickerKind}/>: "🏅"}</span><strong>{labels[key]??key.replaceAll("_"," ")}</strong><small>{selected===key?"대표 스티커 ✓":"대표로 선택"}</small>
   </button>)}
  </div>
  {selected?<button type="button" className="secondary-button" disabled={saving} onClick={()=>void save(null)}>대표 스티커 해제</button>:null}
  {!available.length?<p className="subtitle">획득한 성장 스티커가 아직 없어요.</p>:null}
  {error?<p role="alert">{error}</p>:null}
 </div>;
}
