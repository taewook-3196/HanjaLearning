delete from public.hanja_word_map where word_id in (1276,1285,1287,1299,1300);
update public.hanja_words set content_status='DRAFT' where id in (1276,1285,1287,1299,1300);
insert into public.hanja_words(word,reading,meaning,child_explanation,content_status,source_note,hanja_form) values
('노발','노발','몹시 화를 냄','몹시 화가 나서 크게 성을 내는 것','PUBLISHED','예시어 품질 교정 · 2026-10-06','怒發'),
('득의','득의','뜻을 이룸','바라던 일이 이루어져 만족하고 기쁜 상태','PUBLISHED','예시어 품질 교정 · 2026-10-06','得意'),
('약도','약도','간단히 그린 지도','길이나 장소를 알아보기 쉽게 간단히 그린 지도','PUBLISHED','예시어 품질 교정 · 2026-10-06','略圖'),
('미성','미성','끝에 남은 소리','소리가 끝난 뒤에도 남아 들리는 소리','PUBLISHED','예시어 품질 교정 · 2026-10-06','尾聲'),
('반점','반점','밥을 파는 음식점','밥이나 음식을 파는 가게를 이르는 말','PUBLISHED','예시어 품질 교정 · 2026-10-06','飯店');
