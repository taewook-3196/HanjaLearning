import Link from "next/link";
import {requireActiveUser} from "@/lib/auth/require-active-user";
import HanjaCardStudy from "@/components/hanja-card-study";

export default async function HanjaCardsPage(){
 const {supabase:s,user}=await requireActiveUser();
 const [{data:p},{data:st}]=await Promise.all([
  s.from("profiles").select("target_grade").eq("user_id",user.id).maybeSingle(),
  s.from("user_settings").select("exam_provider_id").eq("user_id",user.id).maybeSingle()
 ]);
 let gq=s.from("exam_grades").select("id,name").eq("code",p?.target_grade??"5");
 if(st?.exam_provider_id)gq=gq.eq("provider_id",st.exam_provider_id);
 const {data:grades}=await gq;
 if(!grades?.length)return <main className="app-shell"><section className="study-card"><h1>한자 카드</h1><p>목표 급수를 먼저 설정해 주세요.</p><Link href="/settings">설정하기</Link></section></main>;
 const scope=(await Promise.all(grades.map(g=>s.rpc("list_grade_hanja_ids",{target_grade_id:g.id})))).flatMap(x=>x.data??[]);
 const ids=[...new Set(scope.map(x=>x.hanja_id))];
 const [{data:h},{data:r},{data:prog}]=await Promise.all([
  s.from("hanja").select("id,character").in("id",ids),
  s.from("hanja_readings").select("hanja_id,reading,meaning").in("hanja_id",ids).eq("is_primary",true),
  s.from("user_hanja_progress").select("hanja_id,study_count").eq("user_id",user.id).in("hanja_id",ids)
 ]);
 const rm=new Map((r??[]).map(x=>[x.hanja_id,x]));
 const learned=new Set((prog??[]).filter(x=>(x.study_count??0)>0).map(x=>x.hanja_id));
 const [{data:wordMaps},{data:idiomMaps}]=await Promise.all([
  s.from("hanja_word_map").select("hanja_id,word_id").in("hanja_id",ids),
  s.from("hanja_idiom_map").select("hanja_id,idiom_id").in("hanja_id",ids)
 ]);
 const wordIds=[...new Set((wordMaps??[]).map(x=>x.word_id))];
 const idiomIds=[...new Set((idiomMaps??[]).map(x=>x.idiom_id))];
 const [{data:words},{data:idioms}]=await Promise.all([
  wordIds.length?s.from("hanja_words").select("id,word,reading,meaning,hanja_form").eq("content_status","PUBLISHED").in("id",wordIds):Promise.resolve({data:[]}),
  idiomIds.length?s.from("hanja_idioms").select("id,idiom,reading,meaning").eq("content_status","PUBLISHED").in("id",idiomIds):Promise.resolve({data:[]})
 ]);
 const wordById=new Map((words??[]).map(x=>[x.id,x]));
 const idiomById=new Map((idioms??[]).map(x=>[x.id,x]));
 const wordMap=new Map<number,{id:number;word:string;reading:string|null;meaning:string|null;hanja_form:string|null}>();
 // Prefer a short, easy-to-read example; break ties by stable word ID.
 for(const x of wordMaps??[]){
  const w=wordById.get(x.word_id);
  if(!w)continue;
  const current=wordMap.get(x.hanja_id);
  if(!current||w.hanja_form.length<current.hanja_form.length||(w.hanja_form.length===current.hanja_form.length&&w.id<current.id))wordMap.set(x.hanja_id,w);
 }
 const idiomMap=new Map<number,{idiom:string;reading:string|null;meaning:string|null}>();
 for(const x of idiomMaps??[]){const item=idiomById.get(x.idiom_id);if(item&&!idiomMap.has(x.hanja_id))idiomMap.set(x.hanja_id,item);}
 const relationIds=[...new Set([...wordById.keys()])];
 const {data:relations}=relationIds.length?await s.from("hanja_word_relations").select("from_word_id,to_word_id,relation_type").eq("content_status","PUBLISHED").in("from_word_id",relationIds):{data:[]};
 const relatedWordIds=[...new Set((relations??[]).map(x=>x.to_word_id))];
 const {data:relatedWords}=relatedWordIds.length?await s.from("hanja_words").select("id,word").eq("content_status","PUBLISHED").in("id",relatedWordIds):{data:[]};
 const relatedById=new Map((relatedWords??[]).map(x=>[x.id,x.word]));
 const relationByWord=new Map<number,{label:string;word:string}>();
 for(const x of relations??[]){const word=relatedById.get(x.to_word_id);if(word&&!relationByWord.has(x.from_word_id))relationByWord.set(x.from_word_id,{label:x.relation_type==="OPPOSITE"?"반의어":"유의어",word});}
 const cards=(h??[]).map(x=>({id:x.id,character:x.character,reading:rm.get(x.id)?.reading??"",meaning:rm.get(x.id)?.meaning??"",learned:learned.has(x.id),example:wordMap.get(x.id)??null,relation:relationByWord.get(wordMap.get(x.id)?.id??-1)??null,idiom:idiomMap.get(x.id)??null}));
 return <main className="app-shell hanja-cards-page"><div className="page-top-actions"><Link className="settings-link" href="/">← 홈</Link></div><section className="hero-card"><p className="eyebrow">{p?.target_grade??"목표 급수"}</p><h1>한자 카드</h1><p className="subtitle">한자를 보고 뜻과 소리를 떠올린 뒤 눌러서 확인해 보세요.</p></section><HanjaCardStudy cards={cards}/></main>;
}
