delete from public.hanja_word_map where word_id in (1410,1413,1421,1422,1423,1427,1429,1430);
update public.hanja_words set content_status='DRAFT' where id in (1410,1413,1421,1422,1423,1427,1429,1430);
insert into public.hanja_words(word,reading,meaning,child_explanation,content_status,source_note,hanja_form) values
('범례','범례','내용을 설명하는 보기','지도나 표의 기호와 뜻을 설명해 놓은 부분','PUBLISHED','예시어 품질 교정 · 2026-10-06','凡例'),
('한심','한심','한이 맺힌 마음','마음속에 한이 남아 있는 상태','PUBLISHED','예시어 품질 교정 · 2026-10-06','恨心'),
('권지','권지','말아 놓은 종이','종이를 두루마리처럼 말아 놓은 것','PUBLISHED','예시어 품질 교정 · 2026-10-06','卷紙'),
('유수','유수','버드나무','버드나무를 한자로 이르는 말','PUBLISHED','예시어 품질 교정 · 2026-10-06','柳樹'),
('모색','모색','저녁빛','해가 질 무렵의 저녁 빛깔','PUBLISHED','예시어 품질 교정 · 2026-10-06','暮色'),
('차처','차처','이곳','바로 이 장소나 곳을 이르는 말','PUBLISHED','예시어 품질 교정 · 2026-10-06','此處'),
('천수','천수','얕은 물','깊이가 얕은 물','PUBLISHED','예시어 품질 교정 · 2026-10-06','淺水'),
('풍엽','풍엽','단풍잎','가을에 붉거나 노랗게 물든 단풍나무 잎','PUBLISHED','예시어 품질 교정 · 2026-10-06','楓葉');

insert into public.hanja_word_map(word_id,hanja_id,position)
select w.id,h.id,x.pos from (values ('범례','凡',1),('범례','例',2),('한심','恨',1),('한심','心',2),('권지','卷',1),('권지','紙',2),('유수','柳',1),('유수','樹',2),('모색','暮',1),('모색','色',2),('차처','此',1),('차처','處',2),('천수','淺',1),('천수','水',2),('풍엽','楓',1),('풍엽','葉',2)) x(word,ch,pos)
join public.hanja_words w on w.word=x.word and w.content_status='PUBLISHED'
join public.hanja h on h.character=x.ch on conflict do nothing;
