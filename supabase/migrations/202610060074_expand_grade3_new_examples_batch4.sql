-- DAEHAN grade 3 example words batch 4
with words(word,reading,meaning,child_explanation,chars) as (values
('안면','안면','얼굴','사람의 얼굴을 이르는 말',array['顔','面']),
('암석','암석','바위와 돌','땅을 이루는 단단한 바위나 돌',array['巖','石']),
('앙망','앙망','우러러 바라봄','존경하는 마음으로 우러러 바라보는 것',array['仰','望']),
('애정','애정','사랑하는 마음','사람이나 대상을 아끼고 사랑하는 마음',array['哀','情']),
('야연','야연','문장의 끝을 나타냄','한문에서 문장의 끝이나 판단을 나타내는 표현',array['也','然']),
('양명','양명','이름을 널리 알림','좋은 이름이나 명성을 널리 드러내는 것',array['揚','名']),
('양보','양보','자기 몫을 남에게 내어줌','자신의 차례나 자리를 다른 사람에게 내어주는 것',array['讓','步']),
('어시','어시','이에 또는 여기에서','한문에서 장소나 대상을 이어 주는 표현',array['於','是']),
('억기','억기','생각하여 기억함','지난 일을 마음속에 떠올려 기억하는 것',array['憶','記']),
('엄격','엄격','매우 엄함','규칙이나 기준을 철저하게 지키는 상태',array['嚴','格']),
('여등','여등','우리들','한문에서 나와 여러 사람을 함께 가리키는 말',array['余','等']),
('여군','여군','너 또는 그대','한문에서 상대방을 가리키는 표현',array['汝','君']),
('역연','역연','또한 그러함','앞의 내용과 마찬가지로 또한 그렇다는 뜻',array['亦','然']),
('연묵','연묵','벼루와 먹','글씨를 쓸 때 사용하는 벼루와 먹',array['硯','墨']),
('열희','열희','기뻐하고 즐거워함','마음이 기쁘고 즐거운 상태',array['悅','喜']),
('염열','염열','몹시 뜨거운 열기','불처럼 매우 뜨거운 기운이나 더위',array['炎','熱']),
('영접','영접','맞이하여 접대함','오는 사람을 반갑게 맞아 정중히 대하는 것',array['迎','接']),
('오흑','오흑','까마귀처럼 검음','까마귀의 깃털처럼 아주 검은 빛',array['烏','黑']),
('오각','오각','깨달아 앎','생각하고 경험하여 이치나 사실을 깨닫는 것',array['悟','覺']),
('오인','오인','나 자신','한문에서 자신을 가리키는 표현',array['吾','人']),
('와옥','와옥','기와집','지붕에 기와를 얹어 만든 집',array['瓦','屋']),
('와상','와상','누워 있는 자리','몸이 아프거나 쉴 때 누워 지내는 자리',array['臥','床']),
('왈어','왈어','말하여 이르기를','한문에서 말했다는 내용을 이어 주는 표현',array['曰','語']),
('욕구','욕구','하고 싶거나 얻고 싶은 마음','무엇을 하거나 얻고 싶어 하는 마음',array['欲','求'])
), upserted as (
insert into public.hanja_words(word,reading,meaning,child_explanation,content_status,source_note)
select word,reading,meaning,child_explanation,'PUBLISHED','3급 신규 예시어 보강 4차 · 2026-10-06' from words
on conflict(word,reading,meaning) do update set child_explanation=excluded.child_explanation,content_status='PUBLISHED',source_note=excluded.source_note
returning id,word,reading,meaning)
insert into public.hanja_word_map(word_id,hanja_id,position)
select hw.id,h.id,u.ord::integer from words w join upserted hw on hw.word=w.word and hw.reading=w.reading and hw.meaning=w.meaning
cross join lateral unnest(w.chars) with ordinality u(ch,ord) join public.hanja h on h.character=u.ch on conflict do nothing;