-- Replace ambiguous coverage-only words with clearer elementary examples.
-- Keep old rows for migration history, but hide them from learning surfaces.
update public.hanja_words
set content_status='DRAFT',
    source_note=coalesce(source_note,'') || ' · 2026-10-05 품질검수: 학습 예시에서 제외'
where (word,reading,meaning) in (
 ('치수','치수','길이의 크기'),
 ('도공','도공','칼을 만드는 장인'),
 ('미식','미식','맛있는 음식을 즐겨 먹음')
);

with words(word,reading,meaning,child_explanation,chars) as (
 values
 ('촌수','촌수','친족 관계의 가까운 정도','가족이나 친척 사이가 얼마나 가까운지를 나타내는 수',array['寸','數']),
 ('도검','도검','칼과 검','사람이 쓰는 칼과 검을 함께 이르는 말',array['刀','劍']),
 ('백미','백미','흰쌀','겉껍질과 겨를 벗겨 하얗게 만든 쌀',array['白','米'])
)
insert into public.hanja_words(word,reading,meaning,child_explanation,content_status,source_note)
select word,reading,meaning,child_explanation,'PUBLISHED','5급 예시어 품질검수 교체 · 앱 자체 쉬운 뜻풀이 · 2026-10-05'
from words
on conflict(word,reading,meaning) do update set child_explanation=excluded.child_explanation,content_status='PUBLISHED',source_note=excluded.source_note;

with words(word,reading,meaning,chars) as (
 values
 ('촌수','촌수','친족 관계의 가까운 정도',array['寸','數']),
 ('도검','도검','칼과 검',array['刀','劍']),
 ('백미','백미','흰쌀',array['白','米'])
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
 select count(*) into v_bad
 from public.hanja_words w
 where w.source_note='5급 예시어 품질검수 교체 · 앱 자체 쉬운 뜻풀이 · 2026-10-05'
 and (select count(*) from public.hanja_word_map m where m.word_id=w.id)<>char_length(w.word);
 if v_bad<>0 then raise exception 'Replacement word mapping incomplete: %',v_bad;end if;
end $body$;
