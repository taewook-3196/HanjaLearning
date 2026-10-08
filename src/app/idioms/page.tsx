import Link from "next/link";
import {requireActiveUser} from "@/lib/auth/require-active-user";
import IdiomStudy from "@/components/idiom-study";
export default async function IdiomsPage(){
 const {supabase}=await requireActiveUser();
 const {data}=await supabase.from("hanja_idioms").select("id,idiom,reading,meaning,child_explanation").eq("content_status","PUBLISHED").order("id");
 return <main className="app-shell"><div className="page-top-actions"><Link className="settings-link" href="/">← 홈</Link></div><header className="free-study-heading"><h1>사자성어</h1><p>카드를 눌러 뜻 확인 · 좌우로 넘기기</p></header><IdiomStudy rows={data??[]}/></main>;
}