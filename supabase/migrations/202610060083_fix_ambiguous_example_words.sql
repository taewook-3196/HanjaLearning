-- Replace misleading example words with clear modern vocabulary.
-- Keep old rows for migration history; remove their mappings so they are not shown as examples.

delete from public.hanja_word_map where word_id in (1047,1095,1099,1129,1170,1225);

with words(word,reading,meaning,child_explanation,chars) as (values
('법전','법전','법을 모아 놓은 책','여러 법률이나 법 규정을 모아 정리한 책',array['法','典']),
('전과','전과','모든 과목','학교의 여러 과목 전체를 이르는 말',array['全','科']),
('애가','애가','슬픈 노래','슬픔이나 애도의 마음을 담은 노래',array['哀','歌']),
('범사','범사','모든 일','일상에서 생기는 여러 가지 모든 일',array['凡','事']),
('부력','부력','물체를 위로 뜨게 하는 힘','물이나 공기가 물체를 위로 밀어 올리는 힘',array['浮','力']),
('이왕','이왕','이미 지나간 때','이미 그렇게 된 바에는 또는 이미 지난 일을 나타내는 말',array['已','往']),
('한사','한사','한스러운 일','마음에 한이 남을 만큼 슬프거나 안타까운 일',array['恨','事'])
), upserted as (
insert into public.hanja_words(word,reading,meaning,child_explanation,content_status,source_note)
select word,reading,meaning,child_explanation,'PUBLISHED','예시어 품질 교정 · 2026-10-06' from words
on conflict(word,reading,meaning) do update set child_explanation=excluded.child_explanation,content_status='PUBLISHED',source_note=excluded.source_note
returning id,word,reading,meaning)
insert into public.hanja_word_map(word_id,hanja_id,position)
select hw.id,h.id,u.ord::integer from words w join upserted hw on hw.word=w.word and hw.reading=w.reading and hw.meaning=w.meaning
cross join lateral unnest(w.chars) with ordinality u(ch,ord) join public.hanja h on h.character=u.ch
on conflict do nothing;
