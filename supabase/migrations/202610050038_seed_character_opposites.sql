-- Seed conservative opposite-character relations for mock-exam generation.
-- Store both directions because the generator starts from from_hanja_id.

with pairs(a,b,note) as (
 values
 ('大','小','크다와 작다의 반대 의미'),
 ('上','下','위와 아래의 반대 의미'),
 ('左','右','왼쪽과 오른쪽의 반대 의미'),
 ('內','外','안과 밖의 반대 의미')
),
directed(a,b,note) as (
 select a,b,note from pairs
 union all
 select b,a,note from pairs
)
insert into public.hanja_relations(from_hanja_id,to_hanja_id,relation_type,note,content_status,source_note)
select h1.id,h2.id,'OPPOSITE',d.note,'PUBLISHED',
 '기초 한자 의미 대립 관계 교차검증 · 앱 문제용 관계 데이터 · 2026-10-05'
from directed d
join public.hanja h1 on h1.character=d.a and h1.content_status='PUBLISHED'
join public.hanja h2 on h2.character=d.b and h2.content_status='PUBLISHED'
on conflict(from_hanja_id,to_hanja_id,relation_type) do update set
 note=excluded.note,content_status='PUBLISHED',source_note=excluded.source_note;

do $body$
declare v_count integer; v_missing integer;
begin
 select count(*) into v_count
 from public.hanja_relations
 where relation_type='OPPOSITE'
 and source_note='기초 한자 의미 대립 관계 교차검증 · 앱 문제용 관계 데이터 · 2026-10-05';
 if v_count<>8 then raise exception 'Expected 8 directed opposite relations, got %',v_count; end if;

 with expected(a,b) as (
  values ('大','小'),('小','大'),('上','下'),('下','上'),
         ('左','右'),('右','左'),('內','外'),('外','內')
 )
 select count(*) into v_missing
 from expected e
 where not exists (
  select 1 from public.hanja_relations r
  join public.hanja h1 on h1.id=r.from_hanja_id
  join public.hanja h2 on h2.id=r.to_hanja_id
  where h1.character=e.a and h2.character=e.b
    and r.relation_type='OPPOSITE' and r.content_status='PUBLISHED'
 );
 if v_missing<>0 then raise exception 'Missing expected opposite relations: %',v_missing; end if;
end $body$;
