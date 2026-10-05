-- Expand DAEHAN grade-3 new-character example-word coverage (batch 2).
with words(word,reading,meaning,child_explanation,chars) as (values
('신랑','신랑','결혼하는 남자','결혼식에서 결혼하는 남자를 이르는 말',array['新','郞']),
('청량','청량','맑고 서늘함','공기나 느낌이 맑고 시원한 상태',array['淸','涼']),
('노출','노출','겉으로 드러남','가려져 있던 것이 밖으로 드러나는 것',array['露','出']),
('유학','유학','다른 곳에 머물며 공부함','다른 나라나 지역에 가서 머물며 공부하는 것',array['留','學']),
('유수','유수','버드나무','버드나무를 한자로 이르는 말',array['柳','樹']),
('만학','만학','늦게 시작한 공부','나이가 든 뒤 늦게 시작하는 공부',array['晩','學']),
('다망','다망','매우 바쁨','할 일이 많아 몹시 바쁜 상태',array['多','忙']),
('맥류','맥류','보리 종류의 곡식','보리와 밀처럼 보리과에 속하는 곡식을 이르는 말',array['麥','類']),
('면제','면제','해야 할 일을 하지 않아도 되게 함','정해진 의무나 책임을 특별히 하지 않아도 되게 하는 것',array['免','除']),
('불면','불면','잠을 이루지 못함','잠이 잘 오지 않거나 잠들지 못하는 상태',array['不','眠']),
('면학','면학','힘써 공부함','부지런히 노력하여 공부하는 것',array['勉','學']),
('공명','공명','함께 울림','한쪽의 떨림 때문에 다른 쪽도 함께 울리는 현상',array['共','鳴']),
('모색','모색','저녁 무렵의 빛깔','해가 질 무렵 어두워지는 하늘의 빛이나 모습',array['暮','色']),
('묘지','묘지','무덤이 있는 곳','무덤을 만들거나 모아 둔 곳',array['墓','地']),
('무성','무성','풀이나 나무가 우거짐','풀이나 나무가 빽빽하고 힘차게 자란 상태',array['茂','盛']),
('무곡','무곡','춤을 위한 음악','춤을 추는 데 맞도록 만든 음악',array['舞','曲']),
('묵화','묵화','먹으로 그린 그림','먹을 사용하여 그린 그림',array['墨','畫']),
('물론','물론','말할 것도 없이','따로 설명하지 않아도 당연하다는 뜻',array['勿','論']),
('건배','건배','잔을 들어 축하함','기쁜 일을 축하하며 함께 잔을 들어 인사하는 것',array['乾','杯']),
('범인','범인','보통 사람','특별하지 않은 평범한 사람을 이르는 말',array['凡','人']),
('범죄','범죄','법을 어기는 행위','법에서 하지 말라고 정한 일을 어기는 행위',array['犯','罪']),
('봉변','봉변','뜻밖의 좋지 않은 일을 당함','뜻하지 않게 곤란하거나 좋지 않은 일을 겪는 것',array['逢','變']),
('부양','부양','생활을 도와 돌봄','가족 등이 생활할 수 있도록 돌보고 도와주는 것',array['扶','養']),
('부상','부상','위로 떠오름','물속이나 아래쪽에 있던 것이 위로 떠오르는 것',array['浮','上']),
('붕우','붕우','벗과 친구','서로 가까이 지내는 친구를 이르는 말',array['朋','友'])
), upserted as (
insert into public.hanja_words(word,reading,meaning,child_explanation,content_status,source_note)
select word,reading,meaning,child_explanation,'PUBLISHED','3급 신규 예시어 보강 2차 · 앱 자체 쉬운 뜻풀이 · 2026-10-06' from words
on conflict(word,reading,meaning) do update set child_explanation=excluded.child_explanation,content_status='PUBLISHED',source_note=excluded.source_note
returning id,word,reading,meaning)
insert into public.hanja_word_map(word_id,hanja_id,position)
select hw.id,h.id,u.ord::integer from words w join upserted hw on hw.word=w.word and hw.reading=w.reading and hw.meaning=w.meaning
cross join lateral unnest(w.chars) with ordinality u(ch,ord) join public.hanja h on h.character=u.ch on conflict do nothing;