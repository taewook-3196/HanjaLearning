-- DAEHAN grade 3 cumulative example coverage batch 1
with words(word,reading,meaning,child_explanation,chars) as (values
('가로','가로','거리와 길','사람이나 차가 다니는 거리와 길',array['街','路']),
('가면','가면','거짓 얼굴','얼굴을 가리거나 다른 모습으로 보이게 하는 물건',array['假','面']),
('가인','가인','아름다운 사람','모습이나 마음이 아름다운 사람',array['佳','人']),
('간지','간지','천간과 지지','해나 날을 나타내는 전통적인 글자 체계',array['干','支']),
('간병','간병','환자를 돌봄','아픈 사람 곁에서 보살피는 일',array['看','病']),
('갑옷','갑옷','몸을 보호하는 옷','싸움에서 몸을 보호하려고 입던 단단한 옷',array['甲','衣']),
('강습','강습','배우고 익힘','일정한 기간 동안 지식이나 기술을 배우는 것',array['講','習']),
('갱신','갱신','새롭게 고침','기존 내용을 다시 새롭게 바꾸는 것',array['更','新']),
('거대','거대','매우 큼','보통보다 아주 큰 상태',array['巨','大']),
('검사','검사','살펴 확인함','잘못이나 이상이 있는지 자세히 살펴보는 것',array['檢','査']),
('검약','검약','아끼고 절약함','돈이나 물건을 낭비하지 않고 아껴 쓰는 것',array['儉','約']),
('결백','결백','깨끗하고 허물이 없음','잘못이나 부끄러운 일이 없이 깨끗한 상태',array['潔','白']),
('경찰','경찰','질서와 안전을 지키는 사람','사람들의 안전과 사회 질서를 지키는 기관이나 사람',array['警','察']),
('경축','경축','기쁜 일을 축하함','좋고 기쁜 일을 함께 기뻐하며 축하하는 것',array['慶','祝']),
('경전','경전','밭을 갈고 가꿈','농사를 위해 밭을 갈고 돌보는 일',array['耕','田']),
('경계','경계','지역의 경계','한 지역과 다른 지역이 나뉘는 선이나 범위',array['境','界']),
('경험','경험','직접 겪어 봄','어떤 일을 직접 해 보거나 겪어서 알게 되는 것',array['經','驗']),
('경신','경신','천간의 경과 지지의 신','육십갑자 가운데 하나',array['庚','申']),
('계고','계고','타일러 경계함','잘못하지 않도록 미리 타이르고 알려 주는 것',array['戒','告']),
('계류','계류','시냇물의 흐름','산골짜기나 들을 흐르는 시냇물',array['溪','流']),
('계승','계승','이어받음','앞사람의 뜻이나 전통을 이어받는 것',array['繼','承']),
('계미','계미','천간의 계와 지지의 미','육십갑자 가운데 하나',array['癸','未']),
('고내','고내','창고 안','물건을 보관하는 창고의 안쪽',array['庫','內']),
('곡간','곡간','골짜기 사이','산과 산 사이의 골짜기',array['谷','間']),
('구명','구명','깊이 연구하여 밝힘','모르는 사실이나 원리를 깊이 연구해 알아내는 것',array['究','明'])
), upserted as (insert into public.hanja_words(word,reading,meaning,child_explanation,content_status,source_note) select word,reading,meaning,child_explanation,'PUBLISHED','3급 누적 예시어 보강 1차 · 2026-10-06' from words on conflict(word,reading,meaning) do update set child_explanation=excluded.child_explanation,content_status='PUBLISHED',source_note=excluded.source_note returning id,word,reading,meaning)
insert into public.hanja_word_map(word_id,hanja_id,position) select hw.id,h.id,u.ord::integer from words w join upserted hw on hw.word=w.word and hw.reading=w.reading and hw.meaning=w.meaning cross join lateral unnest(w.chars) with ordinality u(ch,ord) join public.hanja h on h.character=u.ch on conflict do nothing;