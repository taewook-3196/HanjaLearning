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
 const wordHanja=new Map<number,number[]>();
 const {data:wordMaps}=wordIds.length?await s.from("hanja_word_map").select("word_id,hanja_id").in("word_id",wordIds):{data:[]};
 for(const m of wordMaps??[]){const items=wordHanja.get(m.word_id)??[];items.push(m.hanja_id);wordHanja.set(m.word_id,items);}
 const inGrade=(wordId:number)=>{const ids=wordHanja.get(wordId)??[];return ids.length>0&&ids.every(id=>gradeIds.has(id));};
 const rows=(relations??[]).flatMap(x=>{
  const from=wm.get(x.from_word_id),to=wm.get(x.to_word_id);
  return from&&to?[{id:x.id,type:x.relation_type,from,to,note:x.source_note,inGrade:inGrade(x.from_word_id)&&inGrade(x.to_word_id)}]:[];
 });
 return <main className="app-shell"><div className="page-top-actions"><Link className="settings-link" href="/">← 홈</Link></div><header className="free-study-heading"><h1>유의·반의어</h1><p>한자와 뜻을 보고 짝을 맞혀 보세요 · 좌우로 넘기기</p></header><WordRelationStudy rows={rows}/></main>;
}