-- Complete DAEHAN grade-4 new-at-grade example-word coverage.
with words(word,reading,meaning,child_explanation,chars) as (values
('관문','관문','드나드는 중요한 문이나 길목','어떤 곳으로 들어가거나 다음 단계로 가기 위해 거쳐야 하는 중요한 곳',array['關','門']),
('대교','대교','큰 다리','강이나 바다 등을 건너도록 크게 만든 다리',array['大','橋']),
('도국','도국','섬으로 이루어진 나라','섬이나 여러 섬을 중심으로 이루어진 나라',array['島','國']),
('비례','비례','한쪽이 변할 때 다른 쪽도 일정하게 변하는 관계','두 양이 서로 일정한 관계를 가지며 함께 변하는 것',array['比','例']),
('비수','비수','코에서 나오는 물','코 안에서 나오는 콧물',array['鼻','水']),
('선수','선수','경기 등에 뽑혀 나가는 사람','운동 경기나 대회에 대표로 나가는 사람',array['選','手']),
('선장','선장','배를 책임지는 사람','배의 운항과 사람들을 책임지는 우두머리',array['船','長']),
('욕실','욕실','목욕하거나 씻는 방','몸을 씻거나 목욕할 수 있도록 만든 방',array['浴','室']),
('제례','제례','제사를 지내는 예법','제사를 지낼 때 따르는 절차와 예절',array['祭','禮']),
('조작','조작','기계 등을 다루어 움직임','기계나 장치를 알맞게 다루어 움직이게 하는 것',array['操','作']),
('해충','해충','사람이나 농작물에 해를 주는 벌레','사람이나 식물 등에 피해를 주는 벌레',array['害','蟲']),
('치과','치과','이와 입안을 치료하는 진료 분야','이와 잇몸 등 입안을 살피고 치료하는 곳이나 분야',array['齒','科']),
('타자','타자','야구에서 공을 치는 선수','야구에서 방망이로 공을 치는 선수',array['打','者']),
('탁상','탁상','책상이나 탁자 위','책상이나 탁자의 위쪽',array['卓','上'])
), upserted as (
insert into public.hanja_words(word,reading,meaning,child_explanation,content_status,source_note)
select word,reading,meaning,child_explanation,'PUBLISHED','4급 신규 예시어 완성 · 앱 자체 쉬운 뜻풀이 · 2026-10-05' from words
on conflict(word,reading,meaning) do update set child_explanation=excluded.child_explanation,content_status='PUBLISHED',source_note=excluded.source_note
returning id,word,reading,meaning
)
insert into public.hanja_word_map(word_id,hanja_id,position)
select hw.id,h.id,u.ord::integer from words w
join upserted hw on hw.word=w.word and hw.reading=w.reading and hw.meaning=w.meaning
cross join lateral unnest(w.chars) with ordinality u(ch,ord)
join public.hanja h on h.character=u.ch
on conflict do nothing;
