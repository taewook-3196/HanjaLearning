import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";
import { redirect } from "next/navigation";
import { requireActiveUser } from "@/lib/auth/require-active-user";
import { buildStudyPlan } from "@/lib/study-plan";
import { profileAvatarUrl } from "@/lib/profile-photo";
import { ProfileAvatarArt } from "@/components/profile-avatar-art";
import { levelProgress as getLevelProgress } from "@/lib/xp-level";

export default async function Home() {
  const { supabase, user } = await requireActiveUser();

  const [{ data: profile }, { data: settings }, { data: friendUnread }, { count: friendRequests }] = await Promise.all([
    supabase.from("profiles").select("nickname,target_provider,target_grade,avatar_type,avatar_key,avatar_path").eq("user_id", user.id).maybeSingle(),
    supabase.from("user_settings").select("exam_provider_id,target_exam_date").eq("user_id", user.id).maybeSingle(),
    supabase.rpc("friend_unread_message_count"),
    supabase.from("friendships").select("*",{count:"exact",head:true}).eq("addressee_id",user.id).eq("status","PENDING"),
  ]);
  const friendAlertCount=Number(friendUnread??0)+(friendRequests??0);
  const {data:xpRows}=await supabase.from("user_xp_events").select("xp").eq("user_id",user.id);
  const totalXp=(xpRows??[]).reduce((sum,x)=>sum+(x.xp??0),0);
  const {level,progress:levelProgress}=getLevelProgress(totalXp);
  const growthTitle=level>=15?"한자 달인":level>=10?"한자 탐험대장":level>=7?"꾸준한 탐험가":level>=4?"성장하는 학습가":"새싹 학습가";
  if (!profile?.target_provider || !profile?.target_grade) redirect("/onboarding");
  const avatarUrl=profile.avatar_type==="PHOTO"&&profile.avatar_path?await profileAvatarUrl(supabase,profile.avatar_path):null;
  const profileAvatar=avatarUrl?<img className="profile-photo" src={avatarUrl} width={48} height={48} alt="" />:<ProfileAvatarArt avatarKey={profile.avatar_key} size={48} />;

  let gradeQuery = supabase.from("exam_grades").select("id,name,cumulative_hanja_count").eq("code", profile.target_grade);
  if (settings?.exam_provider_id) gradeQuery = gradeQuery.eq("provider_id", settings.exam_provider_id);
  const { data: grades } = await gradeQuery;
  const gradeIds = (grades ?? []).map((grade) => grade.id);
  let targetCount = 0;

  let learnedCount = 0, masteredCount = 0, familiarCount = 0, reviewCount = 0, wrongCount = 0;
  const streakSince=new Date(); streakSince.setUTCDate(streakSince.getUTCDate()-60);
  const {data:recentActivity}=await supabase.from("review_history").select("created_at").eq("user_id",user.id).gte("created_at",streakSince.toISOString()).order("created_at",{ascending:false});
  const dayKey=(value:Date|string)=>new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Seoul",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date(value));
  const activeDays=new Set((recentActivity??[]).map(x=>dayKey(x.created_at)));
  const todayKey=dayKey(new Date());
  let streak=0; const cursor=new Date();
  if(!activeDays.has(todayKey)) cursor.setUTCDate(cursor.getUTCDate()-1);
  for(let i=0;i<60;i++){if(!activeDays.has(dayKey(cursor)))break;streak++;cursor.setUTCDate(cursor.getUTCDate()-1);}

  if (gradeIds.length) {
    const scopeRows = (await Promise.all(gradeIds.map((gradeId) => supabase.rpc("list_grade_hanja_ids", { target_grade_id: gradeId })))).flatMap((result) => result.data ?? []);
    const ids = [...new Set(scopeRows.map((m) => m.hanja_id))];
    targetCount = ids.length;
    if (ids.length) {
      const now = new Date().toISOString();
      const [{ count: learned }, { count: mastered }, { count: familiar }, { count: review }, { count: wrong }] = await Promise.all([
        supabase.from("user_hanja_progress").select("*",{count:"exact",head:true}).eq("user_id",user.id).in("hanja_id",ids).gt("study_count",0),
        supabase.from("user_hanja_progress").select("*",{count:"exact",head:true}).eq("user_id",user.id).in("hanja_id",ids).eq("learning_state","MASTERED"),
        supabase.from("user_hanja_progress").select("*",{count:"exact",head:true}).eq("user_id",user.id).in("hanja_id",ids).eq("learning_state","FAMILIAR"),
        supabase.from("user_hanja_progress").select("*",{count:"exact",head:true}).eq("user_id",user.id).in("hanja_id",ids).gt("study_count",0).lte("next_review_at",now),
        supabase.from("user_hanja_progress").select("*",{count:"exact",head:true}).eq("user_id",user.id).in("hanja_id",ids).gt("study_count",0).gt("wrong_streak",0),
      ]);
      learnedCount=learned??0; masteredCount=mastered??0; familiarCount=familiar??0; reviewCount=review??0; wrongCount=wrong??0;
    }
  }
  if (targetCount === 0) {
    return <main className="app-shell"><header className="home-header"><div className="profile-heading"><span className="profile-avatar">{profileAvatar}</span><div><strong>{profile.nickname}</strong></div></div><img className="home-app-icon" src="/app-icon.webp" width={52} height={52} alt="아빠한자" /></header><section className="study-card"><div><p className="eyebrow">목표급수 확인</p><h2>{profile.target_grade}은(는) 아직 학습할 수 없어요.</h2><p className="subtitle">지금 학습 가능한 급수로 목표를 바꿔 주세요. 기존 학습 기록은 그대로 남습니다.</p></div><Link className="primary-link" href="/settings">학습 가능한 급수 선택하기</Link></section></main>;
  }
  const plan=buildStudyPlan({unseen:Math.max(0,targetCount-learnedCount),dueReviews:reviewCount,weakNotDue:Math.max(0,learnedCount-masteredCount-reviewCount),examDate:settings?.target_exam_date});
  const todayReviewCount=plan.reviewCount;
  const newCount=plan.newCount;
  const todayTotal=plan.total;
  const estimatedMinutes=Math.max(1,Math.ceil(todayTotal*0.9));
  const percent=targetCount?Math.min(100,Math.round((learnedCount/targetCount)*100)):0;
  const masteryPercent=targetCount?Math.min(100,Math.round((masteredCount/targetCount)*100)):0;
  const needsMastery=Math.max(0,targetCount-masteredCount);
  const providerRows=await supabase.from("exam_providers").select("name").eq("code",profile.target_provider).maybeSingle();
  const providerLabel=providerRows.data?.name??(profile.target_provider==="ALL"?"전체":profile.target_provider);
  const gradeLabel=grades?.[0]?.name??profile.target_grade;

  return <main className="app-shell">
    <header className="home-header"><div className="profile-heading"><span className="profile-avatar">{profileAvatar}</span><div><strong>{profile.nickname} <small className="home-level">Lv.{level}</small></strong><span>{providerLabel} · {gradeLabel} 도전</span></div></div><img className="home-app-icon" src="/app-icon.webp" width={52} height={52} alt="아빠한자" /></header>
    {friendAlertCount>0?<Link className="friend-home-alert" href="/friends">친구 알림 · {friendRequests??0}건 신청 · {Number(friendUnread??0)}건 새 메시지 ›</Link>:null}
    <section className="study-card today-card">{plan.daysUntilExam!==null?<p className="eyebrow">시험 D-{plan.daysUntilExam} · {plan.phase==="LEARN"?`새 한자 학습 + 시험 전 ${plan.masteryDays}일 숙달 확보`:plan.phase==="CATCH_UP"?"일정이 빠듯해요 · 새 학습과 복습을 함께 진행":plan.phase==="MASTER"?"숙달·복습 집중 기간":"시험일"}</p>:null}<div className="today-heading compact"><div><p className="eyebrow">오늘 할 일</p><h2>{todayTotal>0?`${todayTotal}자 · 약 ${estimatedMinutes}분`:"오늘 학습 완료"}</h2></div><div className="streak-badge" aria-label={`연속 학습 ${streak}일`}><span aria-hidden="true">●</span><strong>{streak}일</strong><small>연속</small></div></div><div className="compact-plan"><span>새 한자 <strong>{newCount}</strong></span><span>복습 <strong>{todayReviewCount+plan.extraMasteryReviews}</strong></span><span>확인 <strong>{todayTotal>0?Math.min(3,todayTotal):0}</strong></span>{wrongCount>0?<Link className="wrong-note-link" href="/learn?mode=wrong">오답노트 <strong>{wrongCount}</strong> ›</Link>:null}</div>{todayTotal>0?<Link className="primary-link" href="/learn">계속 학습하기</Link>:null}<div className="home-quick-links"><Link href="/write">쓰기 연습</Link><Link href="/stats">학습 기록</Link><Link href="/collection">漢 도감</Link></div></section>
    <section className="progress-card xp-progress"><div className="progress-heading"><div><p className="eyebrow">꾸준함 XP</p><h2>Lv.{level} · {growthTitle}</h2></div><strong>{levelProgress}%</strong></div><div className="progress-track" aria-label={"레벨 진행 "+levelProgress+"%"}><span style={{width:levelProgress+"%"}} /></div><p className="subtitle">{totalXp} XP · 매일 계획을 완료하고 연속으로 공부할수록 더 빠르게 성장해요.</p></section><section className="progress-card compact-progress"><div className="progress-heading"><div><p className="eyebrow">{providerLabel} · {gradeLabel}</p><h2>학습 진도 {percent}%</h2></div><strong>{learnedCount} / {targetCount}</strong></div><div className="progress-track" aria-label={"학습 진도 "+percent+"%"}><span style={{width:percent+"%"}} /></div><div className="progress-heading mastery-subprogress"><div><p className="eyebrow">완전히 익힌 한자</p><h3>숙달 진도 {masteryPercent}%</h3></div><strong>{masteredCount} / {targetCount}</strong></div><div className="progress-track" aria-label={"숙달 진도 "+masteryPercent+"%"}><span style={{width:masteryPercent+"%"}} /></div><div className="compact-plan"><span>학습 경험 <strong>{learnedCount}</strong></span><span>익숙해지는 중 <strong>{familiarCount}</strong></span><span>숙달 <strong>{masteredCount}</strong></span><span>숙달 필요 <strong>{needsMastery}</strong></span></div></section>
    <BottomNav active="home" friendAlertCount={friendAlertCount} />
  </main>;
}
