-- Curated starter example words for 대한검정회 8급 Hanja.
-- Word forms/meanings were cross-checked against National Institute of Korean Language dictionary resources.
-- Keep this seed intentionally small and high-confidence; expand only after review.

with words(word, reading, meaning, child_explanation, chars) as (
  values
    ('부모','부모','아버지와 어머니를 아울러 이르는 말','아버지와 어머니를 함께 이르는 말',array['父','母']),
    ('형제','형제','형과 아우 또는 형제자매를 아울러 이르는 말','형과 동생처럼 한 부모에게서 태어난 사이',array['兄','弟']),
    ('자녀','자녀','아들과 딸을 아울러 이르는 말','아들과 딸을 함께 이르는 말',array['子','女']),
    ('남녀','남녀','남자와 여자를 아울러 이르는 말','남자와 여자를 함께 이르는 말',array['男','女']),
    ('동서남북','동서남북','동쪽ㆍ서쪽ㆍ남쪽ㆍ북쪽 또는 모든 방향','동쪽, 서쪽, 남쪽, 북쪽의 네 방향',array['東','西','南','北']),
    ('금요일','금요일','목요일 다음 날인 요일','한 주의 금요일',array['金','曜','日']),
    ('화요일','화요일','월요일 다음 날인 요일','한 주의 화요일',array['火','曜','日']),
    ('목요일','목요일','수요일 다음 날인 요일','한 주의 목요일',array['木','曜','日']),
    ('토요일','토요일','금요일 다음 날인 요일','한 주의 토요일',array['土','曜','日'])
),
ins as (
  insert into public.hanja_words(word,reading,meaning,child_explanation,content_status,source_note)
  select word,reading,meaning,child_explanation,'PUBLISHED',
         '국립국어원 사전 계열 자료 교차검증 · 2026-10-04'
  from words
  on conflict(word,reading,meaning) do update set
    child_explanation=excluded.child_explanation,
    content_status='PUBLISHED',
    source_note=excluded.source_note
  returning id,word
)
insert into public.hanja_word_map(word_id,hanja_id,position)
select hw.id,h.id,u.ord::integer
from words w
join public.hanja_words hw on hw.word=w.word and hw.reading=w.reading and hw.meaning=w.meaning
cross join lateral unnest(w.chars) with ordinality as u(ch,ord)
join public.hanja h on h.character=u.ch
on conflict do nothing;

do $$
declare v_bad integer;
begin
  select count(*) into v_bad
  from public.hanja_words hw
  where hw.source_note='국립국어원 사전 계열 자료 교차검증 · 2026-10-04'
    and not exists (select 1 from public.hanja_word_map hwm where hwm.word_id=hw.id);
  if v_bad <> 0 then raise exception 'Example word mapping integrity failure: %',v_bad; end if;
end $$;
