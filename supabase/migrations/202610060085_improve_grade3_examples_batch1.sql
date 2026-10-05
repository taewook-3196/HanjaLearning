-- Prefer clearer grade-3 example words where a simpler valid compound is available.
delete from public.hanja_word_map where word_id in (1067,1080,1088);

with words(word,reading,meaning,child_explanation,chars) as (values
('권서','권서','책을 말아 만든 두루마리','종이나 글을 말아 만든 책이나 두루마리를 이르는 말',array['卷','書']),
('유목','유목','버드나무','버드나무를 한자로 이르는 말',array['柳','木']),
('모석','모석','저녁 무렵','날이 저물어 가는 저녁 무렵을 이르는 말',array['暮','夕'])
), upserted as (
insert into public.hanja_words(word,reading,meaning,child_explanation,content_status,source_note)
select word,reading,meaning,child_explanation,'PUBLISHED','예시어 품질 교정 · 2026-10-06' from words
on conflict(word,reading,meaning) do update set child_explanation=excluded.child_explanation,content_status='PUBLISHED',source_note=excluded.source_note
returning id,word,reading,meaning)
insert into public.hanja_word_map(word_id,hanja_id,position)
select hw.id,h.id,u.ord::integer from words w join upserted hw on hw.word=w.word and hw.reading=w.reading and hw.meaning=w.meaning
cross join lateral unnest(w.chars) with ordinality u(ch,ord) join public.hanja h on h.character=u.ch
on conflict do nothing;