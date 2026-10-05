-- Seed reviewed word structures, common-character sets, and word relations.
-- Uses only published app word data; no past-paper wording is stored.

-- Semantic structure classifications used by WORD_STRUCTURE questions.
with structures(word,structure_type,explanation) as (
 values
 ('남녀','PARALLEL','남자와 여자를 나란히 이르는 병렬 관계'),
 ('동서','PARALLEL','동쪽과 서쪽을 나란히 이르는 병렬 관계'),
 ('남북','PARALLEL','남쪽과 북쪽을 나란히 이르는 병렬 관계'),
 ('천지','PARALLEL','하늘과 땅을 나란히 이르는 병렬 관계'),
 ('출입','PARALLEL','나감과 들어옴을 나란히 이르는 병렬 관계'),
 ('독서','VERB_OBJECT','책을 읽는다는 뜻의 술목 관계'),
 ('농촌','MODIFIER_HEAD','농업과 관련된 마을이라는 뜻의 수식 관계'),
 ('소년','MODIFIER_HEAD','나이가 어린 사람이라는 뜻의 수식 관계')
)
insert into public.hanja_word_structures(word_id,structure_type,explanation,content_status,source_note)
select w.id,s.structure_type,s.explanation,'PUBLISHED','교육용 한자어 짜임 검토 · 2026-10-05'
from structures s
join public.hanja_words w on w.word=s.word and w.content_status='PUBLISHED'
on conflict(word_id) do update set
 structure_type=excluded.structure_type,
 explanation=excluded.explanation,
 content_status='PUBLISHED',
 source_note=excluded.source_note,
 updated_at=now();

-- Common-character sets. Each set is useful only when every linked word
-- actually contains the declared common Hanja; RLS also enforces this.
with set_defs(common_char,prompt_summary) as (
 values
 ('國','나라 국이 공통으로 들어가는 한자어'),
 ('學','배울 학이 공통으로 들어가는 한자어'),
 ('年','해 년이 공통으로 들어가는 한자어')
),
inserted as (
 insert into public.hanja_common_character_sets(common_hanja_id,prompt_summary,content_status,source_note)
 select h.id,d.prompt_summary,'PUBLISHED','교육용 공통 한자 세트 검토 · 2026-10-05'
 from set_defs d join public.hanja h on h.character=d.common_char
 where not exists (
  select 1 from public.hanja_common_character_sets s
  where s.common_hanja_id=h.id and s.prompt_summary=d.prompt_summary
 )
 returning id
),
sets as (
 select s.id,h.character
 from public.hanja_common_character_sets s
 join public.hanja h on h.id=s.common_hanja_id
 where s.source_note='교육용 공통 한자 세트 검토 · 2026-10-05'
),
links(common_char,word) as (
 values
 ('國','국민'),('國','한국'),
 ('學','학교'),('學','학생'),
 ('年','소년'),('年','청년')
)
insert into public.hanja_common_character_words(set_id,word_id)
select s.id,w.id
from links l
join sets s on s.character=l.common_char
join public.hanja_words w on w.word=l.word and w.content_status='PUBLISHED'
on conflict do nothing;

-- High-confidence opposite word pairs. Pair ordering follows the table's
-- from_word_id < to_word_id invariant regardless of insertion order.
with relation_defs(word_a,word_b,relation_type) as (
 values
 ('동서','남북','OPPOSITE')
),
resolved as (
 select least(a.id,b.id) from_id,greatest(a.id,b.id) to_id,r.relation_type
 from relation_defs r
 join public.hanja_words a on a.word=r.word_a and a.content_status='PUBLISHED'
 join public.hanja_words b on b.word=r.word_b and b.content_status='PUBLISHED'
)
insert into public.hanja_word_relations(from_word_id,to_word_id,relation_type,content_status,source_note)
select from_id,to_id,relation_type,'PUBLISHED','교육용 한자어 관계 검토 · 2026-10-05'
from resolved
on conflict(from_word_id,to_word_id,relation_type) do update set
 content_status='PUBLISHED',source_note=excluded.source_note,updated_at=now();

-- Fail the migration if any intended structure/set was silently skipped.
do $body$
declare v_structures integer; v_sets integer; v_bad_sets integer; v_relations integer;
begin
 select count(*) into v_structures from public.hanja_word_structures
 where source_note='교육용 한자어 짜임 검토 · 2026-10-05';
 if v_structures<>8 then raise exception 'Expected 8 seeded word structures, got %',v_structures; end if;

 select count(*) into v_sets from public.hanja_common_character_sets
 where source_note='교육용 공통 한자 세트 검토 · 2026-10-05';
 if v_sets<>3 then raise exception 'Expected 3 common-character sets, got %',v_sets; end if;

 select count(*) into v_bad_sets
 from public.hanja_common_character_sets s
 where s.source_note='교육용 공통 한자 세트 검토 · 2026-10-05'
   and (
    select count(*) from public.hanja_common_character_words l
    where l.set_id=s.id
   )<2;
 if v_bad_sets<>0 then raise exception 'Incomplete common-character sets: %',v_bad_sets; end if;

 select count(*) into v_relations from public.hanja_word_relations
 where source_note='교육용 한자어 관계 검토 · 2026-10-05';
 if v_relations<>1 then raise exception 'Expected 1 seeded word relation, got %',v_relations; end if;
end $body$;
