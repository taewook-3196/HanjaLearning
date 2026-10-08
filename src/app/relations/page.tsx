import {getTargetGradeHanjaIds} from "@/lib/grade-content-scope";
import Link from "next/link";
import {requireActiveUser} from "@/lib/auth/require-active-user";
import WordRelationStudy from "@/components/word-relation-study";
export default async function WordRelationsPage(){
 const {supabase:s,user}=await requireActiveUser();
 const gradeIds=await getTargetGradeHanjaIds(s,user.id);
 const {data:relations}=await s.from("hanja_word_relations").select("id,relation_type,from_word_id,to_word_id,source_note").eq("content_status","PUBLISHED").order("id");
 const wordIds=[...new Set((relations??[]).flatMap(x=>[x.from_word_id,x.to_word_id]))];
 const {data:words}=wordIds.length?await s.from("hanja_words").select("id,word,hanja_form,reading,meaning").in("id",wordIds):{data:[]};
 const wm=new Map((words??[]).map(x=>[x.id,x]));
 const wordHanja=new Map<number,{hanjaId:number;position:number}[]>();
 const {data:wordMaps}=wordIds.length?await s.from("hanja_word_map").select("word_id,hanja_id,position").in("word_id",wordIds):{data:[]};
 for(const m of wordMaps??[]){const items=wordHanja.get(m.word_id)??[];items.push({hanjaId:m.hanja_id,position:m.position});wordHanja.set(m.word_id,items);}
 const characterById=new Map((hanja??[]).map(h=>[h.id,h.character]));
 const inGrade=(wordId:number)=>{const mappings=(wordHanja.get(wordId)??[]).slice().sort((a,b)=>a.position-b.position);const word=wm.get(wordId);const characters=Array.from(String(word?.hanja_form??""));return characters.length>0&&mappings.length===characters.length&&mappings.every((m,index)=>gradeIds.has(m.hanjaId)&&characterById.get(m.hanjaId)===characters[index]);};
 const characters=[...new Set((words??[]).flatMap(w=>Array.from(String(w.hanja_form??""))))];
 const {data:hanja}=characters.length?await s.from("hanja").select("id,character").in("character",characters):{data:[]};
 const hanjaIds=(hanja??[]).map(h=>h.id);
 const {data:readings}=hanjaIds.length?await s.from("hanja_readings").select("hanja_id,meaning,reading").in("hanja_id",hanjaIds).eq("is_primary",true):{data:[]};
 const readingsById=new Map((readings??[]).map(r=>[r.hanja_id,r]));
 const glossByCharacter=new Map((hanja??[]).map(h=>[h.character,readingsById.get(h.id)]));
 const withCharacters=(w:NonNullable<typeof words>[number])=>({...w,characters:Array.from(String(w.hanja_form??"")).map(character=>({character,meaning:glossByCharacter.get(character)?.meaning??"",reading:glossByCharacter.get(character)?.reading??""}))});
 const rows=(relations??[]).flatMap(x=>{
  const from=wm.get(x.from_word_id),to=wm.get(x.to_word_id);
  return from&&to?[{id:x.id,type:x.relation_type,from:withCharacters(from),to:withCharacters(to),note:x.source_note,inGrade:inGrade(x.from_word_id)&&inGrade(x.to_word_id)}]:[];
 });
 return <main className="app-shell"><div className="page-top-actions"><Link className="settings-link" href="/">← 홈</Link></div><header className="free-study-heading"><h1>유의·반의어</h1><p>한자와 뜻을 보고 짝을 맞혀 보세요 · 좌우로 넘기기</p></header><WordRelationStudy rows={rows}/></main>;
}