-- Correct/replace representative example words found during cumulative grade-3 review.
-- Natural Korean vocabulary is preferred; characters outside the current corpus may remain unmapped.

-- 小形 is valid for a small shape/form. Clarify the gloss so it is not confused with 小型 (small size/model).
update public.hanja_words
set meaning='작은 모양이나 형체',
    child_explanation='크기가 작은 모양이나 생김새를 이르는 말'
where id=245 and word='소형' and hanja_form='小形';

-- Remove the artificial 具景 pairing. 具 and 景 already have natural examples elsewhere.
delete from public.hanja_word_map where word_id=774;
delete from public.hanja_words where id=774 and word='구경' and hanja_form='具景';

-- 次: use 次回, a real word meaning the next occasion/round.
update public.hanja_words
set word='차회', reading='차회', hanja_form='次回',
    meaning='다음 차례나 다음 번',
    child_explanation='이번 다음에 돌아오는 차례나 번'
where id=922 and word='차례' and hanja_form='次例';
delete from public.hanja_word_map where word_id=922;
insert into public.hanja_word_map(word_id,hanja_id,position)
select 922,id,1 from public.hanja where character='次'
union all
select 922,id,2 from public.hanja where character='回';

-- 良: use the common word 良心.
update public.hanja_words
set word='양심', reading='양심', hanja_form='良心',
    meaning='옳고 그름을 스스로 판단하는 마음',
    child_explanation='내 행동이 옳은지 그른지 스스로 생각하고 판단하는 마음'
where id=977 and word='양식' and hanja_form='良式';
delete from public.hanja_word_map where word_id=977;
insert into public.hanja_word_map(word_id,hanja_id,position)
select 977,id,1 from public.hanja where character='良'
union all
select 977,id,2 from public.hanja where character='心';

-- 式: retain coverage with the common word 方式.
insert into public.hanja_words(id,word,reading,meaning,child_explanation,content_status,source_note,hanja_form)
select 1462,'방식','방식','일을 하는 일정한 방법이나 형식','어떤 일을 하거나 문제를 해결하는 방법','approved','grade3 quality review','方式'
where not exists (select 1 from public.hanja_words where word='방식' and hanja_form='方式');
insert into public.hanja_word_map(word_id,hanja_id,position)
select w.id,h.id,v.position
from public.hanja_words w
join (values ('方',1),('式',2)) v(ch,position) on true
join public.hanja h on h.character=v.ch
where w.word='방식' and w.hanja_form='方式'
on conflict do nothing;

-- 句: replace the nonstandard 句文 with the common 句節.
update public.hanja_words
set word='구절', reading='구절', hanja_form='句節',
    meaning='한 토막의 말이나 글',
    child_explanation='문장이나 글에서 뜻을 이루는 한 토막'
where id=1264 and word='구문' and hanja_form='句文';
delete from public.hanja_word_map where word_id=1264;
insert into public.hanja_word_map(word_id,hanja_id,position)
select 1264,id,1 from public.hanja where character='句'
union all
select 1264,id,2 from public.hanja where character='節';
