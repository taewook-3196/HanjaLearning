-- Fix a concrete malformed example mapping found during quality audit.
-- 오각(悟覺) was stored with only 悟 because 覺 is not in the 1000-character master.
delete from public.hanja_word_map where word_id=1144;

with w as (
insert into public.hanja_words(word,reading,meaning,child_explanation,content_status,source_note)
values ('오도','오도','깨달음에 이름','도리나 진리를 깨닫는 것을 이르는 말','PUBLISHED','예시어 품질 교정 · 2026-10-06')
on conflict(word,reading,meaning) do update set child_explanation=excluded.child_explanation,content_status='PUBLISHED',source_note=excluded.source_note
returning id)
insert into public.hanja_word_map(word_id,hanja_id,position)
select w.id,h.id,1 from w join public.hanja h on h.character='悟'
on conflict do nothing;