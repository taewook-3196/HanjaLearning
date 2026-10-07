-- Replace coverage-only vocabulary with words children encounter more often.
-- Higher-grade component Hanja are allowed; the UI displays each component's grade.
update public.hanja_words
set content_status='DRAFT',
    source_note=coalesce(source_note,'') || ' · 2026-10-05 품질검수: 더 친숙한 예시어로 교체'
where (word,reading,meaning) in (
 ('견공','견공','개를 높여 이르는 말'),
 ('우육','우육','소고기')
);

with words(word,reading,meaning,child_explanation,chars) as (
 values
 ('애견','애견','사랑하며 기르는 개','사랑하고 아끼며 기르는 개',array['愛','犬']),
 ('우유','우유','소의 젖','소에서 짠 젖을 마실 수 있게 만든 음료',array['牛','乳'])
)
insert into public.hanja_words(word,reading,meaning,child_explanation,content_status,source_note)
select word,reading,meaning,child_explanation,'PUBLISHED',
       '5급 예시어 아동 친화성 개선 · 앱 자체 쉬운 뜻풀이 · 2026-10-05'
from words
on conflict(word,reading,meaning) do update set
 child_explanation=excluded.child_explanation,content_status='PUBLISHED',source_note=excluded.source_note;

with words(word,reading,meaning,chars) as (
 values
 ('애견','애견','사랑하며 기르는 개',array['愛','犬']),
 ('우유','우유','소의 젖',array['牛','乳'])
)
insert into public.hanja_word_map(word_id,hanja_id,position)
select hw.id,h.id,u.ord::integer
from words w
join public.hanja_words hw on hw.word=w.word and hw.reading=w.reading and hw.meaning=w.meaning
cross join lateral unnest(w.chars) with ordinality as u(ch,ord)
join public.hanja h on h.character=u.ch
on conflict do nothing;

do $body$
declare v_bad integer; v_uncovered integer;
begin
 select count(*) into v_bad
 from public.hanja_words w
 where w.source_note='5급 예시어 아동 친화성 개선 · 앱 자체 쉬운 뜻풀이 · 2026-10-05'
 and (select count(*) from public.hanja_word_map m where m.word_id=w.id)<>char_length(w.word);
 if v_bad<>0 then raise exception 'Child-friendly replacement mapping incomplete: %',v_bad;end if;

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
 if v_uncovered<>0 then raise exception 'Through-grade-5 Hanja lack published example words: %',v_uncovered;end if;
end $body$;
