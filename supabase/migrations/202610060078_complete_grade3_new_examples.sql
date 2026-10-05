-- Complete DAEHAN grade 3 new-at-grade example coverage
with words(word,reading,meaning,child_explanation,chars) as (values
('피로','피로','몸이나 마음이 지침','일이나 운동 뒤에 몸과 마음이 지쳐 힘든 상태',array['疲','勞']),
('필적','필적','서로 맞먹음','힘이나 능력이 서로 비슷하여 맞설 만한 것',array['匹','敵']),
('하여','하여','어찌하여','어떤 까닭이나 이유를 물을 때 쓰는 표현',array['何','如']),
('한사','한사','한가로운 일','바쁘지 않을 때 여유롭게 하는 일',array['閑','事']),
('한심','한심','한이 맺힌 마음','마음속에 오래 남은 슬픔이나 아쉬움',array['恨','心']),
('항상','항상','언제나','어느 때나 변함없이 늘',array['恒','常']),
('형법','형법','범죄와 형벌을 정한 법','어떤 행동이 범죄인지와 벌을 어떻게 정할지 다루는 법',array['刑','法']),
('호구','호구','호랑이의 입','호랑이의 입처럼 매우 위험한 곳을 비유하는 말',array['虎','口']),
('호연','호연','그런가 하고 묻는 표현','한문에서 물음이나 감탄의 느낌을 나타내는 표현',array['乎','然']),
('혹인','혹인','어떤 사람','정해지지 않은 어떤 사람을 이르는 말',array['或','人']),
('혼합','혼합','여러 것을 섞음','둘 이상의 것을 한데 섞는 것',array['混','合']),
('혼약','혼약','혼인을 약속함','결혼하기로 서로 약속하는 것',array['婚','約']),
('홍색','홍색','붉은색','선명하고 붉은 빛깔',array['紅','色']),
('화미','화미','화려하고 아름다움','빛나고 아름다운 모습을 이르는 말',array['華','美']),
('환영','환영','기쁘게 맞이함','오는 사람을 반갑고 기쁘게 맞는 것',array['歡','迎']),
('황제','황제','제국의 임금','큰 제국을 다스리는 임금',array['皇','帝']),
('후의','후의','두터운 정과 뜻','다른 사람에게 베푸는 따뜻하고 깊은 마음',array['厚','意']),
('흉부','흉부','가슴 부분','몸에서 목과 배 사이에 있는 가슴 부분',array['胸','部'])
), upserted as (insert into public.hanja_words(word,reading,meaning,child_explanation,content_status,source_note) select word,reading,meaning,child_explanation,'PUBLISHED','3급 신규 예시어 보강 8차 · 2026-10-06' from words on conflict(word,reading,meaning) do update set child_explanation=excluded.child_explanation,content_status='PUBLISHED',source_note=excluded.source_note returning id,word,reading,meaning)
insert into public.hanja_word_map(word_id,hanja_id,position) select hw.id,h.id,u.ord::integer from words w join upserted hw on hw.word=w.word and hw.reading=w.reading and hw.meaning=w.meaning cross join lateral unnest(w.chars) with ordinality u(ch,ord) join public.hanja h on h.character=u.ch on conflict do nothing;