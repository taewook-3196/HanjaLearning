"use client";
import {useState} from "react";
import {createClient} from "@/lib/supabase/client";
import {GrowthStickerArt} from "@/components/growth-sticker-art";
import type {GrowthStickerDefinition} from "@/lib/growth-stickers";

export function RepresentativeStickerPicker({stickers,initialKeys}:{stickers:GrowthStickerDefinition[];initialKeys:string[]}){
 const [selected,setSelected]=useState<string[]>(initialKeys.slice(0,3));
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 async function save(key:string){
  if(saving)return;
  const next=selected.includes(key)?selected.filter(x=>x!==key):[...selected,key];
  if(next.length>3){setError("대표 스티커는 최대 3개까지 선택할 수 있어요.");return;}
  setSaving(true);setError("");
  const client=createClient();
  const {data:{user},error:authError}=await client.auth.getUser();
  if(authError||!user){setError("로그인 상태를 확인하지 못했어요.");setSaving(false);return;}
  const {error:saveError}=await client.rpc("set_featured_stickers",{p_keys:next});
  if(saveError)setError("스티커 선택을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
  else setSelected(next);
  setSaving(false);
 }

 return <>
  <p className="subtitle representative-sticker-hint">획득한 스티커를 최대 3개 선택할 수 있어요. 다시 누르면 해제됩니다. 선택한 스티커는 홈과 친구 목록에 표시돼요.</p>
  <div className="sticker-grid">
   {stickers.map(s=>s.earned?
    <button key={s.kind} type="button" className="sticker-item earned representative-growth-option" aria-pressed={selected.includes(s.kind)} aria-label={`${s.name}, ${selected.includes(s.kind)?"선택됨, 다시 누르면 해제":"대표 스티커로 선택"}`} disabled={saving} onClick={()=>void save(s.kind)}>
     <span className="sticker-art"><GrowthStickerArt kind={s.kind}/><b>★</b></span>
     <strong>{s.name}</strong><small>{s.detail}</small>{selected.includes(s.kind)?<span className="representative-growth-badge">선택 ✓</span>:null}
    </button>:
    <div className="sticker-item" key={s.kind} aria-label={`${s.name}, 아직 획득하지 못함`}>
     <span className="sticker-art"><GrowthStickerArt kind={s.kind} locked/><b></b></span>
     <strong>{s.name}</strong><small>{s.detail}</small><em>아직 잠겨 있어요</em>
    </div>)}
  </div>
  {error?<p role="alert" className="form-message">{error}</p>:null}
 </>;
}
