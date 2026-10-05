-- Complete representative example-word coverage for the remaining DAEHAN grade-5 Hanja.
with words(word,reading,meaning,child_explanation,chars) as (
 values
 ('남방','남방','남쪽 방향이나 지역','남쪽 방향이나 지역을 이르는 말',array['南','方']),
 ('부모','부모','아버지와 어머니','아버지와 어머니를 함께 이르는 말',array['父','母']),
 ('형제','형제','형과 아우','형과 아우를 함께 이르는 말',array['兄','弟']),
 ('좌우','좌우','왼쪽과 오른쪽','왼쪽과 오른쪽을 함께 이르는 말',array['左','右']),
 ('중심','중심','가운데가 되는 곳이나 중요한 부분','가운데가 되거나 가장 중요한 부분',array['中','心'])
)
insert into public.hanja_words(word,reading,meaning,child_explanation,content_status,source_note)
select word,reading,meaning,child_explanation,'PUBLISHED','5급 예시어 최종 커버리지 보강 · 앱 자체 쉬운 뜻풀이 · 2026-10-05'
from words
on conflict(word,reading,meaning) do update set child_explanation=excluded.child_explanation,content_status='PUBLISHED',source_note=excluded.source_note;

with words(word,reading,meaning,chars) as (
 values
 ('남방','남방','남쪽 방향이나 지역',array['南','方']),
 ('부모','부모','아버지와 어머니',array['父','母']),
 ('형제','형제','형과 아우',array['兄','弟']),
 ('좌우','좌우','왼쪽과 오른쪽',array['左','右']),
 ('중심','중심','가운데가 되는 곳이나 중요한 부분',array['中','心'])
)
insert into public.hanja_word_map(word_id,hanja_id,position)
select hw.id,h.id,u.ord::integer
from words w
join public.hanja_words hw on hw.word=w.word and hw.reading=w.reading and hw.meaning=w.meaning
cross join lateral unnest(w.chars) with ordinality as u(ch,ord)
join public.hanja h on h.character=u.ch
on conflict do nothing;

do $body$
declare v_uncovered integer;
begin
 select count(*) into v_uncovered
 from public.grade_hanja gh
 join public.exam_grades eg on eg.id=gh.grade_id
 join public.exam_providers ep on ep.id=eg.provider_id
 where ep.code='DAEHAN' and eg.code='5'
 and not exists(
   select 1 from public.hanja_word_map hwm
   join public.hanja_words hw on hw.id=hwm.word_id
   where hwm.hanja_id=gh.hanja_id and hw.content_status='PUBLISHED'
 );
 if v_uncovered<>0 then raise exception 'Grade-5 Hanja still lack example words: %',v_uncovered; end if;
end $body$;
