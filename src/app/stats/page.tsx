import { officialGradeDisplayName } from "@/lib/grade-display";
import Link from "next/link";
import { requireActiveUser } from "@/lib/auth/require-active-user";
import { GrowthStickerArt } from "@/components/growth-sticker-art";
import { levelProgress as getLevelProgress, xpForLevel } from "@/lib/xp-level";
import { BottomNav } from "@/components/bottom-nav";
import { ProfileAvatarArt } from "@/components/profile-avatar-art";
import { profileAvatarUrl } from "@/lib/profile-photo";
import { growthStickerRules, nextGrowthSticker } from "@/lib/growth-stickers";
import { StickerCelebration, type StickerNotice } from "@/components/sticker-celebration";
import { RepresentativeStickerPicker } from "@/components/representative-sticker-picker";
import { GiftRequestReward } from "@/components/gift-request-reward";
export default async function StatsPage(){
 const {supabase:s,user}=await requireActiveUser();
 const {data:myProfile}=await s.from("profiles").select("nickname,target_grade,avatar_type,avatar_key,avatar_path,representative_sticker_key,featured_sticker_keys").eq("user_id",user.id).maybeSingle();
 const profilePhoto=myProfile?.avatar_type==="PHOTO"&&myProfile.avatar_path?await profileAvatarUrl(s,myProfile.avatar_path):null;
 const now=new Date();
 const dayKey=(value:Date|string)=>new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Seoul",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date(value));
 const todayKey=dayKey(now);
 // Include today and the six preceding Korea calendar days, not a rolling 168-hour window.
 const since=new Date(`${todayKey}T00:00:00+09:00`); since.setUTCDate(since.getUTCDate()-6); const sinceIso=since.toISOString();
 const streakSince=new Date(now); streakSince.setUTCDate(streakSince.getUTCDate()-120); const streakSinceIso=streakSince.toISOString();
 const [{data:history},{data:progress},{data:sessions},{data:streakHistory},{data:recoveryHistory}]=await Promise.all([
  s.from("review_history").select("hanja_id,activity_type,question_type,result,created_at").eq("user_id",user.id).gte("created_at",sinceIso).order("created_at",{ascending:false}),
  s.from("user_hanja_progress").select("mastery_score,writing_score,study_count,wrong_streak").eq("user_id",user.id).gt("study_count",0),
  s.from("study_sessions").select("planned_new,planned_review,planned_wrong,actual_new,actual_review,started_at,completed_at").eq("user_id",user.id).gte("started_at",sinceIso),
  s.from("review_history").select("created_at").eq("user_id",user.id).gte("created_at",streakSinceIso),
  s.from("review_history").select("hanja_id,activity_type,question_type,result,created_at").eq("user_id",user.id).in("result",["WRONG","UNKNOWN","CORRECT","KNOWN"]).order("created_at",{ascending:true})
 ]);
 const attempts=history??[];const isWritingAttempt=(x:{activity_type:string|null;question_type:string|null})=>x.activity_type==="WRITING"||x.question_type==="STROKE_ORDER";const isAnswered=(result:string|null)=>result==="CORRECT"||result==="KNOWN"||result==="WRONG"||result==="UNKNOWN";const recognitionAttempts=attempts.filter(x=>!isWritingAttempt(x)&&isAnswered(x.result));const writingAttempts=attempts.filter(isWritingAttempt);const correct=recognitionAttempts.filter(x=>x.result==="CORRECT"||x.result==="KNOWN").length;const accuracy=recognitionAttempts.length?Math.round(correct/recognitionAttempts.length*100):0;
 const learned=(progress??[]).length;const mastered=(progress??[]).filter(x=>(x.mastery_score??0)>=75).length;const difficult=(progress??[]).filter(x=>(x.wrong_streak??0)>0).length;const written=(progress??[]).filter(x=>(x.writing_score??0)>0);const writtenCount=written.length;const avgWriting=writtenCount?Math.round(written.reduce((sum,x)=>sum+(x.writing_score??0),0)/writtenCount):0;const weeklyWritten=new Set(writingAttempts.map(x=>x.hanja_id)).size;
 // Use exactly the last seven Korean calendar dates for the weekly sticker.
 const recentActivityDays=new Set((streakHistory??[]).map(x=>dayKey(x.created_at)));
 const recentSevenDayKeys=new Set(Array.from({length:7},(_,offset)=>{const d=new Date(`${todayKey}T12:00:00Z`);d.setUTCDate(d.getUTCDate()-offset);return d.toISOString().slice(0,10);}));
 const days=[...recentActivityDays].filter(key=>recentSevenDayKeys.has(key)).length;
 const todayAttempts=recognitionAttempts.filter(x=>dayKey(x.created_at)===todayKey);
 const todayAnswered=todayAttempts;
 const todayPerfect=todayAnswered.length>=5&&todayAnswered.every(x=>x.result==="CORRECT"||x.result==="KNOWN");
 const todayReviewAttempts=todayAttempts.filter(x=>x.activity_type==="REVIEW");
 const todayReviewPerfect=todayReviewAttempts.length>=3&&todayReviewAttempts.every(x=>x.result==="CORRECT"||x.result==="KNOWN");
 const todaySessions=(sessions??[]).filter(x=>x.completed_at&&dayKey(x.completed_at)===todayKey);
 const plannedNew=todaySessions.reduce((n,x)=>n+(x.planned_new??0),0); const plannedReview=todaySessions.reduce((n,x)=>n+(x.planned_review??0),0); const actualNew=todaySessions.reduce((n,x)=>n+(x.actual_new??0),0); const actualReview=todaySessions.reduce((n,x)=>n+(x.actual_review??0),0); const todayPlanComplete=(plannedNew+plannedReview)>0&&actualNew>=plannedNew&&actualReview>=plannedReview;
 const activityDays=recentActivityDays;
 // Count calendar days in Korea, not UTC days: the latter can skip/repeat a date near midnight.
 const previousKoreanDay=(key:string)=>{const d=new Date(`${key}T12:00:00Z`);d.setUTCDate(d.getUTCDate()-1);return d.toISOString().slice(0,10);};
 let streak=0; let streakKey=activityDays.has(todayKey)?todayKey:previousKoreanDay(todayKey);
 for(let i=0;i<120&&activityDays.has(streakKey);i++){streak++;streakKey=previousKoreanDay(streakKey);}
 const {data:repeatableRows}=await s.from("user_repeatable_sticker_events").select("id,sticker_key,earned_on,earned_at,celebrated_at").eq("user_id",user.id).order("earned_at",{ascending:true});
 const repeatCounts=(repeatableRows??[]).reduce<Record<string,number>>((acc,x)=>{acc[x.sticker_key]=(acc[x.sticker_key]??0)+1;return acc;},{});
 const {data:xpRows}=await s.from("user_xp_events").select("xp,event_date,reason,created_at").eq("user_id",user.id).order("created_at",{ascending:false});
 const totalXp=(xpRows??[]).reduce((sum,x)=>sum+(x.xp??0),0);
 const {data:giftRewardRows}=await s.from("user_gift_request_rewards").select("milestone_level,used_at").eq("user_id",user.id).order("milestone_level",{ascending:true});
 const giftRewards=giftRewardRows??[]; const availableGiftRewards=giftRewards.filter(x=>!x.used_at).length;
 const todayXpRows=(xpRows??[]).filter(x=>x.event_date===todayKey);
 const todayXp=todayXpRows.reduce((sum,x)=>sum+(x.xp??0),0);
 const {level,start:levelStart,end:levelEnd}=getLevelProgress(totalXp); const levelXp=totalXp-levelStart; const levelNeed=levelEnd-levelStart; const nextGiftLevel=Math.ceil((level+1)/5)*5; const xpToNextGift=Math.max(0,xpForLevel(nextGiftLevel)-totalXp);
 const growthTitle=level>=15?"한자 달인":level>=10?"한자 탐험대장":level>=7?"꾸준한 탐험가":level>=4?"성장하는 학습가":"새싹 학습가";
 // Count only hanja whose latest relevant outcome is a recovery from an earlier mistake.
 const recovered=new Set<string|number>(); const seenWrong=new Set<string|number>();
 (recoveryHistory??[]).filter(x=>!isWritingAttempt(x)).forEach(x=>{
  if(x.result==="WRONG"||x.result==="UNKNOWN"){seenWrong.add(x.hanja_id);recovered.delete(x.hanja_id);}
  else if((x.result==="CORRECT"||x.result==="KNOWN")&&seenWrong.has(x.hanja_id))recovered.add(x.hanja_id);
 });
 const reviewed=recognitionAttempts.filter(x=>x.activity_type==="REVIEW").length;
 const nightStudies=(sessions??[]).filter(x=>{if(!x.completed_at)return false;const hour=Number(new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Seoul",hour:"2-digit",hourCycle:"h23"}).format(new Date(x.completed_at)));return hour>=21;}).length;
 const todayMinutes=Math.floor(todaySessions.reduce((sum,x)=>{if(!x.started_at||!x.completed_at)return sum;const duration=(new Date(x.completed_at).getTime()-new Date(x.started_at).getTime())/60000;return sum+(duration>0&&duration<=180?duration:0);},0));
 const stickerRules=growthStickerRules({learned,writtenCount,recovered:recovered.size,mastered,days,streak,accuracy,answered:recognitionAttempts.length,reviewed,level,nightStudies,todayMinutes,weeklyGoal:days>=5});
 const {data:savedStickerRows}=await s.from("user_growth_stickers").select("sticker_key,earned_at,celebrated_at").eq("user_id",user.id);
 const savedKeys=new Set((savedStickerRows??[]).map(x=>x.sticker_key));
 const newlyEarned=stickerRules.filter(x=>x.earned&&!savedKeys.has(x.kind));
 if(newlyEarned.length){
  const {error:awardError}=await s.from("user_growth_stickers").upsert(newlyEarned.map(x=>({user_id:user.id,sticker_key:x.kind})),{onConflict:"user_id,sticker_key",ignoreDuplicates:true});
  if(awardError)console.error("Growth sticker award failed",awardError);
 }
 const {data:stickerRows,error:stickerReadError}=await s.from("user_growth_stickers").select("sticker_key,earned_at,celebrated_at").eq("user_id",user.id);
 if(stickerReadError)console.error("Growth sticker read failed",stickerReadError);
 const persistedKeys=new Set((stickerRows??[]).map(x=>x.sticker_key));
 // A sticker is earned only after its award is persisted; a failed upsert must not appear successful.
 const stickers=stickerRules.map(x=>({...x,earned:persistedKeys.has(x.kind)}));
 const earnedStickers=stickers.filter(x=>x.earned).length; const nextSticker=nextGrowthSticker(stickers);
 const uncelebrated=(stickerRows??[]).filter(x=>!x.celebrated_at).sort((a,b)=>String(a.earned_at).localeCompare(String(b.earned_at)));

 const repeatableLabels:Record<string,{name:string;message:string}>={daily_perfect:{name:"오늘 만점",message:"오늘 학습을 완벽하게 마쳤어요!"},daily_review:{name:"복습 만점",message:"복습도 완벽하게 해냈어요!"},daily_plan:{name:"오늘 계획 완료",message:"오늘 세운 학습 계획을 모두 마쳤어요!"}};
 // Play all newly earned stickers in actual award order, regardless of sticker type.
 const pendingNotices:{notice:StickerNotice;earnedAt:string}[]=[
 ...uncelebrated.flatMap(row=>{const rule=stickerRules.find(x=>x.kind===row.sticker_key);return rule?[{notice:{kind:"growth" as const,name:rule.name,message:rule.message,stickerKey:rule.kind},earnedAt:row.earned_at??""}]:[];}),
 ...(repeatableRows??[]).filter(x=>!x.celebrated_at).flatMap(row=>{const label=repeatableLabels[row.sticker_key];return label?[{notice:{kind:"repeatable" as const,name:label.name,message:label.message,eventId:row.id},earnedAt:row.earned_at??""}]:[];})
 ];
 const notices:StickerNotice[]=pendingNotices.sort((a,b)=>a.earnedAt.localeCompare(b.earnedAt)).map(item=>item.notice);
 return <main className="app-shell"><div className="page-top-actions"><Link className="settings-link" href="/">← 홈</Link></div><section className="hero-card my-profile-summary"><div className="profile-heading"><span className="profile-avatar">{profilePhoto?<img className="profile-photo" src={profilePhoto} alt="" />:<ProfileAvatarArt avatarKey={myProfile?.avatar_key??"boy"} size={56} />}</span><div><p className="eyebrow">나의 성장</p><h1>{myProfile?.nickname||"나"} · Lv.{level}</h1><p className="subtitle">{myProfile?.target_grade?`목표 ${officialGradeDisplayName(myProfile.target_grade)} · `:""}{totalXp} XP</p></div></div><Link className="secondary-button" href="/profile">프로필 설정</Link></section>{notices.length?<StickerCelebration notices={notices} userId={user.id}/>:null}<section className="hero-card"><p className="eyebrow">최근 7일</p><h1>나의 학습 기록</h1><p className="subtitle">점수보다 꾸준히 배운 기록을 확인해요.</p></section><section className="study-card sticker-preview"><div className="section-heading"><div><p className="eyebrow">나의 스티커</p><h2>{earnedStickers}개 모았어요</h2></div><Link href="/stats#sticker-book">스티커북 전체보기 ›</Link></div><div className="sticker-preview-row">{stickers.filter(x=>x.earned).slice(-4).map(s=><div className="sticker-preview-item" key={s.kind}><span className="sticker-art"><GrowthStickerArt kind={s.kind}/></span><strong>{s.name}</strong></div>)}{earnedStickers===0?<p className="subtitle">첫 학습을 완료하면 첫 스티커를 받을 수 있어요.</p>:null}</div><p className="next-achievement">{nextSticker?`🎯 ‘${nextSticker.name}’까지 ${Math.max(0,nextSticker.target-nextSticker.progress)} 남았어요`:"✨ 모든 성장 스티커를 모았어요!"}</p></section><section className="reward-card"><span className="reward-character" aria-hidden="true">★</span><div><p className="eyebrow">나의 성장 · Lv.{level}</p><h2>{growthTitle}</h2><p>{totalXp} XP · 다음 레벨까지 {Math.max(0,levelNeed-levelXp)} XP</p></div></section><GiftRequestReward initialAvailable={availableGiftRewards} totalEarned={giftRewards.length} nextLevel={nextGiftLevel} xpRemaining={xpToNextGift}/><section className="study-card"><div className="section-heading"><div><p className="eyebrow">오늘의 XP</p><h2>오늘 +{todayXp} XP</h2></div><span>꾸준한 학습과 계획 완료에 더 큰 XP를 줘요.</span></div>{todayXpRows.length?<div className="study-grid">{todayXpRows.map((x,i)=><div className="study-item" key={x.reason+i}><span>{x.reason}</span><strong>+{x.xp} XP</strong></div>)}</div>:<p className="subtitle">오늘 학습을 시작하면 XP가 쌓여요.</p>}</section><section className="study-card"><div className="section-heading"><div><p className="eyebrow">매일 모으는 스티커</p><h2>오늘도 공부한 만큼 쌓여요</h2></div><span>같은 스티커도 날짜마다 다시 받을 수 있어요.</span></div><div className="study-grid"><div className="study-item"><span>오늘 만점</span><strong>{todayPerfect?`획득 · ×${repeatCounts.daily_perfect??0}`:`누적 ×${repeatCounts.daily_perfect??0}`}</strong></div><div className="study-item"><span>복습 만점</span><strong>{todayReviewPerfect?`획득 · ×${repeatCounts.daily_review??0}`:`누적 ×${repeatCounts.daily_review??0}`}</strong></div><div className="study-item"><span>오늘 계획 완료</span><strong>{todayPlanComplete?`획득 · ×${repeatCounts.daily_plan??0}`:`누적 ×${repeatCounts.daily_plan??0}`}</strong></div><div className="study-item"><span>연속 학습</span><strong>{streak}일</strong></div></div></section><section className="study-card sticker-section" id="sticker-book"><div className="section-heading"><div><p className="eyebrow">성장 스티커</p><h2>{earnedStickers} / {stickers.length} 모았어요</h2></div><span>꾸준히 공부하면 자연스럽게 모여요.</span></div><RepresentativeStickerPicker stickers={stickers} initialKeys={myProfile?.featured_sticker_keys??(myProfile?.representative_sticker_key?[myProfile.representative_sticker_key]:[])} /></section><section className="study-card"><div className="study-grid"><div className="study-item"><span>학습한 한자</span><strong>{learned}자</strong></div><div className="study-item"><span>학습한 날</span><strong>{days}일</strong></div><div className="study-item"><span>정답률</span><strong>{accuracy}%</strong></div><div className="study-item"><span>익숙한 한자</span><strong>{mastered}자</strong></div><div className="study-item"><span>다시 볼 한자</span><strong>{difficult}자</strong></div><div className="study-item"><span>문제·복습</span><strong>{recognitionAttempts.length}회</strong></div><div className="study-item"><span>써 본 한자</span><strong>{writtenCount}자</strong></div><div className="study-item"><span>쓰기 연습도 평균</span><strong>{avgWriting}%</strong></div><div className="study-item"><span>7일 쓰기 연습</span><strong>{writingAttempts.length}회 · {weeklyWritten}자</strong></div></div></section><section className="study-card my-settings-entry"><h2>설정</h2><p className="subtitle">목표 급수, 시험 날짜, 음성, 프로필과 계정 설정을 변경할 수 있어요.</p><Link className="secondary-button" href="/settings">설정 열기</Link></section><BottomNav active="settings" /></main>;
}