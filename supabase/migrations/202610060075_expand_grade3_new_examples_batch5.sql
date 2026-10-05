-- DAEHAN grade 3 example words batch 5
with words(word,reading,meaning,child_explanation,chars) as (values
('우환','우환','걱정거리','마음을 걱정스럽게 하는 일이나 어려움',array['憂','患']),
('우심','우심','더욱 심함','어떤 정도가 다른 것보다 더 심한 상태',array['尤','甚']),
('우재','우재','또다시','한 번 더 다시 한다는 뜻',array['又','再']),
('우시','우시','이에 또는 여기에서','한문에서 앞뒤 말을 이어 주는 표현',array['于','是']),
('우주','우주','세상의 모든 공간','별과 행성 등 모든 천체가 있는 아주 넓은 공간',array['宇','宙']),
('운왈','운왈','이르기를','한문에서 누가 이렇게 말했다고 이어 주는 표현',array['云','曰']),
('원천','원천','사물의 근원','어떤 것이 생겨나거나 시작되는 바탕',array['源','泉']),
('원망','원망','섭섭하게 여기며 탓함','다른 사람이나 일을 섭섭하게 생각하고 탓하는 마음',array['怨','望']),
('위엄','위엄','엄숙하고 당당한 모습','사람을 존중하게 만드는 엄숙하고 당당한 모습',array['威','嚴']),
('유연','유연','오히려 그러함','한문에서 여전히 또는 오히려 그렇다는 뜻',array['猶','然']),
('유원','유원','즐겁게 노는 곳','사람들이 쉬거나 즐겁게 놀 수 있도록 만든 곳',array['遊','園']),
('유화','유화','부드럽고 온화함','태도나 분위기가 부드럽고 온화한 상태',array['柔','和']),
('유학','유학','유교의 학문','공자와 맹자의 가르침을 중심으로 한 학문',array['儒','學']),
('유아','유아','어린아이','아직 나이가 아주 어린 아이',array['幼','兒']),
('유일','유일','오직 하나','여럿 가운데 단 하나뿐인 것',array['唯','一']),
('음시','음시','시를 읊음','시의 느낌을 살려 소리 내어 읊는 것',array['吟','詩']),
('읍성','읍성','우는 소리','슬프거나 아파서 우는 목소리',array['泣','聲']),
('의야','의야','문장을 맺는 표현','한문에서 문장의 끝을 맺을 때 쓰는 표현',array['矣','也']),
('이차','이차','그리고 또','한문에서 앞말과 뒷말을 이어 주는 표현',array['而','且']),
('이난','이난','쉬움과 어려움','쉬운 것과 어려운 것을 함께 이르는 말',array['易','難']),
('이전','이전','이미 지나간 때','지금보다 앞선 때나 과거',array['已','前']),
('인애','인애','어질고 사랑함','다른 사람을 어질고 따뜻하게 사랑하는 마음',array['仁','愛']),
('인내','인내','참고 견딤','힘들거나 어려운 일을 참고 견디는 것',array['忍','耐']),
('자비','자비','사랑하고 불쌍히 여김','다른 사람을 사랑하고 어려움을 안타깝게 여기는 마음',array['慈','悲'])
), upserted as (
insert into public.hanja_words(word,reading,meaning,child_explanation,content_status,source_note)
select word,reading,meaning,child_explanation,'PUBLISHED','3급 신규 예시어 보강 5차 · 2026-10-06' from words
on conflict(word,reading,meaning) do update set child_explanation=excluded.child_explanation,content_status='PUBLISHED',source_note=excluded.source_note returning id,word,reading,meaning)
insert into public.hanja_word_map(word_id,hanja_id,position)
select hw.id,h.id,u.ord::integer from words w join upserted hw on hw.word=w.word and hw.reading=w.reading and hw.meaning=w.meaning
cross join lateral unnest(w.chars) with ordinality u(ch,ord) join public.hanja h on h.character=u.ch on conflict do nothing;