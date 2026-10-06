insert into public.hanja_words(word,reading,meaning,child_explanation,content_status,source_note,hanja_form) values
('백운','백운','흰 구름','하늘에 떠 있는 흰 구름을 이르는 말','PUBLISHED','예시어 커버리지 복구 · 2026-10-06','白雲'),
('도책','도책','그림을 모은 책','그림이나 도면을 모아 만든 책을 이르는 말','PUBLISHED','예시어 커버리지 복구 · 2026-10-06','圖冊');

insert into public.hanja_word_map(word_id,hanja_id,position)
select w.id,h.id,x.pos from (values ('백운','白',1),('백운','雲',2),('도책','圖',1),('도책','冊',2)) x(word,ch,pos)
join public.hanja_words w on w.word=x.word join public.hanja h on h.character=x.ch
where w.content_status='PUBLISHED' on conflict do nothing;
