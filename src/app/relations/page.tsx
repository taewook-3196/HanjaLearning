import Link from "next/link";
import {getTargetGradeScope} from "@/lib/learning/target-grade-scope";
import WordRelationStudy from "@/components/word-relation-study";
export default async function WordRelationsPage(){
 const {supabase:s,grade,allowed}=await getTargetGradeScope();
 const {data:relations}=await s.from("hanja_word_relations").select("id,relation_type,from_word_id,to_word_id,source_note").eq("content_status","PUBLISHED").order("id");
 const wordIds=[...new Set((relations??[]).flatMap(x=>[x.from_word_id,x.to_word_id]))];
 const {data:words}=wordIds.length?await s.from("hanja_words").select("id,word,hanja_form,reading,meaning").in("id",wordIds):{data:[]};
 const wm=new Map((words??[]).map(x=>[x.id,x]));
 const {data:wordHanja}=wordIds.length?await s.from("hanja_word_map").select("word_id,hanja_id").in("word_id",wordIds):{data:[]};
 const hanjaByWord=new Map<number,number[]>();
 for(const m of wordHanja??[]){const items=hanjaByWord.get(m.word_id)??[];items.push(m.hanja_id);hanjaByWord.set(m.word_id,items);}
 const inScope=(wordId:number)=>{const ids=hanjaByWord.get(wordId)??[];return ids.length>0&&ids.every(id=>allowed.has(id));};
 const rows=(relations??[]).filter(x=>inScope(x.from_word_id)&&inScope(x.to_word_id)).flatMap(x=>{
  const from=wm.get(x.from_word_id),to=wm.get(x.to_word_id);
  return from&&to?[{id:x.id,type:x.relation_type,from,to,note:x.source_note}]:[];
 });
 return <main className="app-shell"><div className="page-top-actions"><Link className="settings-link" href="/">← 홈</Link></div><header className="free-study-heading"><h1>유의·반의어</h1><p>목표 {grade}급 · 학습 범위 {rows.length}개</p><p>한자와 뜻을 보고 짝을 맞혀 보세요 · 좌우로 넘기기</p></header><WordRelationStudy rows={rows}/></main>;
}