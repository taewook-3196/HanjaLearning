"use client";
import {useState} from "react";
import CollectionDetail from "@/components/collection-detail";

type Example={word:string;reading:string|null;meaning:string;child_explanation:string|null;chars:{character:string;grade:string|null;isCurrent:boolean}[]};
type Row={id:number;character:string;reading:{reading:string;meaning:string|null}|null;progress:{mastery_score:number|null;study_count:number|null}|null;examples:Example[]};
export default function CollectionGrid({rows,soundEnabled,speechVoice}:{rows:Row[];soundEnabled:boolean;speechVoice:string}){
 const [selected,setSelected]=useState<number|null>(null);
 const current=rows.find(x=>x.id===selected);
 return <>
  <section className="collection-grid">{rows.map(x=>{const learned=(x.progress?.study_count??0)>0;return learned?<button type="button" className={"hanja-tile learned"+(selected===x.id?" selected":"")} key={x.id} onClick={()=>setSelected(x.id)} aria-pressed={selected===x.id}><strong>{x.character}</strong><span>{x.reading?.meaning} · {x.reading?.reading}</span><small>숙련도 {x.progress?.mastery_score??0}</small></button>:<article className="hanja-tile locked" key={x.id}><strong>{x.character}</strong><span>아직 안 배웠어요</span></article>})}</section>
  {current&&current.reading?<CollectionDetail id={current.id} character={current.character} reading={current.reading.reading} meaning={current.reading.meaning??""} mastery={current.progress?.mastery_score??0} examples={current.examples} soundEnabled={soundEnabled} speechVoice={speechVoice} onClose={()=>setSelected(null)}/>:null}
 </>;
}
