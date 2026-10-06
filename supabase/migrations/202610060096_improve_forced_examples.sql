delete from public.hanja_word_map where word_id in (1283,1341,1342,1364,1365,1406);
update public.hanja_words set content_status='DRAFT' where id in (1283,1341,1342,1364,1365,1406);
insert into public.hanja_words(word,reading,meaning,child_explanation,content_status,source_note,hanja_form) values
('북두','북두','북쪽 하늘의 북두칠성','북쪽 하늘에서 국자 모양으로 보이는 일곱 별을 이르는 말','PUBLISHED','예시어 품질 교정 · 2026-10-06','北斗'),
('약간','약간','조금','많지 않고 조금인 정도를 나타내는 말','PUBLISHED','예시어 품질 교정 · 2026-10-06','若干'),
('여건','여건','주어진 조건','어떤 일을 하는 데 필요한 주위의 조건이나 형편','PUBLISHED','예시어 품질 교정 · 2026-10-06','與件'),
('인년','인년','호랑이해','십이지에서 호랑이에 해당하는 해','PUBLISHED','예시어 품질 교정 · 2026-10-06','寅年'),
('일호','일호','첫째 번호','번호나 차례에서 첫 번째를 나타내는 말','PUBLISHED','예시어 품질 교정 · 2026-10-06','壹號'),
('흥미','흥미','재미와 관심','어떤 것에 마음이 끌리고 재미를 느끼는 것','PUBLISHED','예시어 품질 교정 · 2026-10-06','興味');

insert into public.hanja_word_map(word_id,hanja_id,position)
select w.id,h.id,x.pos from (values
('북두','北',1),('북두','斗',2),('약간','若',1),('약간','干',2),('여건','與',1),('여건','件',2),
('인년','寅',1),('인년','年',2),('일호','壹',1),('일호','號',2),('흥미','興',1),('흥미','味',2)
) x(word,ch,pos) join public.hanja_words w on w.word=x.word and w.hanja_form=(case x.word when '북두' then '北斗' when '약간' then '若干' when '여건' then '與件' when '인년' then '寅年' when '일호' then '壹號' when '흥미' then '興味' end) join public.hanja h on h.character=x.ch
on conflict do nothing;
