-- DAEHAN grade-4 representative example words, batch 4.
with words(word,reading,meaning,child_explanation,chars) as (values
('비상','비상','뜻밖의 긴급한 상황','갑자기 위험한 일이 생긴 긴급한 상황',array['非','常']),
('시야','시야','눈으로 볼 수 있는 범위','눈으로 한눈에 볼 수 있는 범위',array['視','野']),
('시비','시비','옳고 그름','무엇이 옳고 그른지를 따지는 것',array['是','非']),
('여분','여분','쓰고 남는 몫','필요한 것보다 더 준비되어 남는 것',array['餘','分']),
('행위','행위','사람이 하는 행동','사람이 뜻을 가지고 하는 행동',array['行','爲']),
('은혜','은혜','고맙게 받은 도움','다른 사람에게서 받은 고마운 도움',array['恩','惠']),
('의리','의리','사람 사이에서 지켜야 할 도리','친구나 사람 사이에서 바르게 지켜야 할 도리',array['義','理']),
('이동','이동','장소를 옮김','한 곳에서 다른 곳으로 옮겨 가는 것',array['移','動']),
('자매','자매','여자 형제','언니와 여동생 같은 여자 형제',array['姊','妹']),
('재산','재산','가지고 있는 돈이나 물건','사람이 가지고 있는 돈이나 값진 물건',array['財','産']),
('재해','재해','큰 피해를 주는 재난','자연 현상 등으로 큰 피해가 생기는 일',array['災','害']),
('저온','저온','낮은 온도','보통보다 낮은 온도',array['低','溫']),
('저금','저금','돈을 모아 둠','나중에 쓰려고 돈을 모아 두는 것',array['貯','金']),
('전달','전달','다른 사람에게 전해 줌','말이나 물건을 다른 사람에게 전해 주는 것',array['傳','達']),
('친절','친절','상냥하고 정성스럽게 대함','다른 사람을 따뜻하고 상냥하게 대하는 태도',array['親','切']),
('계절','계절','봄 여름 가을 겨울 같은 때','날씨 변화에 따라 나눈 봄 여름 가을 겨울',array['季','節']),
('정지','정지','움직임을 멈춤','움직이던 것이 멈추는 것',array['停','止']),
('정치','정치','나라나 사회를 다스리는 일','나라와 사회의 일을 정하고 운영하는 활동',array['政','治']),
('조력','조력','도와주는 힘','어떤 일을 잘하도록 옆에서 도와주는 힘',array['助','力']),
('조류','조류','새의 무리','새에 속하는 동물을 통틀어 이르는 말',array['鳥','類']),
('조기','조기','이른 때','보통보다 이른 시기',array['早','期']),
('존재','존재','실제로 있음','사람이나 사물이 실제로 있는 것',array['存','在']),
('종류','종류','같은 특징끼리 나눈 갈래','비슷한 특징을 가진 것끼리 나눈 갈래',array['種','類']),
('좌석','좌석','앉는 자리','사람이 앉도록 마련된 자리',array['坐','席']),
('죄인','죄인','죄를 지은 사람','법이나 규칙을 어긴 죄를 지은 사람',array['罪','人']),
('주간','주간','한 주 동안','월요일부터 일요일처럼 한 주에 해당하는 기간',array['週','間']),
('증가','증가','수나 양이 늘어남','수나 양이 전보다 많아지는 것',array['增','加']),
('의지','의지','어떤 일을 하려는 굳은 마음','목표를 이루려고 마음먹고 계속하려는 힘',array['意','志']),
('지극','지극','정도가 매우 큼','마음이나 정도가 아주 깊고 큰 상태',array['至','極']),
('진행','진행','앞으로 나아가며 일을 계속함','정해진 순서에 따라 일을 계속해 나가는 것',array['進','行'])
), upserted as (
insert into public.hanja_words(word,reading,meaning,child_explanation,content_status,source_note)
select word,reading,meaning,child_explanation,'PUBLISHED','4급 예시어 4차 · 앱 자체 쉬운 뜻풀이 · 2026-10-05' from words
on conflict(word,reading,meaning) do update set child_explanation=excluded.child_explanation,content_status='PUBLISHED',source_note=excluded.source_note returning id,word,reading,meaning
)
insert into public.hanja_word_map(word_id,hanja_id,position)
select hw.id,h.id,u.ord::integer from words w join upserted hw on hw.word=w.word and hw.reading=w.reading and hw.meaning=w.meaning cross join lateral unnest(w.chars) with ordinality u(ch,ord) join public.hanja h on h.character=u.ch on conflict do nothing;