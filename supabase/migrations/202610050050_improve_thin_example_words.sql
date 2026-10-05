-- Improve thin/awkward example-word coverage for through-grade-5 Hanja.
-- Prefer familiar elementary vocabulary. Higher-grade component Hanja are allowed when useful;
-- the learning UI shows each component grade.
with words(word,reading,meaning,child_explanation,chars) as (
 values
 ('애견','애견','사랑하며 기르는 개','사랑하며 아끼고 기르는 개',array['愛','犬']),
 ('우유','우유','소의 젖','소에서 얻어 마시는 젖',array['牛','乳']),
 ('상경','상경','서울로 올라감','다른 지역에서 서울로 가는 일',array['上','京']),
 ('과도','과도','과일을 깎는 작은 칼','과일 껍질을 벗기거나 자를 때 쓰는 작은 칼',array['果','刀'])
)
insert into public.hanja_words(word,reading,meaning,child_explanation,content_status,source_note)
select word,reading,meaning,child_explanation,'PUBLISHED','5급 예시어 품질보강 · 사전 표제어 검증 · 앱 자체 쉬운 뜻풀이 · 2026-10-05'
from words
on conflict(word,reading,meaning) do update set child_explanation=excluded.child_explanation,content_status='PUBLISHED',source_note=excluded.source_note;

with words(word,reading,meaning,chars) as (
 values
 ('애견','애견','사랑하며 기르는 개',array['愛','犬']),
 ('우유','우유','소의 젖',array['牛','乳']),
 ('상경','상경','서울로 올라감',array['上','京']),
 ('과도','과도','과일을 깎는 작은 칼',array['果','刀'])
)
insert into public.hanja_word_map(word_id,hanja_id,position)
select hw.id,h.id,u.ord::integer
from words w
join public.hanja_words hw on hw.word=w.word and hw.reading=w.reading and hw.meaning=w.meaning
cross join lateral unnest(w.chars) with ordinality as u(ch,ord)
join public.hanja h on h.character=u.ch
on conflict do nothing;

do $body$
declare v_bad integer;
begin
 select count(*) into v_bad from public.hanja_words w
 where w.source_note='5급 예시어 품질보강 · 사전 표제어 검증 · 앱 자체 쉬운 뜻풀이 · 2026-10-05'
 and (select count(*) from public.hanja_word_map m where m.word_id=w.id)<>char_length(w.word);
 if v_bad<>0 then raise exception 'Quality example mapping incomplete: %',v_bad;end if;
end $body$;
