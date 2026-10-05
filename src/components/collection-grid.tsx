"use client";
import {useRef,useState} from "react";
import CollectionDetail from "@/components/collection-detail";

type Example={word:string;reading:string|null;meaning:string;child_explanation:string|null;chars:{character:string;grade:string|null;isCurrent:boolean}[]};
type Row={id:number;character:string;reading:{reading:string;meaning:string|null}|null;progress:{mastery_score:number|null;study_count:number|null}|null;examples:Example[]};

export default function CollectionGrid({rows,soundEnabled,speechVoice}:{rows:Row[];soundEnabled:boolean;speechVoice:string}){
 const [selected,setSelected]=useState<number|null>(null);
 const selectedTile=useRef<HTMLButtonElement|null>(null);
 function closeDetail(){
  const tile=selectedTile.current;
  setSelected(null);
  requestAnimationFrame(()=>tile?.scrollIntoView({behavior:"smooth",block:"center"}));
 }
 return <section className="collection-grid">
  {rows.map(x=>{const learned=(x.progress?.study_count??0)>0;const isSelected=selected===x.id;return <div className={"collection-cell"+(isSelected?" detail-open":"")} key={x.id}>
   {learned?<button ref={isSelected?(el)=>{selectedTile.current=el}:undefined} type="button" className={"hanja-tile learned"+(isSelected?" selected":"")} onClick={(e)=>{selectedTile.current=e.currentTarget;setSelected(x.id)}} aria-pressed={isSelected}><strong>{x.character}</strong><span>{x.reading?.meaning} · {x.reading?.reading}</span><small>숙련도 {x.progress?.mastery_score??0}</small></button>:<article className="hanja-tile locked"><strong>{x.character}</strong><span>아직 안 배웠어요</span></article>}
   {isSelected&&x.reading?<CollectionDetail id={x.id} character={x.character} reading={x.reading.reading} meaning={x.reading.meaning??""} mastery={x.progress?.mastery_score??0} examples={x.examples} soundEnabled={soundEnabled} speechVoice={speechVoice} onClose={closeDetail}/>:null}
  </div>})}
 </section>;
}
