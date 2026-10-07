import Link from "next/link";

type NavKey="home"|"quiz"|"exam"|"friends"|"settings";

export function BottomNav({active,friendAlertCount=0}:{active:NavKey;friendAlertCount?:number}){
 const items:[NavKey,string,string][]=[
  ["home","홈","/"],["quiz","퀴즈","/quiz"],["exam","모의시험","/exam"],["friends","친구","/friends"],["settings","나","/settings"],
 ];
 return <nav className="bottom-nav" aria-label="주 메뉴">{items.map(([key,label,href])=>key===active?<span key={key} className="active" aria-current="page">{label}{key==="friends"&&friendAlertCount>0?<b className="nav-badge">{friendAlertCount}</b>:null}</span>:<Link key={key} className={key==="friends"&&friendAlertCount>0?"nav-has-alert":undefined} href={href}>{label}{key==="friends"&&friendAlertCount>0?<b className="nav-badge">{friendAlertCount}</b>:null}</Link>)}</nav>;
}
