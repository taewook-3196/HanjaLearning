import Link from "next/link";
import {requireActiveUser} from "@/lib/auth/require-active-user";
import WordRelationStudy from "@/components/word-relation-study";
export default async function WordRelationsPage(){
 const {supabase:s}=await requireActiveUser();
 const {data:relations}=await s.from("hanja_word_relations").select("id,relation_type,from_word_id,to_word_id").eq("content_status","PUBLISHED").order("id");
 const wordIds=[...new Set((relations??[]).flatMap(x=>[x.from_word_id,x.to_word_id]))];
 const {data:words}=wordIds.length?await s.from("hanja_words").select("id,word,reading,meaning").in("id",wordIds):{data:[]};
 const wm=new Map((words??[]).map(x=>[x.id,x]));
 const rows=(relations??[]).flatMap(x=>{
  const from=wm.get(x.from_word_id),to=wm.get(x.to_word_id);
  return from&&to?[{id:x.id,type:x.relation_type,from,to}]:[];
 });
 return <main className="app-shell"><div className="page-top-actions"><Link className="settings-link" href="/">← 홈</Link></div><section className="hero-card"><p className="eyebrow">자유 학습</p><h1>유의·반의어</h1><p className="subtitle">서로 비슷하거나 반대되는 한자어를 짝으로 익혀 보세요.</p></section><WordRelationStudy rows={rows}/></main>;
}