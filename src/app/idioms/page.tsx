import Link from "next/link";
import {requireActiveUser} from "@/lib/auth/require-active-user";
import IdiomStudy from "@/components/idiom-study";
export default async function IdiomsPage(){
 const {supabase}=await requireActiveUser();
 const {data}=await supabase.from("hanja_idioms").select("id,idiom,reading,meaning,child_explanation").eq("content_status","PUBLISHED").order("id");
 return <main className="app-shell"><div className="page-top-actions"><Link className="settings-link" href="/">← 홈</Link></div><section className="hero-card"><p className="eyebrow">자유 학습</p><h1>사자성어</h1><p className="subtitle">네 글자의 뜻을 생각한 다음 카드를 눌러 확인해 보세요.</p></section><IdiomStudy rows={data??[]}/></main>;
}