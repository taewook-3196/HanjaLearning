-- Expand cumulative DAEHAN grade-4 example-word coverage (batch 6).
with words(word,reading,meaning,child_explanation,chars) as (values
('삼각','삼각','세 개의 각','세 개의 각이 있는 모양이나 관계',array['三','角']),
('여객','여객','여행하는 손님','교통수단을 타고 여행하는 사람',array['旅','客']),
('결정','결정','생각한 뒤 정함','여러 가지를 생각한 뒤 하나로 정하는 것',array['決','定']),
('결과','결과','일이 끝난 뒤 생긴 것','어떤 일을 한 뒤에 나타난 내용이나 상태',array['結','果']),
('경중','경중','가벼움과 무거움','일이나 정도가 가벼운지 무거운지를 나타내는 말',array['輕','重']),
('경로','경로','노인을 공경함','나이가 많은 어른을 존중하고 공경하는 것',array['敬','老']),
('고행','고행','괴로움을 견디며 하는 수행','힘든 일을 견디며 몸과 마음을 닦는 것',array['苦','行']),
('고려','고려','생각하여 헤아림','여러 사정을 잘 생각하여 판단하는 것',array['考','慮']),
('곡선','곡선','굽은 선','곧지 않고 부드럽게 굽어 있는 선',array['曲','線']),
('군수','군수','군을 맡아 다스리는 사람','군 단위 지역의 행정을 맡는 책임자',array['郡','守']),
('귀중','귀중','매우 귀하고 중요함','아주 소중하고 가치가 큰 것',array['貴','重']),
('근본','근본','사물의 바탕이나 뿌리','어떤 것이 이루어지는 가장 기본이 되는 바탕',array['根','本']),
('길인','길인','복되고 좋은 사람','좋은 복을 지닌 사람을 이르는 말',array['吉','人']),
('식당','식당','음식을 먹는 곳','음식을 만들어 팔거나 먹을 수 있는 곳',array['食','堂']),
('대접','대접','상대에게 알맞게 대함','손님이나 다른 사람을 정성껏 맞아 대하는 것',array['待','接']),
('덕목','덕목','지켜야 할 좋은 품성','사람이 갖추고 실천하면 좋은 마음가짐이나 행동',array['德','目']),
('도수','도수','정도를 나타내는 수','각도나 온도처럼 정도를 숫자로 나타낸 것',array['度','數']),
('동화','동화','어린이를 위한 이야기','어린이가 읽기 좋게 만든 이야기',array['童','話']),
('양식','양식','좋은 방식이나 본보기','생활이나 행동에서 본받을 만한 좋은 방식',array['良','式']),
('역년','역년','지나온 여러 해','어떤 일이 이어져 온 햇수를 나타내는 말',array['歷','年']),
('노동','노동','몸이나 머리를 써서 일함','필요한 것을 만들거나 일을 이루기 위해 힘써 일하는 것',array['勞','動']),
('녹색','녹색','초록빛 색','풀이나 나뭇잎처럼 푸른빛을 띠는 색',array['綠','色']),
('유수','유수','흐르는 물','강이나 시내처럼 흘러가는 물',array['流','水']),
('이화','이화','오얏나무의 꽃','오얏나무에 피는 꽃',array['李','花']),
('망실','망실','잃어버림','가지고 있던 것을 잃어 없어지게 하는 것',array['亡','失'])
), upserted as (
insert into public.hanja_words(word,reading,meaning,child_explanation,content_status,source_note)
select word,reading,meaning,child_explanation,'PUBLISHED','4급 누적 예시어 보강 6차 · 앱 자체 쉬운 뜻풀이 · 2026-10-05' from words
on conflict(word,reading,meaning) do update set child_explanation=excluded.child_explanation,content_status='PUBLISHED',source_note=excluded.source_note
returning id,word,reading,meaning
)
insert into public.hanja_word_map(word_id,hanja_id,position)
select hw.id,h.id,u.ord::integer from words w
join upserted hw on hw.word=w.word and hw.reading=w.reading and hw.meaning=w.meaning
cross join lateral unnest(w.chars) with ordinality u(ch,ord)
join public.hanja h on h.character=u.ch
on conflict do nothing;