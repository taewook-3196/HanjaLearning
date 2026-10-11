"use client";
import {useState} from "react";
import {createClient} from "@/lib/supabase/client";
import {GrowthStickerArt} from "@/components/growth-sticker-art";
import type {GrowthStickerDefinition} from "@/lib/growth-stickers";

export function RepresentativeStickerPicker({stickers,initialKey}:{stickers:GrowthStickerDefinition[];initialKey:string|null}){
 const [selected,setSelected]=useState<string|null>(initialKey);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 async function save(key:string){
  if(saving)return;
  const next=selected===key?null:key;
  setSaving(true);setError("");
  const {error:saveError}=await createClient().rpc("set_representative_sticker",{p_key:next});
  if(saveError)setError("대표 스티커를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
  else setSelected(next);
  setSaving(false);
 }
 return <>
  <p className="subtitle representative-sticker-hint">획득한 스티커를 누르면 친구에게 보여줄 대표 스티커로 설정돼요. 다시 누르면 해제됩니다.</p>
  <div className="sticker-grid">
   {stickers.map(s=>s.earned?
    <button key={s.kind} type="button" className="sticker-item earned representative-growth-option" aria-pressed={selected===s.kind} aria-label={`${s.name}, ${selected===s.kind?"대표 스티커, 다시 누르면 해제":"대표 스티커로 설정"}`} disabled={saving} onClick={()=>void save(s.kind)}>
     <span className="sticker-art"><GrowthStickerArt kind={s.kind}/><b>★</b></span>
     <strong>{s.name}</strong><small>{s.detail}</small>{selected===s.kind?<span className="representative-growth-badge">대표 ✓</span>:null}
    </button>:
    <div className="sticker-item" key={s.kind} aria-label={`${s.name}, 아직 획득하지 못함`}>
     <span className="sticker-art"><GrowthStickerArt kind={s.kind} locked/><b></b></span>
     <strong>{s.name}</strong><small>{s.detail}</small><em>아직 잠겨 있어요</em>
    </div>)}
  </div>
  {error?<p role="alert" className="form-message">{error}</p>:null}
 </>;
}
