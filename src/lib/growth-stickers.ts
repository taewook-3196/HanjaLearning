export type GrowthStickerKind="first"|"stack"|"write"|"retry"|"master"|"week"|"streak3"|"streak7"|"streak14"|"streak30"|"learn50"|"learn100"|"learn250"|"write50"|"write100"|"recover5"|"recover20"|"accuracy80"|"quiz50"|"review10"|"levelUp"|"nightOwl"|"daily20"|"weeklyChallenge";
export type GrowthStickerDefinition={kind:GrowthStickerKind;name:string;detail:string;message:string;earned:boolean;progress:number;target:number};
export function growthStickerRules({learned,writtenCount,recovered,mastered,days,streak,accuracy=0,answered=0,reviewed=0,level=1,nightStudies=0,todayMinutes=0,weeklyGoal=false}:{learned:number;writtenCount:number;recovered:number;mastered:number;days:number;streak:number;accuracy?:number;answered?:number;reviewed?:number;level?:number;nightStudies?:number;todayMinutes?:number;weeklyGoal?:boolean}):GrowthStickerDefinition[]{
 return [
  {kind:"first",name:"첫걸음",earned:learned>=1,progress:learned,target:1,detail:"한자 1자 학습",message:"한자 여행의 첫걸음을 내디뎠어요!"},
  {kind:"stack",name:"차곡차곡",earned:learned>=20,progress:learned,target:20,detail:"한자 20자 학습",message:"배운 한자가 차곡차곡 쌓이고 있어요."},
  {kind:"learn50",name:"한자 탐험가",earned:learned>=50,progress:learned,target:50,detail:"한자 50자 학습",message:"벌써 50자를 탐험했어요!"},
  {kind:"learn100",name:"백자 돌파",earned:learned>=100,progress:learned,target:100,detail:"한자 100자 학습",message:"배운 한자가 100자를 넘었어요."},
  {kind:"learn250",name:"한자 수집가",earned:learned>=250,progress:learned,target:250,detail:"한자 250자 학습",message:"한자 250자를 차곡차곡 모았어요."},
  {kind:"write",name:"쓰기 시작",earned:writtenCount>=5,progress:writtenCount,target:5,detail:"5자 쓰기 연습",message:"눈으로만 보지 않고 직접 써 봤어요."},
  {kind:"write50",name:"또박또박",earned:writtenCount>=50,progress:writtenCount,target:50,detail:"50자 쓰기 연습",message:"손으로 익힌 한자가 50자가 되었어요."},
  {kind:"write100",name:"쓰기 고수",earned:writtenCount>=100,progress:writtenCount,target:100,detail:"100자 쓰기 연습",message:"100자를 직접 써 보며 익혔어요."},
  {kind:"retry",name:"다시 도전",earned:recovered>=1,progress:recovered,target:1,detail:"틀린 한자를 다시 맞히기",message:"틀려도 다시 도전하는 힘이 자라고 있어요."},
  {kind:"recover5",name:"칠전팔기",earned:recovered>=5,progress:recovered,target:5,detail:"틀린 한자 5자 극복",message:"헷갈리던 한자를 다시 익혔어요."},
  {kind:"recover20",name:"오답 정복",earned:recovered>=20,progress:recovered,target:20,detail:"틀린 한자 20자 극복",message:"실수를 실력으로 바꾸고 있어요."},
  {kind:"master",name:"숙달 시작",earned:mastered>=10,progress:mastered,target:10,detail:"10자 익숙해지기",message:"익숙한 한자가 하나둘 늘고 있어요."},
  {kind:"week",name:"꾸준한 한 주",earned:days>=5,progress:days,target:5,detail:"최근 7일 중 5일 학습",message:"꾸준함이 가장 멋진 실력이에요."},
  {kind:"streak3",name:"3일 새싹",earned:streak>=3,progress:streak,target:3,detail:"3일 연속 학습",message:"3일 연속으로 학습했어요."},
  {kind:"streak7",name:"7일 토끼",earned:streak>=7,progress:streak,target:7,detail:"7일 연속 학습",message:"한 주를 빠짐없이 달렸어요."},
  {kind:"streak14",name:"14일 여우",earned:streak>=14,progress:streak,target:14,detail:"14일 연속 학습",message:"두 주 동안 꾸준히 이어 왔어요."},
  {kind:"accuracy80",name:"정확한 도전",earned:answered>=10&&accuracy>=80,progress:answered>=10?accuracy:0,target:80,detail:"최근 7일 10문제 이상, 정답률 80%",message:"차근차근 정확하게 풀었어요!"},
  {kind:"quiz50",name:"문제 마스터",earned:answered>=50,progress:answered,target:50,detail:"최근 7일 50문제 풀기",message:"50문제를 풀며 실력을 쌓았어요!"},
  {kind:"review10",name:"복습의 힘",earned:reviewed>=10,progress:reviewed,target:10,detail:"최근 7일 복습 10회",message:"복습으로 실력을 단단하게 만들었어요!"},
  {kind:"levelUp",name:"레벨 업",earned:level>=5,progress:level,target:5,detail:"레벨 5 달성",message:"한 단계 더 성장했어요!"},
  {kind:"nightOwl",name:"밤에도 열공",earned:nightStudies>=1,progress:nightStudies,target:1,detail:"밤 9시 이후 학습 완료",message:"늦은 시간에도 열심히 공부했어요!"},
  {kind:"daily20",name:"시간의 달인",earned:todayMinutes>=20,progress:todayMinutes,target:20,detail:"오늘 20분 이상 학습",message:"오늘도 시간을 알차게 사용했어요!"},
  {kind:"weeklyChallenge",name:"주간 챌린지",earned:weeklyGoal,progress:weeklyGoal?1:0,target:1,detail:"최근 7일 중 5일 학습",message:"이번 주의 학습 목표를 달성했어요!"},
  {kind:"streak30",name:"30일 호랑이",earned:streak>=30,progress:streak,target:30,detail:"30일 연속 학습",message:"한 달의 꾸준함이 큰 힘이 되었어요."}
 ];
}
export function nextGrowthSticker(rules:GrowthStickerDefinition[]){return rules.filter(x=>!x.earned).sort((a,b)=>Math.max(0,a.target-a.progress)-Math.max(0,b.target-b.progress))[0]??null;}
