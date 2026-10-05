-- Improve uncommon grade-4 example words while preserving character coverage.
delete from public.hanja_word_map where word_id in (1012,1015,1022,1037,1045,1046,1049);

with words(word,reading,meaning,child_explanation,chars) as (values
('여의','여의','뜻대로 됨','생각하거나 바라는 뜻과 같이 되는 것',array['如','意']),
('백일','백일','밝은 낮','해가 밝게 비치는 낮',array['白','日']),
('작일','작일','어제','오늘의 바로 전날을 이르는 한자어',array['昨','日']),
('청명','청명','맑고 밝음','날씨나 하늘이 맑고 밝은 상태',array['淸','明']),
('흉사','흉사','좋지 않은 일','불길하거나 좋지 않은 일',array['凶','事']),
('흑판','흑판','검은 판','글씨를 쓰는 검은 판을 이르는 말',array['黑','板']),
('주립','주립','주에서 세움','주 정부가 세워 운영하는 기관을 나타내는 말',array['州','立'])
), upserted as (
insert into public.hanja_words(word,reading,meaning,child_explanation,content_status,source_note)
select word,reading,meaning,child_explanation,'PUBLISHED','예시어 품질 교정 · 2026-10-06' from words
on conflict(word,reading,meaning) do update set child_explanation=excluded.child_explanation,content_status='PUBLISHED',source_note=excluded.source_note
returning id,word,reading,meaning)
insert into public.hanja_word_map(word_id,hanja_id,position)
select hw.id,h.id,u.ord::integer from words w join upserted hw on hw.word=w.word and hw.reading=w.reading and hw.meaning=w.meaning
cross join lateral unnest(w.chars) with ordinality u(ch,ord) join public.hanja h on h.character=u.ch
on conflict do nothing;