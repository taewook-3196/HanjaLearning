delete from public.hanja_word_map where word_id in (1435,1437,1447,1448,1449,1454);
update public.hanja_words set content_status='DRAFT' where id in (1435,1437,1447,1448,1449,1454);
insert into public.hanja_words(word,reading,meaning,child_explanation,content_status,source_note,hanja_form) values
('부여','부여','주거나 가지게 함','권리나 자격 등을 주어 가지게 하는 것','PUBLISHED','자연스러운 예시어 교정 · 2026-10-06','附與'),
('일등','일등','첫째 등급','순서나 성적에서 첫째가 되는 것','PUBLISHED','자연스러운 예시어 교정 · 2026-10-06','壹等'),
('추악','추악','못생기고 나쁨','모습이나 행동이 보기 싫고 나쁜 상태','PUBLISHED','자연스러운 예시어 교정 · 2026-10-06','醜惡'),
('편리','편리','사용하기 쉽고 좋음','쓰거나 이용하기에 쉽고 좋은 상태','PUBLISHED','자연스러운 예시어 교정 · 2026-10-06','便利'),
('해당','해당','어떤 조건에 맞음','어떤 범위나 조건에 들어맞는 것','PUBLISHED','자연스러운 예시어 교정 · 2026-10-06','該當'),
('권한','권한','할 수 있도록 정해진 권리','어떤 일을 할 수 있도록 주어진 권리나 범위','PUBLISHED','자연스러운 예시어 교정 · 2026-10-06','權限');
