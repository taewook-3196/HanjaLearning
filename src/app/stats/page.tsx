import Link from "next/link";
import { requireActiveUser } from "@/lib/auth/require-active-user";
import { GrowthStickerArt } from "@/components/growth-sticker-art";
import { celebrateGrowthSticker } from "./actions";
export default async function StatsPage(){
 const {supabase:s,user}=await requireActiveUser();
 const now=new Date(); const since=new Date(now); since.setUTCDate(since.getUTCDate()-7); const sinceIso=since.toISOString();
 const dayKey=(value:Date|string)=>new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Seoul",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date(value));
 const todayKey=dayKey(now);
 const [{data:history},{data:progress},{data:sessions}]=await Promise.all([
  s.from("review_history").select("hanja_id,activity_type,question_type,result,created_at").eq("user_id",user.id).gte("created_at",sinceIso).order("created_at",{ascending:false}),
  s.from("user_hanja_progress").select("mastery_score,writing_score,study_count,wrong_streak").eq("user_id",user.id).gt("study_count",0),
  s.from("study_sessions").select("planned_new,planned_review,planned_wrong,actual_new,actual_review,completed_at").eq("user_id",user.id).gte("started_at",sinceIso)
 ]);
 const attempts=history??[];const recognitionAttempts=attempts.filter(x=>x.activity_type!=="WRITING");const writingAttempts=attempts.filter(x=>x.activity_type==="WRITING"||x.question_type==="STROKE_ORDER");const correct=recognitionAttempts.filter(x=>x.result==="CORRECT"||x.result==="KNOWN").length;const accuracy=recognitionAttempts.length?Math.round(correct/recognitionAttempts.length*100):0;
 const learned=(progress??[]).length;const mastered=(progress??[]).filter(x=>(x.mastery_score??0)>=75).length;const difficult=(progress??[]).filter(x=>(x.wrong_streak??0)>0).length;const written=(progress??[]).filter(x=>(x.writing_score??0)>0);const writtenCount=written.length;const avgWriting=writtenCount?Math.round(written.reduce((sum,x)=>sum+(x.writing_score??0),0)/writtenCount):0;const weeklyWritten=new Set(writingAttempts.map(x=>x.hanja_id)).size;
 const days=new Set(attempts.map(x=>dayKey(x.created_at))).size;
 const todayAttempts=attempts.filter(x=>dayKey(x.created_at)===todayKey&&x.activity_type!=="WRITING");
 const todayAnswered=todayAttempts.filter(x=>["CORRECT","KNOWN","WRONG","UNKNOWN"].includes(x.result));
 const todayPerfect=todayAnswered.length>0&&todayAnswered.every(x=>x.result==="CORRECT"||x.result==="KNOWN");
 const todayReviewAttempts=todayAttempts.filter(x=>x.activity_type==="REVIEW");
 const todayReviewPerfect=todayReviewAttempts.length>0&&todayReviewAttempts.every(x=>x.result==="CORRECT"||x.result==="KNOWN");
 const todaySessions=(sessions??[]).filter(x=>x.completed_at&&dayKey(x.completed_at)===todayKey);
 const todayPlanComplete=todaySessions.some(x=>(x.actual_new??0)>=(x.planned_new??0)&&(x.actual_review??0)>=(x.planned_review??0)&&((x.planned_new??0)+(x.planned_review??0)+(x.planned_wrong??0)>0));
 if(todayPerfect) await s.from("user_repeatable_sticker_events").upsert({user_id:user.id,sticker_key:"daily_perfect",earned_on:todayKey},{onConflict:"user_id,sticker_key,earned_on",ignoreDuplicates:true});
 if(todayReviewPerfect) await s.from("user_repeatable_sticker_events").upsert({user_id:user.id,sticker_key:"daily_review",earned_on:todayKey},{onConflict:"user_id,sticker_key,earned_on",ignoreDuplicates:true});
 if(todayPlanComplete) await s.from("user_repeatable_sticker_events").upsert({user_id:user.id,sticker_key:"daily_plan",earned_on:todayKey},{onConflict:"user_id,sticker_key,earned_on",ignoreDuplicates:true});
 const activityDays=[...new Set(attempts.map(x=>dayKey(x.created_at)))].sort().reverse();
 let streak=0; const streakCursor=new Date(now); if(!activityDays.includes(todayKey))streakCursor.setUTCDate(streakCursor.getUTCDate()-1);
 for(let i=0;i<60;i++){const key=dayKey(streakCursor);if(!activityDays.includes(key))break;streak++;streakCursor.setUTCDate(streakCursor.getUTCDate()-1);}
 const milestoneXp=streak===100?200:streak===60?140:streak===30?100:streak===14?60:streak===7?35:0;
 const xpEvents=[
  ...(todayAnswered.length>0?[{user_id:user.id,event_key:"daily_activity",event_date:todayKey,xp:10,reason:"오늘 학습"}]:[]),
  ...(todayReviewAttempts.length>0?[{user_id:user.id,event_key:"daily_review",event_date:todayKey,xp:10,reason:"오늘 복습"}]:[]),
  ...(todayPerfect?[{user_id:user.id,event_key:"daily_perfect",event_date:todayKey,xp:10,reason:"오늘 학습 만점"}]:[]),
  ...(todayPlanComplete?[{user_id:user.id,event_key:"daily_plan_complete",event_date:todayKey,xp:25,reason:"오늘 계획 완료"}]:[]),
  ...(streak>=2?[{user_id:user.id,event_key:"streak_bonus",event_date:todayKey,xp:Math.min(30,5+Math.floor((streak-2)/3)*5),reason:`${streak}일 연속 학습`}]:[]),
  ...(milestoneXp>0?[{user_id:user.id,event_key:`streak_milestone_${streak}`,event_date:todayKey,xp:milestoneXp,reason:`${streak}일 연속 학습 달성`}]:[])
 ];
 if(xpEvents.length) await s.from("user_xp_events").upsert(xpEvents,{onConflict:"user_id,event_key,event_date",ignoreDuplicates:true});
 const {data:repeatableRows}=await s.from("user_repeatable_sticker_events").select("sticker_key,earned_on").eq("user_id",user.id);
 const repeatCounts=(repeatableRows??[]).reduce<Record<string,number>>((acc,x)=>{acc[x.sticker_key]=(acc[x.sticker_key]??0)+1;return acc;},{});
 const {data:xpRows}=await s.from("user_xp_events").select("xp").eq("user_id",user.id);
 const totalXp=(xpRows??[]).reduce((sum,x)=>sum+(x.xp??0),0);
 const level=Math.floor(Math.sqrt(totalXp/50))+1; const levelStart=50*(level-1)*(level-1); const levelEnd=50*level*level; const levelXp=totalXp-levelStart; const levelNeed=levelEnd-levelStart;
 const growthTitle=level>=15?"한자 달인":level>=10?"한자 탐험대장":level>=7?"꾸준한 탐험가":level>=4?"성장하는 학습가":"새싹 학습가";
 const recovered=new Set<string|number>(); const seenWrong=new Set<string|number>(); [...attempts].reverse().forEach(x=>{if(x.result==="WRONG"||x.result==="UNKNOWN")seenWrong.add(x.hanja_id);else if((x.result==="CORRECT"||x.result==="KNOWN")&&seenWrong.has(x.hanja_id))recovered.add(x.hanja_id);});
 const stars=Math.min(99,learned+correct); const badge=learned>=50?"한자 탐험가":learned>=20?"꾸준한 학습가":learned>=5?"첫걸음 완료":"첫걸음 준비"; const stickerRules=[{kind:"first" as const,name:"첫걸음",earned:learned>=1,detail:"한자 1자 학습",message:"한자 여행의 첫걸음을 내디뎠어요!"},{kind:"stack" as const,name:"차곡차곡",earned:learned>=20,detail:"한자 20자 학습",message:"배운 한자가 차곡차곡 쌓이고 있어요."},{kind:"write" as const,name:"쓰기 시작",earned:writtenCount>=5,detail:"5자 쓰기 연습",message:"눈으로만 보지 않고 직접 써 봤어요."},{kind:"retry" as const,name:"다시 도전",earned:recovered.size>0,detail:"틀린 한자를 다시 맞히기",message:"틀려도 다시 도전하는 힘이 자라고 있어요."},{kind:"master" as const,name:"숙달 시작",earned:mastered>=10,detail:"10자 익숙해지기",message:"익숙한 한자가 하나둘 늘고 있어요."},{kind:"week" as const,name:"꾸준한 한 주",earned:days>=5,detail:"최근 7일 중 5일 학습",message:"꾸준함이 가장 멋진 실력이에요."}];
 const {data:savedStickerRows}=await s.from("user_growth_stickers").select("sticker_key,earned_at,celebrated_at").eq("user_id",user.id);
 const savedKeys=new Set((savedStickerRows??[]).map(x=>x.sticker_key));
 const newlyEarned=stickerRules.filter(x=>x.earned&&!savedKeys.has(x.kind));
 if(newlyEarned.length){
  await s.from("user_growth_stickers").upsert(newlyEarned.map(x=>({user_id:user.id,sticker_key:x.kind})),{onConflict:"user_id,sticker_key",ignoreDuplicates:true});
 }
 const {data:stickerRows}=await s.from("user_growth_stickers").select("sticker_key,earned_at,celebrated_at").eq("user_id",user.id);
 const persistedKeys=new Set((stickerRows??[]).map(x=>x.sticker_key));
 const stickers=stickerRules.map(x=>({...x,earned:persistedKeys.has(x.kind)||x.earned}));
 const earnedStickers=stickers.filter(x=>x.earned).length;
 const uncelebrated=(stickerRows??[]).filter(x=>!x.celebrated_at).sort((a,b)=>String(a.earned_at).localeCompare(String(b.earned_at)));
 const celebrationRow=uncelebrated[0];
 const celebration=celebrationRow?stickerRules.find(x=>x.kind===celebrationRow.sticker_key):null;
 return <main className="app-shell">{celebration&&celebrationRow?<section className="sticker-celebration" role="status" aria-live="polite"><div className="sticker-celebration-card"><p className="eyebrow">새 성장 스티커</p><span className="sticker-celebration-art"><GrowthStickerArt kind={celebration.kind}/></span><h2>{celebration.name}</h2><p>{celebration.message}</p><form action={celebrateGrowthSticker}><input type="hidden" name="stickerKey" value={celebration.kind}/><button className="primary-button" type="submit">스티커 받기</button></form></div></section>:null}<section className="hero-card"><p className="eyebrow">최근 7일</p><h1>나의 학습 기록</h1><p className="subtitle">점수보다 꾸준히 배운 기록을 확인해요.</p></section><section className="reward-card"><span className="reward-character" aria-hidden="true">★</span><div><p className="eyebrow">나의 성장 · Lv.{level}</p><h2>{growthTitle}</h2><p>{totalXp} XP · 다음 레벨까지 {Math.max(0,levelNeed-levelXp)} XP</p></div></section><section className="study-card"><div className="section-heading"><div><p className="eyebrow">매일 모으는 스티커</p><h2>오늘도 공부한 만큼 쌓여요</h2></div><span>같은 스티커도 날짜마다 다시 받을 수 있어요.</span></div><div className="study-grid"><div className="study-item"><span>오늘 만점</span><strong>{todayPerfect?`획득 · ×${repeatCounts.daily_perfect??0}`:`누적 ×${repeatCounts.daily_perfect??0}`}</strong></div><div className="study-item"><span>복습 만점</span><strong>{todayReviewPerfect?`획득 · ×${repeatCounts.daily_review??0}`:`누적 ×${repeatCounts.daily_review??0}`}</strong></div><div className="study-item"><span>오늘 계획 완료</span><strong>{todayPlanComplete?`획득 · ×${repeatCounts.daily_plan??0}`:`누적 ×${repeatCounts.daily_plan??0}`}</strong></div><div className="study-item"><span>연속 학습</span><strong>{streak}일</strong></div></div></section><section className="study-card sticker-section"><div className="section-heading"><div><p className="eyebrow">성장 스티커</p><h2>{earnedStickers} / {stickers.length} 모았어요</h2></div><span>꾸준히 공부하면 자연스럽게 모여요.</span></div><div className="sticker-grid">{stickers.map(s=><div className={`sticker-item${s.earned?" earned":""}`} key={s.name}><span className="sticker-art"><GrowthStickerArt kind={s.kind} locked={!s.earned}/><b>{s.earned?"★":""}</b></span><strong>{s.name}</strong><small>{s.detail}</small>{s.earned?<em>{s.message}</em>:<em>아직 잠겨 있어요</em>}</div>)}</div></section><section className="study-card"><div className="study-grid"><div className="study-item"><span>학습한 한자</span><strong>{learned}자</strong></div><div className="study-item"><span>학습한 날</span><strong>{days}일</strong></div><div className="study-item"><span>정답률</span><strong>{accuracy}%</strong></div><div className="study-item"><span>익숙한 한자</span><strong>{mastered}자</strong></div><div className="study-item"><span>다시 볼 한자</span><strong>{difficult}자</strong></div><div className="study-item"><span>문제·복습</span><strong>{recognitionAttempts.length}회</strong></div><div className="study-item"><span>써 본 한자</span><strong>{writtenCount}자</strong></div><div className="study-item"><span>쓰기 연습도 평균</span><strong>{avgWriting}%</strong></div><div className="study-item"><span>7일 쓰기 연습</span><strong>{writingAttempts.length}회 · {weeklyWritten}자</strong></div></div></section><Link className="settings-link" href="/">홈으로</Link></main>;
}