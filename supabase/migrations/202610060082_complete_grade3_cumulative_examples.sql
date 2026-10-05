-- DAEHAN grade 3 cumulative final coverage
with words(word,reading,meaning,child_explanation,chars) as (values
('인오','인오','지지의 인과 오','십이지의 호랑이와 말',array['寅','午']),
('일일','일일','숫자 하나','문서에서 숫자 하나를 분명히 적는 글자',array['壹','一']),
('임신','임신','육십갑자 하나','천간 임과 지지 신의 조합',array['壬','申']),
('장대','장대','크고 씩씩함','크고 씩씩한 모습',array['壯','大']),
('적당','적당','알맞음','정도나 조건에 알맞음',array['適','當']),
('전문','전문','한 분야를 깊이 다룸','특정 분야를 깊이 다루는 것',array['專','門']),
('정수','정수','우물물','우물에서 길어 올린 물',array['井','水']),
('정미','정미','육십갑자 하나','천간 정과 지지 미의 조합',array['丁','未']),
('제도','제도','정해진 방식과 규칙','사회나 조직의 규칙이나 방식',array['制','度']),
('제품','제품','만들어 낸 물건','만들어서 사용하는 물건',array['製','品']),
('전조','전조','앞으로 일어날 징조','일이 생기기 전에 나타나는 조짐',array['兆','前']),
('건조','건조','세우거나 만듦','건물이나 배 등을 만드는 것',array['建','造']),
('존경','존경','높여 공경함','훌륭한 사람을 높이는 마음',array['尊','敬']),
('종교','종교','믿음과 가르침의 체계','신앙과 가르침을 따르는 체계',array['宗','敎']),
('주력','주력','달리는 힘','달리거나 나아가는 힘',array['走','力']),
('주색','주색','붉은색','선명한 붉은빛',array['朱','色']),
('다중','다중','많은 사람','여러 사람이 모인 무리',array['多','衆']),
('지시','지시','가리켜 알려 줌','해야 할 것을 알려 주는 것',array['指','示']),
('직원','직원','일터에서 일하는 사람','회사나 기관에서 일하는 사람',array['職','員']),
('창의','창의','새로운 생각','새로운 생각이나 방법을 만드는 것',array['創','意']),
('청취','청취','귀 기울여 들음','말이나 방송을 주의 깊게 듣는 것',array['聽','取']),
('청구','청구','달라고 요구함','돈이나 권리 등을 정식으로 요구함',array['請','求'])
), upserted as (insert into public.hanja_words(word,reading,meaning,child_explanation,content_status,source_note) select word,reading,meaning,child_explanation,'PUBLISHED','3급 누적 최종 · 2026-10-06' from words on conflict(word,reading,meaning) do update set child_explanation=excluded.child_explanation,content_status='PUBLISHED',source_note=excluded.source_note returning id,word,reading,meaning)
insert into public.hanja_word_map(word_id,hanja_id,position) select hw.id,h.id,u.ord::integer from words w join upserted hw on hw.word=w.word and hw.reading=w.reading and hw.meaning=w.meaning cross join lateral unnest(w.chars) with ordinality u(ch,ord) join public.hanja h on h.character=u.ch on conflict do nothing;

with words(word,reading,meaning,child_explanation,chars) as (values
('축미','축미','지지의 축과 미','십이지의 소와 양',array['丑','未']),
('침구','침구','침으로 치료함','침을 이용해 몸을 치료하는 방법',array['針','灸']),
('쾌속','쾌속','매우 빠름','매우 빠르게 나아가는 것',array['快','速']),
('탈출','탈출','빠져나옴','위험하거나 갇힌 곳에서 벗어남',array['脫','出']),
('탐구','탐구','깊이 찾아 연구함','궁금한 것을 자세히 조사하고 연구함',array['探','究']),
('토론','토론','의견을 나눔','주제에 대해 서로 의견을 말함',array['討','論']),
('파괴','파괴','깨뜨려 망가뜨림','부수어 제 기능을 못 하게 함',array['破','壞']),
('판단','판단','생각하여 결정함','사실을 살펴 결론을 정함',array['判','斷']),
('편방','편방','한쪽 방향','어느 한쪽의 방향이나 부분',array['片','方']),
('포고','포고','널리 알림','중요한 내용을 공식적으로 알림',array['布','告']),
('폭우','폭우','매우 세게 내리는 비','짧은 시간에 많이 쏟아지는 비',array['暴','雨']),
('포함','포함','안에 함께 넣음','어떤 범위 안에 함께 들어 있게 함',array['包','含']),
('해시','해시','지지 해의 시각','십이지의 돼지에 해당하는 때',array['亥','時']),
('허공','허공','빈 공간','아무것도 없이 텅 빈 공중',array['虛','空']),
('현인','현인','어질고 지혜로운 사람','덕과 지혜가 뛰어난 사람',array['賢','人']),
('호흡','호흡','숨을 들이쉬고 내쉼','공기를 들이마시고 내보내는 것',array['呼','吸']),
('호구','호구','집의 출입구','집으로 드나드는 문이나 입구',array['戶','口']),
('화물','화물','운반하는 물건','차나 배 등으로 실어 나르는 물건',array['貨','物']),
('후보','후보','선택 대상이 된 사람','어떤 자리에 뽑힐 가능성이 있는 사람',array['候','補']),
('흡수','흡수','빨아들여 받아들임','액체나 빛 등을 안으로 받아들임',array['吸','收']),
('흥발','흥발','흥하여 일어남','기운이나 일이 힘차게 일어나 발전함',array['興','發'])
), upserted as (insert into public.hanja_words(word,reading,meaning,child_explanation,content_status,source_note) select word,reading,meaning,child_explanation,'PUBLISHED','3급 누적 최종 · 2026-10-06' from words on conflict(word,reading,meaning) do update set child_explanation=excluded.child_explanation,content_status='PUBLISHED',source_note=excluded.source_note returning id,word,reading,meaning)
insert into public.hanja_word_map(word_id,hanja_id,position) select hw.id,h.id,u.ord::integer from words w join upserted hw on hw.word=w.word and hw.reading=w.reading and hw.meaning=w.meaning cross join lateral unnest(w.chars) with ordinality u(ch,ord) join public.hanja h on h.character=u.ch on conflict do nothing;
