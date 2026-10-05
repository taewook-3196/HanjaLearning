-- Seed app-authored culture/etiquette questions by exact exam grade.
-- These are original questions based on ordinary school/social etiquette principles.
-- No past-paper prompt, sentence, or answer choice is copied.

with provider as (
 select id from public.exam_providers where code='DAEHAN' limit 1
),
items(grade_code,topic,prompt_summary,choice_a,choice_b,choice_c,choice_d,correct_choice,correct_explanation) as (
 values
 ('6','인사 예절','어른을 만나 인사할 때 가장 알맞은 태도는 무엇일까요?','상대방을 바라보며 공손하게 인사한다','휴대전화를 보면서 고개만 끄덕인다','큰 소리로 장난치며 지나간다','상대방의 말을 끊고 먼저 이야기한다',1,'인사는 상대를 존중하는 마음을 담아 공손하게 하는 것이 기본입니다.'),
 ('PRE5','대화 예절','친구가 이야기하고 있을 때 가장 알맞은 태도는 무엇일까요?','끝까지 듣고 차례가 오면 말한다','중간에 계속 말을 끊는다','다른 곳을 보며 듣지 않는다','친구의 말을 큰 소리로 흉내 낸다',1,'상대의 말을 끝까지 듣고 자신의 차례에 말하는 것은 기본적인 대화 예절입니다.'),
 ('5','공공장소 예절','도서관에서 가장 알맞은 행동은 무엇일까요?','필요한 대화는 작은 목소리로 한다','친구와 큰 소리로 뛰어다닌다','책을 읽은 뒤 아무 곳에 둔다','휴대전화 소리를 크게 켜 둔다',1,'도서관에서는 다른 이용자를 배려해 조용히 이용해야 합니다.'),
 ('5','식사 예절','여럿이 함께 식사할 때 알맞은 행동은 무엇일까요?','함께 먹는 사람을 배려하며 식사한다','음식을 가지고 장난한다','다른 사람의 음식을 허락 없이 가져간다','식사 중 계속 큰 소리로 떠든다',1,'함께 식사할 때에는 다른 사람을 배려하고 단정하게 행동하는 것이 좋습니다.'),
 ('PRE4','방문 예절','다른 사람의 집을 방문할 때 알맞은 행동은 무엇일까요?','미리 약속하고 정한 시간에 방문한다','연락 없이 늦은 밤에 찾아간다','집 안 물건을 허락 없이 사용한다','문을 열자마자 먼저 뛰어 들어간다',1,'방문 전에는 약속을 정하고 상대방의 생활을 배려해야 합니다.'),
 ('PRE4','전화 예절','전화를 잘못 걸었을 때 알맞은 행동은 무엇일까요?','잘못 걸었다고 말하고 정중히 사과한다','아무 말 없이 바로 끊는다','상대방에게 화를 낸다','같은 번호로 계속 장난 전화를 한다',1,'잘못 전화했을 때에는 간단히 사과하고 통화를 마치는 것이 예의입니다.'),
 ('4','공공질서','줄을 서서 기다리는 장소에서 알맞은 행동은 무엇일까요?','자기 차례를 지키며 기다린다','아는 사람 앞으로 끼어든다','줄 밖에서 새치기한다','뒤 사람을 밀어 자리를 만든다',1,'여럿이 이용하는 곳에서는 정해진 순서와 차례를 지켜야 합니다.'),
 ('4','배려','대중교통에서 도움이 필요한 사람이 보일 때 알맞은 태도는 무엇일까요?','상황을 살피고 필요하면 자리를 양보한다','일부러 보지 않은 척한다','통로를 막고 서 있는다','큰 소리로 놀린다',1,'공공장소에서는 주변을 살피고 도움이 필요한 사람을 배려하는 태도가 중요합니다.'),
 ('PRE3','온라인 예절','온라인에서 다른 사람에게 글을 남길 때 알맞은 태도는 무엇일까요?','상대가 읽어도 불쾌하지 않도록 예의를 지킨다','확인하지 않은 소문을 퍼뜨린다','친구의 개인정보를 허락 없이 올린다','화가 나면 욕설을 그대로 쓴다',1,'온라인에서도 상대를 존중하고 개인정보와 사실 여부를 신중하게 다뤄야 합니다.'),
 ('PRE3','약속 예절','약속 시간에 늦을 것 같을 때 가장 알맞은 행동은 무엇일까요?','가능한 빨리 상대에게 알리고 사과한다','연락하지 않고 상대가 기다리게 한다','도착한 뒤에도 아무 설명을 하지 않는다','상대방 탓이라고 말한다',1,'늦을 때에는 가능한 빨리 상황을 알리고 양해를 구하는 것이 예의입니다.'),
 ('3','토론 예절','의견이 다른 사람과 이야기할 때 알맞은 태도는 무엇일까요?','상대 의견을 듣고 근거를 들어 내 생각을 말한다','상대가 말하지 못하게 계속 끼어든다','의견이 다르다는 이유로 비난한다','목소리가 큰 사람이 맞다고 정한다',1,'의견이 달라도 상대의 말을 듣고 근거를 중심으로 이야기해야 합니다.'),
 ('3','공동체 예절','공동으로 사용하는 물건을 이용한 뒤 알맞은 행동은 무엇일까요?','다음 사람이 쓸 수 있도록 정리해 둔다','사용한 자리에 그대로 버려 둔다','고장 나도 아무에게도 알리지 않는다','자기 것처럼 집으로 가져간다',1,'공동 물건은 다음 사람도 사용할 수 있도록 바르게 사용하고 정리해야 합니다.')
)
insert into public.exam_culture_items(provider_id,grade_id,topic,prompt_summary,choice_a,choice_b,choice_c,choice_d,correct_choice,correct_explanation,content_status,source_note)
select p.id,g.id,i.topic,i.prompt_summary,i.choice_a,i.choice_b,i.choice_c,i.choice_d,i.correct_choice,i.correct_explanation,'PUBLISHED','앱 자체 제작 문화·예절 문항 · 기출문제 비복제 · 2026-10-05'
from items i
cross join provider p
join public.exam_grades g on g.provider_id=p.id and g.grade_code=i.grade_code
where not exists (
 select 1 from public.exam_culture_items e
 where e.provider_id=p.id and e.grade_id=g.id and e.prompt_summary=i.prompt_summary
);

