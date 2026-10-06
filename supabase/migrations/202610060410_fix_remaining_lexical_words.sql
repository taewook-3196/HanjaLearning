-- Corrections from manual lexical review of previously unmapped example words.

-- 처부 is 妻父: one's wife's father (father-in-law), not 妻夫 'wife and husband'.
update public.hanja_words
set hanja_form='妻父',
    meaning='아내의 아버지',
    child_explanation='아내의 아버지, 즉 장인을 이르는 말'
where id=1202 and word='처부';

delete from public.hanja_word_map where word_id=1202;
insert into public.hanja_word_map(word_id,hanja_id,position)
select 1202,id,1 from public.hanja where character='妻'
union all
select 1202,id,2 from public.hanja where character='父';

-- These are verified lexical forms; restore their display forms/mappings.
with fixes(id, form) as (values
  (1276,'怒心'),
  (1406,'興發'),
  (1413,'恨事'),
  (1435,'與件'),
  (1447,'丑生')
)
update public.hanja_words w
set hanja_form=f.form
from fixes f
where w.id=f.id and w.hanja_form is null;

with fixes(id,ch,position) as (values
  (1276,'怒',1),(1276,'心',2),
  (1406,'興',1),(1406,'發',2),
  (1413,'恨',1),(1413,'事',2),
  (1435,'與',1),(1435,'件',2),
  (1447,'丑',1),(1447,'生',2)
)
insert into public.hanja_word_map(word_id,hanja_id,position)
select f.id,h.id,f.position from fixes f join public.hanja h on h.character=f.ch
on conflict do nothing;
