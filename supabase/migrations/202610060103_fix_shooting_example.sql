update public.hanja_words set hanja_form='射擊', child_explanation='총이나 활 등을 목표를 향해 쏘는 것', source_note='예시어 한자 표기 교정 · 2026-10-06' where id=1103;
delete from public.hanja_word_map where word_id=1103 and hanja_id=(select id from public.hanja where character='的');
