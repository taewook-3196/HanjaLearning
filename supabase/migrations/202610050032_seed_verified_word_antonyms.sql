-- Seed dictionary-verified word antonyms for WORD_SYNONYM_ANTONYM.
-- Relationship source: National Institute of Korean Language Korean Basic Dictionary.
-- Only ordinary lexical data and source references are stored; no dictionary example sentence is copied.

with words(word,reading,meaning,child_explanation,chars,source_note) as (
 values
 ('오전','오전','아침부터 낮 열두 시까지의 동안','아침부터 낮 열두 시까지의 시간',array['午','前'],'국립국어원 한국어기초사전 오전(午前), ParaWordNo=20246 · 2026-10-05'),
 ('오후','오후','낮 열두 시부터 밤 열두 시까지의 동안','낮 열두 시부터 밤 열두 시까지의 시간',array['午','後'],'국립국어원 한국어기초사전 오후(午後), 오전의 반대말 관계 검증 · 2026-10-05')
),
inserted as (
 insert into public.hanja_words(word,reading,meaning,child_explanation,content_status,source_note)
 select word,reading,meaning,child_explanation,'PUBLISHED',source_note from words
 on conflict(word,reading,meaning) do update set
  child_explanation=excluded.child_explanation,
  content_status='PUBLISHED',
  source_note=excluded.source_note
 returning id,word,reading,meaning
)
insert into public.hanja_word_map(word_id,hanja_id,position)
select w.id,h.id,u.ord::integer
from words d
join inserted w on w.word=d.word and w.reading=d.reading and w.meaning=d.meaning
cross join lateral unnest(d.chars) with ordinality as u(ch,ord)
join public.hanja h on h.character=u.ch
on conflict do nothing;

with pair as (
 select least(a.id,b.id) from_id,greatest(a.id,b.id) to_id
 from public.hanja_words a,public.hanja_words b
 where a.word='오전' and a.reading='오전'
   and b.word='오후' and b.reading='오후'
   and a.content_status='PUBLISHED' and b.content_status='PUBLISHED'
)
insert into public.hanja_word_relations(from_word_id,to_word_id,relation_type,content_status,source_note)
select from_id,to_id,'OPPOSITE','PUBLISHED',
 '국립국어원 한국어기초사전: 오전(午前)의 반대말 오후(午後), ParaWordNo=20246 · 확인 2026-10-05'
from pair
on conflict(from_word_id,to_word_id,relation_type) do update set
 content_status='PUBLISHED',source_note=excluded.source_note,updated_at=now();

do $body$
declare v_words integer; v_relation integer; v_bad integer;
begin
 select count(*) into v_words from public.hanja_words where word in ('오전','오후') and content_status='PUBLISHED';
 if v_words<2 then raise exception 'Expected published 오전/오후 words'; end if;

 select count(*) into v_bad
 from public.hanja_words w
 where w.word in ('오전','오후')
   and (select count(*) from public.hanja_word_map m where m.word_id=w.id)<>2;
 if v_bad<>0 then raise exception '오전/오후 mapping integrity failure: %',v_bad; end if;

 select count(*) into v_relation
 from public.hanja_word_relations r
 join public.hanja_words a on a.id=r.from_word_id
 join public.hanja_words b on b.id=r.to_word_id
 where r.relation_type='OPPOSITE'
   and ((a.word='오전' and b.word='오후') or (a.word='오후' and b.word='오전'))
   and r.content_status='PUBLISHED';
 if v_relation<1 then raise exception 'Expected at least one published 오전/오후 antonym relation, got %',v_relation; end if;
end $body$;
