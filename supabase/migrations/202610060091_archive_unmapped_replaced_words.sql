update public.hanja_words
set content_status='DRAFT', source_note=coalesce(source_note,'') || ' · 교체되어 비공개 처리 2026-10-06'
where id in (1012,1015,1037,1046,1047,1049,1067,1080,1088,1095,1099,1129,1144,1170,1188,1189,1198,1202,1204,1217,1225,1230,1244)
and content_status='PUBLISHED'
and not exists (select 1 from public.hanja_word_map m where m.word_id=hanja_words.id);
