-- DAEHAN grade 3 example words batch 7
with words(word,reading,meaning,child_explanation,chars) as (values
('집행','집행','실제로 행함','정해진 일이나 명령을 실제로 실행하는 것',array['執','行']),
('차용','차용','빌려서 씀','남의 물건이나 생각을 빌려 사용하는 것',array['借','用']),
('차지','차지','이 땅 또는 이곳','한문에서 이곳이나 이 땅을 가리키는 표현',array['此','地']),
('창성','창성','크게 번성함','힘이나 세력이 크게 일어나 발전하는 것',array['昌','盛']),
('채식','채식','채소로 만든 음식','고기보다 채소나 나물을 중심으로 먹는 식사',array['菜','食']),
('채집','채집','모아서 거둠','여러 곳에서 필요한 것을 찾아 모으는 것',array['採','集']),
('처부','처부','아내와 남편','아내와 남편을 함께 이르는 말',array['妻','夫']),
('척도','척도','재는 기준','길이나 정도를 재거나 판단하는 기준',array['尺','度']),
('천수','천수','얕은 물','깊지 않은 얕은 물',array['淺','水']),
('청천','청천','맑게 갠 하늘','구름 없이 맑게 갠 하늘',array['晴','天']),
('초대','초대','사람을 불러 맞이함','사람을 어떤 자리나 행사에 오도록 부르는 것',array['招','待']),
('추리','추리','미루어 판단함','알고 있는 사실을 바탕으로 답을 생각해 내는 것',array['推','理']),
('추가','추가','뒤에 더 보탬','이미 있는 것에 더 보태는 것',array['追','加']),
('취업','취업','직업을 얻음','일할 직장을 얻어 일을 시작하는 것',array['就','業']),
('취풍','취풍','바람을 불게 함','입으로 불어 바람을 일으키는 것',array['吹','風']),
('층간','층간','층과 층 사이','건물에서 한 층과 다른 층의 사이',array['層','間']),
('태평','태평','평안하고 걱정이 없음','세상이 평안하거나 마음에 걱정이 없는 상태',array['泰','平']),
('투표','투표','표를 던져 뜻을 나타냄','선거나 결정에서 원하는 쪽에 표를 내는 것',array['投','票']),
('일편','일편','한 편','글이나 작품 하나를 세는 말',array['一','篇']),
('폐문','폐문','문을 닫음','열려 있던 문을 닫는 것',array['閉','門']),
('포애','포애','사랑으로 안아 줌','사랑하는 마음으로 따뜻하게 안아 주는 것',array['抱','愛']),
('풍엽','풍엽','단풍나무 잎','가을에 붉게 물드는 단풍나무의 잎',array['楓','葉']),
('풍년','풍년','곡식이 잘된 해','농사가 잘되어 곡식을 많이 거두는 해',array['豊','年']),
('피육','피육','가죽과 살','동물의 가죽과 살을 함께 이르는 말',array['皮','肉']),
('피아','피아','저쪽과 우리 쪽','상대편과 우리 편을 함께 이르는 말',array['彼','我'])
), upserted as (insert into public.hanja_words(word,reading,meaning,child_explanation,content_status,source_note) select word,reading,meaning,child_explanation,'PUBLISHED','3급 신규 예시어 보강 7차 · 2026-10-06' from words on conflict(word,reading,meaning) do update set child_explanation=excluded.child_explanation,content_status='PUBLISHED',source_note=excluded.source_note returning id,word,reading,meaning)
insert into public.hanja_word_map(word_id,hanja_id,position) select hw.id,h.id,u.ord::integer from words w join upserted hw on hw.word=w.word and hw.reading=w.reading and hw.meaning=w.meaning cross join lateral unnest(w.chars) with ordinality u(ch,ord) join public.hanja h on h.character=u.ch on conflict do nothing;