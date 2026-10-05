-- Replace selected uncommon examples with clearer compounds available in the 1000-char master.
delete from public.hanja_word_map where word_id in (1188,1189,1198,1202,1204,1217,1230,1244);

with words(word,reading,meaning,child_explanation,chars) as (values
('주점','주점','술을 파는 가게','술이나 음식을 파는 가게',array['酒','店']),
('즉시','즉시','바로 그때','어떤 일이 일어난 바로 그때',array['卽','時']),
('차처','차처','이곳','바로 이 장소나 곳을 이르는 말',array['此','處']),
('처자','처자','아내와 자식','아내와 자녀를 함께 이르는 말',array['妻','子']),
('천해','천해','얕은 바다','깊이가 얕은 바다',array['淺','海']),
('풍림','풍림','단풍나무 숲','단풍나무가 많이 자라는 숲',array['楓','林']),
('혹자','혹자','어떤 사람','어떤 한 사람을 가리키는 말',array['或','者']),
('갑골','갑골','거북 등딱지와 짐승 뼈','옛날 글자를 새기던 거북 등딱지와 짐승 뼈',array['甲','骨'])
), upserted as (
insert into public.hanja_words(word,reading,meaning,child_explanation,content_status,source_note)
select word,reading,meaning,child_explanation,'PUBLISHED','예시어 품질 교정 · 2026-10-06' from words
on conflict(word,reading,meaning) do update set child_explanation=excluded.child_explanation,content_status='PUBLISHED',source_note=excluded.source_note
returning id,word,reading,meaning)
insert into public.hanja_word_map(word_id,hanja_id,position)
select hw.id,h.id,u.ord::integer from words w join upserted hw on hw.word=w.word and hw.reading=w.reading and hw.meaning=w.meaning
cross join lateral unnest(w.chars) with ordinality u(ch,ord) join public.hanja h on h.character=u.ch
on conflict do nothing;