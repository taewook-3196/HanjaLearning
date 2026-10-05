import Link from "next/link";
import {requireActiveUser} from "@/lib/auth/require-active-user";
import CollectionGrid from "@/components/collection-grid";

export default async function CollectionPage(){
 const {supabase:s,user}=await requireActiveUser();
 const [{data:p},{data:st}]=await Promise.all([
  s.from("profiles").select("target_grade").eq("user_id",user.id).maybeSingle(),
  s.from("user_settings").select("exam_provider_id,sound_enabled,speech_voice").eq("user_id",user.id).maybeSingle()
 ]);
 let gq=s.from("exam_grades").select("id,name").eq("code",p?.target_grade??"5");if(st?.exam_provider_id)gq=gq.eq("provider_id",st.exam_provider_id);
 const {data:grades}=await gq;if(!grades?.length)return <main className="app-shell"><section className="study-card"><h1>한자 도감</h1><p>목표 급수를 먼저 설정해 주세요.</p><Link href="/settings">설정하기</Link></section></main>;
 const gradeIds=grades.map(g=>g.id);const {data:maps}=await s.from("grade_hanja").select("hanja_id").in("grade_id",gradeIds);const ids=[...new Set((maps??[]).map(x=>x.hanja_id))];
 const [{data:h},{data:r},{data:prog},{data:wordMaps}]=await Promise.all([
  s.from("hanja").select("id,character").in("id",ids),
  s.from("hanja_readings").select("hanja_id,reading,meaning").in("hanja_id",ids).eq("is_primary",true),
  s.from("user_hanja_progress").select("hanja_id,mastery_score,study_count").eq("user_id",user.id).in("hanja_id",ids),
  s.from("hanja_word_map").select("hanja_id,word_id").in("hanja_id",ids)
 ]);
 const wordIds=[...new Set((wordMaps??[]).map(x=>x.word_id))];
 const {data:words}=wordIds.length?await s.from("hanja_words").select("id,word,reading,meaning,child_explanation").in("id",wordIds).eq("content_status","PUBLISHED"):{data:[]};
 const allWordMaps=wordIds.length?(await s.from("hanja_word_map").select("word_id,hanja_id,position").in("word_id",wordIds)).data??[]:[];
 const wordHanjaIds=[...new Set(allWordMaps.map(x=>x.hanja_id))];
 const [{data:wordHanja},{data:gradeMaps}]=wordHanjaIds.length?await Promise.all([s.from("hanja").select("id,character").in("id",wordHanjaIds),s.from("grade_hanja").select("hanja_id,grade_id").in("hanja_id",wordHanjaIds).eq("is_new_at_grade",true)]):[{data:[]},{data:[]}];
 const gradeIdsForWords=[...new Set((gradeMaps??[]).map(x=>x.grade_id))];const {data:wordGrades}=gradeIdsForWords.length?await s.from("exam_grades").select("id,name").in("id",gradeIdsForWords):{data:[]};
 const charById=new Map((wordHanja??[]).map(x=>[x.id,x.character]));const gradeNameById=new Map((wordGrades??[]).map(x=>[x.id,x.name]));const gradeByHanja=new Map((gradeMaps??[]).map(x=>[x.hanja_id,gradeNameById.get(x.grade_id)??null]));
 const charsByWord=new Map<number,Array<{hanja_id:number;position:number}>>();for(const m of allWordMaps){const list=charsByWord.get(m.word_id)??[];list.push({hanja_id:m.hanja_id,position:m.position});charsByWord.set(m.word_id,list)}
 const wm=new Map((words??[]).map(w=>[w.id,w]));const examples=new Map<number,Array<{word:string;reading:string|null;meaning:string;child_explanation:string|null;chars:{character:string;grade:string|null;isCurrent:boolean}[]}>>();
 const lessPreferred=new Set(["금일","동계","춘계","하계","조식","견공","우육","경성","동리","패류"]);const rankedWordMaps=[...(wordMaps??[])].sort((a,b)=>Number(lessPreferred.has(wm.get(a.word_id)?.word??""))-Number(lessPreferred.has(wm.get(b.word_id)?.word??"")));
 for(const map of rankedWordMaps){const w=wm.get(map.word_id);if(!w)continue;const list=examples.get(map.hanja_id)??[];if(list.length<2){const chars=(charsByWord.get(map.word_id)??[]).sort((a,b)=>a.position-b.position).map(x=>({character:charById.get(x.hanja_id)??"",grade:gradeByHanja.get(x.hanja_id)??null,isCurrent:x.hanja_id===map.hanja_id}));list.push({word:w.word,reading:w.reading,meaning:w.meaning,child_explanation:w.child_explanation,chars});}examples.set(map.hanja_id,list)}
 const rm=new Map((r??[]).map(x=>[x.hanja_id,x]));const pm=new Map((prog??[]).map(x=>[x.hanja_id,x]));const rows=(h??[]).map(x=>({id:x.id,character:x.character,reading:rm.get(x.id)??null,progress:pm.get(x.id)??null,examples:examples.get(x.id)??[]})).sort((a,b)=>(b.progress?.study_count??0)-(a.progress?.study_count??0)||a.id-b.id);
 return <main className="app-shell"><section className="hero-card"><p className="eyebrow">{p?.target_grade??"목표 급수"}</p><h1>한자 도감</h1><p className="subtitle">배운 한자를 눌러 뜻·소리·예시 말과 쓰기를 다시 확인해 보세요.</p></section><CollectionGrid rows={rows} soundEnabled={st?.sound_enabled??true} speechVoice={st?.speech_voice??"DAD"}/><Link className="settings-link" href="/">홈으로</Link></main>;
}