do $body$
declare v_total integer; v_bad integer; v_missing integer;
begin
 select count(*) into v_total from public.exam_culture_items
 where source_note='앱 자체 제작 문화·예절 문항 · 기출문제 비복제 · 2026-10-05';
 if v_total<>12 then raise exception 'Expected 12 culture/etiquette items, got %',v_total; end if;

 select count(*) into v_bad from public.exam_culture_items
 where source_note='앱 자체 제작 문화·예절 문항 · 기출문제 비복제 · 2026-10-05'
   and (correct_choice not between 1 and 4
        or choice_a=choice_b or choice_a=choice_c or choice_a=choice_d
        or choice_b=choice_c or choice_b=choice_d or choice_c=choice_d);
 if v_bad<>0 then raise exception 'Invalid culture/etiquette choices: %',v_bad; end if;

 with required(grade_code,min_count) as (
  values ('6',1),('PRE5',1),('5',2),('PRE4',2),('4',2),('PRE3',1),('3',2)
 )
 select count(*) into v_missing
 from required r
 where (select count(*) from public.exam_culture_items e
        join public.exam_grades g on g.id=e.grade_id
        where g.grade_code=r.grade_code and e.content_status='PUBLISHED')<r.min_count;
 if v_missing<>0 then raise exception 'Culture/etiquette grade coverage missing for % grades',v_missing; end if;
end $body$;
