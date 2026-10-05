-- Seed verified four-character idioms for IDIOM questions.
-- Store only lexical facts plus app-authored concise explanations; no source example sentences.

with idioms(idiom,reading,meaning,child_explanation,source_note) as (
 values
 ('苦盡甘來','고진감래','힘든 때가 지나면 좋은 때가 찾아온다는 뜻','어려움을 견딘 뒤 좋은 일이 찾아온다는 말','국립국어원 사전 계열 및 교육용 한자성어 자료 교차검증 · 2026-10-05'),
 ('一石二鳥','일석이조','한 가지 일로 두 가지 이익을 얻는다는 뜻','한 번의 행동으로 두 가지 좋은 결과를 얻는다는 말','국립국어원 사전 계열 및 교육용 한자성어 자료 교차검증 · 2026-10-05'),
 ('東問西答','동문서답','물은 내용과 전혀 관계없는 대답을 한다는 뜻','질문과 맞지 않는 엉뚱한 대답을 한다는 말','국립국어원 사전 계열 및 교육용 한자성어 자료 교차검증 · 2026-10-05'),
 ('大器晩成','대기만성','큰 인물이 되기까지 오랜 시간이 걸린다는 뜻','큰 재능은 충분한 시간과 노력을 거쳐 이루어진다는 말','국립국어원 사전 계열 및 교육용 한자성어 자료 교차검증 · 2026-10-05')
)
insert into public.hanja_idioms(idiom,reading,meaning,child_explanation,content_status,source_note)
select idiom,reading,meaning,child_explanation,'PUBLISHED',source_note
from idioms
on conflict(idiom) do update set
 reading=excluded.reading,
 meaning=excluded.meaning,
 child_explanation=excluded.child_explanation,
 content_status='PUBLISHED',
 source_note=excluded.source_note;

with target as (
 select id,idiom from public.hanja_idioms
 where idiom in ('苦盡甘來','一石二鳥','東問西答','大器晩成')
),
chars as (
 select t.id,t.idiom,u.ch,u.ord::integer as position
 from target t
 cross join lateral unnest(string_to_array(t.idiom,null)) with ordinality as u(ch,ord)
)
insert into public.hanja_idiom_map(idiom_id,hanja_id,position)
select c.id,h.id,c.position
from chars c
join public.hanja h on h.character=c.ch
on conflict(idiom_id,position) do update set hanja_id=excluded.hanja_id;

do $body$
declare v_idioms integer; v_bad integer;
begin
 select count(*) into v_idioms
 from public.hanja_idioms
 where idiom in ('苦盡甘來','一石二鳥','東問西答','大器晩成')
   and content_status='PUBLISHED';
 if v_idioms<>4 then raise exception 'Expected 4 published idioms, got %',v_idioms; end if;

 select count(*) into v_bad
 from public.hanja_idioms i
 where i.idiom in ('苦盡甘來','一石二鳥','東問西答','大器晩成')
   and (select count(*) from public.hanja_idiom_map m where m.idiom_id=i.id)<>4;
 if v_bad<>0 then raise exception 'Incomplete idiom mappings: %',v_bad; end if;
end $body$;
