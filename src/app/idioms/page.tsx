import Link from "next/link";
import {requireActiveUser} from "@/lib/auth/require-active-user";
import IdiomStudy from "@/components/idiom-study";
export default async function IdiomsPage(){
 const {supabase}=await requireActiveUser();
 const {data}=await supabase.from("hanja_idioms").select("id,idiom,reading,meaning,child_explanation").eq("content_status","PUBLISHED").order("id");
 const ids=(data??[]).map(x=>x.id);
 const {data:mappings}=ids.length?await supabase.from("hanja_idiom_map").select("idiom_id,hanja_id,position").in("idiom_id",ids).order("position"):{data:[]};
 const hanjaIds=[...new Set((mappings??[]).map(x=>x.hanja_id))];
 const [{data:hanja},{data:readings}]=await Promise.all([
  hanjaIds.length?supabase.from("hanja").select("id,character,primary_meaning,primary_reading").in("id",hanjaIds):Promise.resolve({data:[]}),
  hanjaIds.length?supabase.from("hanja_readings").select("hanja_id,reading,meaning").in("hanja_id",hanjaIds).eq("is_primary",true):Promise.resolve({data:[]})
 ]);
 const hMap=new Map((hanja??[]).map(x=>[x.id,x]));
 const rMap=new Map((readings??[]).map(x=>[x.hanja_id,x]));
 const mapped=new Map<number,{character:string;meaning:string;reading:string}[]>();
 for(const m of mappings??[]){const h=hMap.get(m.hanja_id);if(!h)continue;const rd=rMap.get(m.hanja_id);const items=mapped.get(m.idiom_id)??[];items.push({character:h.character,meaning:rd?.meaning??h.primary_meaning??"",reading:rd?.reading??h.primary_reading??""});mapped.set(m.idiom_id,items);}
 const rows=(data??[]).map(x=>({...x,characters:mapped.get(x.id)??[]}));
 return <main className="app-shell"><div className="page-top-actions"><Link className="settings-link" href="/">← 홈</Link></div><header className="free-study-heading"><h1>사자성어</h1><p>카드를 눌러 뜻 확인 · 좌우로 넘기기</p></header><IdiomStudy rows={rows}/></main>;
}