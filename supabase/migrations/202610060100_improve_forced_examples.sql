delete from public.hanja_word_map where word_id in (1386,1394,1398,1402);
update public.hanja_words set content_status='DRAFT' where id in (1386,1394,1398,1402);
insert into public.hanja_words(word,reading,meaning,child_explanation,content_status,source_note,hanja_form) values
('축생','축생','소의 띠에 태어난 사람','십이지에서 소에 해당하는 축과 태어남을 나타내는 말','PUBLISHED','예시어 품질 교정 · 2026-10-06','丑生'),
('편면','편면','한쪽 면','어느 한쪽의 면이나 부분','PUBLISHED','예시어 품질 교정 · 2026-10-06','片面'),
('해년','해년','돼지해','십이지에서 돼지에 해당하는 해','PUBLISHED','예시어 품질 교정 · 2026-10-06','亥年'),
('호외','호외','집 밖','집이나 문 바깥쪽','PUBLISHED','예시어 품질 교정 · 2026-10-06','戶外');

insert into public.hanja_word_map(word_id,hanja_id,position)
select w.id,h.id,x.pos from (values ('축생','丑',1),('축생','生',2),('편면','片',1),('편면','面',2),('해년','亥',1),('해년','年',2),('호외','戶',1),('호외','外',2)) x(word,ch,pos)
join public.hanja_words w on w.word=x.word and w.content_status='PUBLISHED'
join public.hanja h on h.character=x.ch on conflict do nothing;
