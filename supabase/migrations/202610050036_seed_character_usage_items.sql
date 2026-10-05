-- Seed original character-usage questions from already verified word mappings.
-- Correct answers are derived from published hanja_words + hanja_word_map data.

with specs(character,prompt,correct_word,wrong1,wrong2,wrong3) as (
 values
 ('學','學이 실제로 쓰인 단어를 고르세요.','학교','국민','전기','독서'),
 ('國','國이 실제로 쓰인 단어를 고르세요.','국민','학교','소년','화산'),
 ('年','年이 실제로 쓰인 단어를 고르세요.','소년','한국','출입','전기'),
 ('讀','讀이 실제로 쓰인 단어를 고르세요.','독서','청년','국민','산수'),
 ('電','電이 실제로 쓰인 단어를 고르세요.','전기','학생','남북','화산'),
 ('山','山이 실제로 쓰인 단어를 고르세요.','화산','학교','청년','국민'),
 ('出','出이 실제로 쓰인 단어를 고르세요.','출입','전기','소년','한국'),
 ('人','人이 실제로 쓰인 단어를 고르세요.','인구','독서','남북','전기')
),
validated as (
 select s.*,h.id as hanja_id,w.id as correct_word_id
 from specs s
 join public.hanja h on h.character=s.character and h.content_status='PUBLISHED'
 join public.hanja_words w on w.word=s.correct_word and w.content_status='PUBLISHED'
 where exists (
  select 1 from public.hanja_word_map m
  where m.word_id=w.id and m.hanja_id=h.id
 )
 and not exists (
  select 1
  from public.hanja_words dw
  join public.hanja_word_map dm on dm.word_id=dw.id and dm.hanja_id=h.id
  where dw.word in (s.wrong1,s.wrong2,s.wrong3)
 )
)
insert into public.hanja_usage_items(hanja_id,prompt,choice_a,choice_b,choice_c,choice_d,correct_choice,content_status,source_note)
select hanja_id,prompt,correct_word,wrong1,wrong2,wrong3,1,'PUBLISHED',
 '검증된 hanja_words/hanja_word_map 기반 앱 자체 제작 용례 문항 · 2026-10-05'
from validated v
where not exists (
 select 1 from public.hanja_usage_items u
 where u.hanja_id=v.hanja_id and u.prompt=v.prompt
);

do $body$
declare v_count integer; v_bad integer;
begin
 select count(*) into v_count
 from public.hanja_usage_items
 where source_note='검증된 hanja_words/hanja_word_map 기반 앱 자체 제작 용례 문항 · 2026-10-05';
 if v_count<>8 then raise exception 'Expected 8 character-usage items, got %',v_count; end if;

 select count(*) into v_bad
 from public.hanja_usage_items u
 join public.hanja h on h.id=u.hanja_id
 where u.source_note='검증된 hanja_words/hanja_word_map 기반 앱 자체 제작 용례 문항 · 2026-10-05'
 and not exists (
   select 1 from public.hanja_words w
   join public.hanja_word_map m on m.word_id=w.id and m.hanja_id=u.hanja_id
   where w.word=u.choice_a and w.content_status='PUBLISHED'
 );
 if v_bad<>0 then raise exception 'Usage correct-answer mapping failure: %',v_bad; end if;
end $body$;
