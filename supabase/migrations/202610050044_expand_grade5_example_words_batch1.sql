-- Expand child-friendly example words for Hanja learned through 대한검정회 5급.
-- Vocabulary usefulness takes priority over keeping every component at or below the learner's grade.
-- Component grades are rendered dynamically from grade_hanja in the learning UI.
-- Meanings are concise app-authored learner explanations; no past-paper wording is copied.

with words(word, reading, meaning, child_explanation, chars) as (
 values
 ('금요일','금요일','한 주의 다섯째 평일','목요일 다음, 토요일 전의 날',array['金','曜','日']),
 ('남자','남자','남성인 사람','남자인 사람',array['男','子']),
 ('여자','여자','여성인 사람','여자인 사람',array['女','子']),
 ('동방','동방','동쪽 방향','동쪽 방향을 이르는 말',array['東','方']),
 ('목요일','목요일','한 주의 넷째 평일','수요일 다음, 금요일 전의 날',array['木','曜','日']),
 ('북방','북방','북쪽 지방이나 방향','북쪽 방향이나 지역을 이르는 말',array['北','方']),
 ('서부','서부','서쪽 부분','어떤 지역의 서쪽 부분',array['西','部']),
 ('수요일','수요일','한 주의 셋째 평일','화요일 다음, 목요일 전의 날',array['水','曜','日']),
 ('십월','시월','한 해의 열 번째 달','가을에 있는 열 번째 달',array['十','月']),
 ('오전','오전','정오보다 앞선 시간','아침부터 낮 열두 시 전까지의 시간',array['午','前']),
 ('월요일','월요일','한 주의 첫 평일','일요일 다음에 오는 날',array['月','曜','日']),
 ('일요일','일요일','토요일 다음 날','한 주를 이루는 요일 가운데 하나',array['日','曜','日']),
 ('인간','인간','사람','사람을 가리키는 말',array['人','間']),
 ('토요일','토요일','금요일 다음 날','주말에 해당하는 날',array['土','曜','日']),
 ('화요일','화요일','한 주의 둘째 평일','월요일 다음, 수요일 전의 날',array['火','曜','日']),
 ('강물','강물','강에 흐르는 물','강을 따라 흐르는 물',array['江','水']),
 ('입구','입구','들어가는 곳','건물이나 장소로 들어가는 곳',array['入','口']),
 ('내부','내부','안쪽 부분','어떤 것의 안쪽',array['內','部']),
 ('학년','학년','학교에서 나눈 교육 단계','학교에서 같은 단계로 공부하는 한 해의 단위',array['學','年']),
 ('대학','대학','고등교육을 하는 학교','고등학교 다음 단계에서 공부하는 학교',array['大','學']),
 ('목표','목표','이루려고 하는 대상','앞으로 이루고자 정한 것',array['目','標']),
 ('백색','백색','흰색','하얀 색',array['白','色']),
 ('등산','등산','산에 오름','운동이나 구경을 위해 산에 오르는 일',array['登','山']),
 ('상하','상하','위와 아래','위쪽과 아래쪽',array['上','下']),
 ('소형','소형','작은 크기','크기가 작은 것',array['小','形']),
 ('악수','악수','서로 손을 잡아 인사함','인사할 때 서로 손을 잡는 일',array['握','手']),
 ('외국','외국','자기 나라가 아닌 다른 나라','우리나라가 아닌 다른 나라',array['外','國']),
 ('우측','우측','오른쪽','오른쪽 방향이나 부분',array['右','側']),
 ('입학','입학','학교에 들어가 학생이 됨','새 학교에 들어가 공부를 시작하는 일',array['入','學']),
 ('족구','족구','발로 공을 넘기는 운동','발을 주로 사용해 공을 넘기는 운동',array['足','球']),
 ('좌측','좌측','왼쪽','왼쪽 방향이나 부분',array['左','側']),
 ('중앙','중앙','한가운데','가운데 부분',array['中','央']),
 ('청색','청색','푸른색','파란빛을 띠는 색',array['靑','色']),
 ('출구','출구','나가는 곳','건물이나 장소에서 밖으로 나가는 곳',array['出','口']),
 ('하교','하교','학교 수업을 마치고 돌아감','수업을 마치고 학교에서 집으로 돌아가는 일',array['下','校']),
 ('성명','성명','성과 이름','사람의 성과 이름을 함께 이르는 말',array['姓','名']),
 ('백일','백일','백 날','날짜를 세어 백 번째가 되는 날',array['百','日']),
 ('생일','생일','태어난 날을 해마다 기념하는 날','자기가 태어난 날',array['生','日']),
 ('선생','선생','학생을 가르치는 사람을 높여 이르는 말','학생을 가르쳐 주는 분',array['先','生']),
 ('심장','심장','피를 온몸으로 보내는 기관','몸속에서 피를 온몸으로 보내는 중요한 기관',array['心','臟']),
 ('지구','지구','우리가 사는 행성','사람과 여러 생물이 살아가는 행성',array['地','球']),
 ('천국','천국','아주 평화롭고 행복한 곳을 비유하는 말','매우 평화롭고 행복한 곳을 이르는 말',array['天','國']),
 ('천원','천원','천 원의 돈','우리나라 돈 천 원',array['千','元']),
 ('공부','공부','학문이나 기술을 배워 익힘','배우고 익히는 일',array['工','夫']),
 ('금일','금일','오늘','오늘을 뜻하는 말',array['今','日']),
 ('동일','동일','서로 같음','두 가지 이상이 서로 같음',array['同','一']),
 ('능력','능력','일을 해낼 수 있는 힘','어떤 일을 할 수 있는 힘',array['能','力']),
 ('독립','독립','남에게 기대지 않고 스스로 섬','다른 것에 기대지 않고 스스로 서는 것',array['獨','立']),
 ('문화','문화','사람들이 함께 만들어 온 생활 방식과 가치','사람들이 살아가며 만들어 온 생활 모습과 생각',array['文','化']),
 ('방향','방향','향하거나 나아가는 쪽','어느 쪽을 향하는지 나타내는 것',array['方','向']),
 ('본인','본인','바로 그 사람 자신','말하고 있는 바로 그 사람 자신',array['本','人']),
 ('부부','부부','남편과 아내','결혼한 두 사람',array['夫','婦']),
 ('석양','석양','저녁때의 햇빛 또는 지는 해','저녁에 지는 해와 그 빛',array['夕','陽']),
 ('세계','세계','지구 전체 또는 모든 나라','지구의 여러 나라와 지역 전체',array['世','界']),
 ('소수','소수','적은 수','수가 많지 않은 것',array['少','數']),
 ('식사','식사','끼니로 음식을 먹음','밥이나 음식을 먹는 일',array['食','事']),
 ('의복','의복','몸에 입는 옷','사람이 몸에 입는 옷',array['衣','服']),
 ('자신','자신','자기 자신','바로 자기',array['自','身']),
 ('정답','정답','옳은 답','문제에 맞는 바른 답',array['正','答']),
 ('주인','주인','물건이나 집 등의 임자','어떤 물건이나 장소를 가진 사람',array['主','人']),
 ('휴일','휴일','일이나 수업을 쉬는 날','학교나 일을 쉬는 날',array['休','日'])
),
upserted as (
 insert into public.hanja_words(word,reading,meaning,child_explanation,content_status,source_note)
 select word,reading,meaning,child_explanation,'PUBLISHED',
        '초등 학습용 대표 어휘 1차 · 앱 자체 쉬운 뜻풀이 · 2026-10-05'
 from words
 on conflict(word,reading,meaning) do update set
   child_explanation=excluded.child_explanation,
   content_status='PUBLISHED',
   source_note=excluded.source_note
 returning id
)
insert into public.hanja_word_map(word_id,hanja_id,position)
select hw.id,h.id,u.ord::integer
from words w
join public.hanja_words hw on hw.word=w.word and hw.reading=w.reading and hw.meaning=w.meaning
cross join lateral unnest(w.chars) with ordinality as u(ch,ord)
join public.hanja h on h.character=u.ch
on conflict do nothing;

do $body$
declare v_words integer; v_bad integer;
begin
 select count(*) into v_words from public.hanja_words
 where source_note='초등 학습용 대표 어휘 1차 · 앱 자체 쉬운 뜻풀이 · 2026-10-05';
 if v_words<>61 then raise exception 'Expected 61 batch-1 example words, got %',v_words; end if;

 select count(*) into v_bad
 from public.hanja_words w
 where w.source_note='초등 학습용 대표 어휘 1차 · 앱 자체 쉬운 뜻풀이 · 2026-10-05'
   and (select count(*) from public.hanja_word_map m where m.word_id=w.id)<>cardinality(
     (select x.chars from words x where x.word=w.word and x.reading=w.reading and x.meaning=w.meaning)
   );
 if v_bad<>0 then raise exception 'Batch-1 example word mapping integrity failure: %',v_bad; end if;
end $body$;
