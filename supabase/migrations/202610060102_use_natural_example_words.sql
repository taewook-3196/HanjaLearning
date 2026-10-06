delete from public.hanja_word_map where word_id in (1435,1437,1447,1448,1449,1454);
update public.hanja_words set content_status='DRAFT' where id in (1435,1437,1447,1448,1449,1454);
insert into public.hanja_words(word,reading,meaning,child_explanation,content_status,source_note,hanja_form) values
('부여','부여','주거나 가지게 함','권리나 자격 등을 주어 가지게 하는 것','PUBLISHED','자연스러운 예시어 교정 · 2026-10-06','附與'),
('일등','일등','첫째 등급','순서나 성적에서 첫째가 되는 것','PUBLISHED','자연스러운 예시어 교정 · 2026-10-06','壹等'),
('축시','축시','십이지의 축에 해당하는 시각','옛 시간에서 새벽 한 시부터 세 시 무렵을 이르는 말','PUBLISHED','자연스러운 예시어 교정 · 2026-10-06','丑時'),
('편도','편도','한쪽으로 가는 길','가는 길과 오는 길 가운데 한쪽 방향의 길','PUBLISHED','자연스러운 예시어 교정 · 2026-10-06','片道'),
('해시','해시','십이지의 해에 해당하는 시각','옛 시간에서 밤 아홉 시부터 열한 시 무렵을 이르는 말','PUBLISHED','자연스러운 예시어 교정 · 2026-10-06','亥時'),
('권두','권두','책의 첫머리','책이나 글의 맨 앞부분을 이르는 말','PUBLISHED','자연스러운 예시어 교정 · 2026-10-06','卷頭');

insert into public.hanja_word_map(word_id,hanja_id,position)
select w.id,h.id,x.pos from (values ('부여','與',2),('일등','壹',1),('일등','等',2),('축시','丑',1),('축시','時',2),('편도','片',1),('편도','道',2),('해시','亥',1),('해시','時',2),('권두','卷',1),('권두','頭',2)) x(word,ch,pos)
join public.hanja_words w on w.word=x.word and w.content_status='PUBLISHED'
join public.hanja h on h.character=x.ch on conflict do nothing;
