-- Expand original word/context content used by official-style mock exams.
-- Lexical entries use ordinary dictionary meanings; all example sentences below are app-original.
-- No past-paper question, sentence, or answer choice is copied here.

with words(word,reading,meaning,child_explanation,chars) as (
 values
 ('동서','동서','동쪽과 서쪽','동쪽과 서쪽',array['東','西']),
 ('남북','남북','남쪽과 북쪽','남쪽과 북쪽',array['南','北']),
 ('산수','산수','산과 물','산과 물을 함께 이르는 말',array['山','水']),
 ('화산','화산','땅속의 물질이 지표로 분출하는 산','뜨거운 물질이 땅속에서 솟아 나오는 산',array['火','山']),
 ('인구','인구','일정한 지역에 사는 사람의 수','어떤 지역에 살고 있는 사람의 수',array['人','口']),
 ('대문','대문','집의 큰 출입문','집 바깥쪽에 있는 큰 문',array['大','門']),
 ('소년','소년','아직 어린 나이의 사람','어린 나이의 사람',array['少','年']),
 ('청년','청년','젊은 나이의 사람','젊은 나이의 사람',array['靑','年']),
 ('천지','천지','하늘과 땅','하늘과 땅을 함께 이르는 말',array['天','地']),
 ('우수','우수','오른손','오른쪽 손',array['右','手']),
 ('좌우','좌우','왼쪽과 오른쪽','왼쪽과 오른쪽',array['左','右']),
 ('출입','출입','나가고 들어옴','밖으로 나가거나 안으로 들어오는 일',array['出','入']),
 ('명마','명마','이름난 좋은 말','널리 알려진 좋은 말',array['名','馬']),
 ('어류','어류','물고기 종류를 통틀어 이르는 말','물고기들을 한데 이르는 말',array['魚','類']),
 ('국민','국민','한 나라를 이루는 사람들','한 나라의 구성원인 사람들',array['國','民']),
 ('한국','한국','대한민국을 이르는 말','우리가 사는 대한민국',array['韓','國']),
 ('한자','한자','한자 문화권에서 쓰여 온 문자','뜻을 나타내는 글자인 한자',array['漢','字']),
 ('학교','학교','학생을 가르치는 교육 기관','학생들이 배우는 곳',array['學','校']),
 ('학생','학생','학교에서 배우는 사람','학교에서 공부하는 사람',array['學','生']),
 ('독서','독서','책을 읽음','책을 읽는 일',array['讀','書']),
 ('시간','시간','어떤 시각에서 다른 시각까지의 동안','일이 이어지는 동안이나 때',array['時','間']),
 ('농촌','농촌','농업을 주로 하는 마을','농사를 주로 짓는 마을',array['農','村']),
 ('전기','전기','전하의 이동과 관련된 에너지 현상','불을 켜거나 기계를 움직이는 데 쓰이는 에너지',array['電','氣'])
),
upserted as (
 insert into public.hanja_words(word,reading,meaning,child_explanation,content_status,source_note)
 select word,reading,meaning,child_explanation,'PUBLISHED',
        '교육용 한자어 검토 · 앱 자체 뜻풀이 · 2026-10-05'
 from words
 on conflict(word,reading,meaning) do update set
   child_explanation=excluded.child_explanation,
   content_status='PUBLISHED',
   source_note=excluded.source_note
 returning id,word,reading,meaning
)
insert into public.hanja_word_map(word_id,hanja_id,position)
select hw.id,h.id,u.ord::integer
from words w
join upserted hw on hw.word=w.word and hw.reading=w.reading and hw.meaning=w.meaning
cross join lateral unnest(w.chars) with ordinality as u(ch,ord)
join public.hanja h on h.character=u.ch
on conflict do nothing;

-- Every newly seeded word must have a complete character mapping.
do $body$
declare v_words integer; v_bad integer;
begin
 select count(*) into v_words
 from public.hanja_words
 where source_note='교육용 한자어 검토 · 앱 자체 뜻풀이 · 2026-10-05';
 if v_words<>23 then raise exception 'Expected 23 expanded words, got %',v_words; end if;

 select count(*) into v_bad
 from public.hanja_words w
 where w.source_note='교육용 한자어 검토 · 앱 자체 뜻풀이 · 2026-10-05'
   and (select count(*) from public.hanja_word_map m where m.word_id=w.id)<>char_length(w.word);
 if v_bad<>0 then raise exception 'Expanded word mapping integrity failure: %',v_bad; end if;
end $body$;

with contexts(word,sentence) as (
 values
 ('부모','부모와 함께 주말 계획을 세웠다.'),
 ('형제','두 형제가 서로 도우며 방을 정리했다.'),
 ('자녀','부모는 자녀의 이야기를 차분히 들었다.'),
 ('남녀','남녀 모두 같은 규칙을 지켜야 한다.'),
 ('동서','해는 동서 방향을 살피는 좋은 기준이 된다.'),
 ('남북','지도에서 남북 방향을 먼저 확인했다.'),
 ('산수','옛 그림에는 아름다운 산수가 자주 등장한다.'),
 ('화산','과학 시간에 화산이 만들어지는 과정을 배웠다.'),
 ('인구','이 도시는 최근 인구가 늘었다.'),
 ('대문','집에 도착하니 대문이 활짝 열려 있었다.'),
 ('소년','한 소년이 길을 잃은 강아지를 도와주었다.'),
 ('청년','그 청년은 마을 행사에서 봉사했다.'),
 ('천지','비가 그치자 천지가 맑아 보였다.'),
 ('좌우','길을 건너기 전에 좌우를 잘 살폈다.'),
 ('출입','도서관 출입 시간은 안내문에서 확인할 수 있다.'),
 ('국민','국민은 법과 질서를 함께 지켜 나간다.'),
 ('한국','한국의 사계절은 모습이 뚜렷하다.'),
 ('한자','오늘은 뜻이 비슷한 한자를 함께 공부했다.'),
 ('학교','아침에 학교에 도착해 친구와 인사했다.'),
 ('학생','학생들이 차례를 지켜 교실로 들어갔다.'),
 ('독서','매일 조금씩 독서하는 습관을 들였다.'),
 ('시간','약속 시간을 지키기 위해 일찍 출발했다.'),
 ('농촌','가을 농촌에서는 수확하는 모습을 볼 수 있다.'),
 ('전기','사용하지 않는 방의 전기를 껐다.')
)
insert into public.hanja_word_contexts(word_id,sentence,blank_text,content_status,source_note)
select w.id,c.sentence,c.word,'PUBLISHED','앱 자체 제작 문장 · 기출문제 비복제 · 2026-10-05'
from contexts c
join public.hanja_words w on w.word=c.word and w.content_status='PUBLISHED'
where not exists (
 select 1 from public.hanja_word_contexts x
 where x.word_id=w.id and x.sentence=c.sentence
);

-- Context rows are valid only when the exact target word occurs in the sentence.
do $body$
declare v_bad integer;
begin
 select count(*) into v_bad
 from public.hanja_word_contexts
 where source_note='앱 자체 제작 문장 · 기출문제 비복제 · 2026-10-05'
   and (blank_text='' or position(blank_text in sentence)=0);
 if v_bad<>0 then raise exception 'Expanded context integrity failure: %',v_bad; end if;
end $body$;
