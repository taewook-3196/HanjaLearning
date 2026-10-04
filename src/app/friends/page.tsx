"use client";
import {useEffect,useState} from "react";
import {createClient} from "@/lib/supabase/client";
type Learner={user_id:string;login_id:string;nickname:string;target_grade:string|null};
type F={id:number;requester_id:string;addressee_id:string;status:string};
export default function FriendsPage(){
 const [me,setMe]=useState("");const [people,setPeople]=useState<Learner[]>([]);const [friends,setFriends]=useState<F[]>([]);const [msg,setMsg]=useState("");
 async function load(){const s=createClient();const {data:{user}}=await s.auth.getUser();if(!user)return;setMe(user.id);const [{data:p},{data:f}]=await Promise.all([s.rpc("list_active_learners"),s.from("friendships").select("*")]);setPeople((p??[]).filter((x:Learner)=>x.user_id!==user.id));setFriends(f??[]);}
 useEffect(()=>{queueMicrotask(()=>{void load();});},[]);
 const relation=(id:string)=>friends.find(f=>f.requester_id===id||f.addressee_id===id);
 async function request(id:string){const s=createClient();const {error}=await s.from("friendships").insert({requester_id:me,addressee_id:id});if(error)setMsg("친구 신청을 보내지 못했어요.");else{setMsg("친구 신청을 보냈어요.");await load();}}
 async function decide(id:number,status:"ACCEPTED"|"REJECTED"){const s=createClient();await s.from("friendships").update({status,updated_at:new Date().toISOString()}).eq("id",id);await load();}
 return <main className="app-shell"><section className="hero-card"><p className="eyebrow">함께 공부하기</p><h1>친구</h1><p className="subtitle">승인된 아빠한자 사용자에게 친구 신청을 보내고 함께 진도를 확인해요.</p></section>{msg?<p>{msg}</p>:null}<section className="admin-list">{people.map(p=>{const r=relation(p.user_id);return <article className="admin-user-card" key={p.user_id}><div><strong>{p.nickname}</strong><span>@{p.login_id} · {p.target_grade??"급수 미설정"}</span></div>{!r?<button onClick={()=>request(p.user_id)}>친구 추가</button>:r.status==="PENDING"&&r.addressee_id===me?<div className="admin-actions"><button onClick={()=>decide(r.id,"ACCEPTED")}>수락</button><button className="secondary-button" onClick={()=>decide(r.id,"REJECTED")}>거절</button></div>:<p>{r.status==="ACCEPTED"?"친구예요":r.status==="PENDING"?"친구 신청 중":"친구 신청이 종료됐어요"}</p>}</article>})}</section></main>;
}