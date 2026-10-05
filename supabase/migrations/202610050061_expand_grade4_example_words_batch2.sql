-- DAEHAN grade-4 representative example words, batch 2.
with words(word,reading,meaning,child_explanation,chars) as (values
('부자','부자','재산이 많은 사람','돈이나 재산을 많이 가진 사람',array['富','者']),
('비용','비용','어떤 일에 드는 돈','물건을 사거나 일을 할 때 드는 돈',array['費','用']),
('빈곤','빈곤','생활에 필요한 것이 부족함','생활에 필요한 돈이나 물건이 매우 부족한 상태',array['貧','困']),
('사진','사진','카메라로 찍은 그림','사람이나 모습을 카메라로 찍은 것',array['寫','眞']),
('감사','감사','고마운 마음을 나타냄','도움을 받아 고마운 마음을 표현하는 것',array['感','謝']),
('교사','교사','학생을 가르치는 사람','학교에서 학생을 가르치는 선생님',array['敎','師']),
('조사','조사','자세히 살펴 알아봄','사실을 알기 위해 자세히 찾아보는 일',array['調','査']),
('생산','생산','물건이나 서비스를 만들어 냄','필요한 물건 등을 만들어 내는 일',array['生','産']),
('상금','상금','상으로 주는 돈','잘한 일의 상으로 주는 돈',array['賞','金']),
('상품','상품','팔기 위해 만든 물건','가게 등에서 돈을 받고 파는 물건',array['商','品']),
('일상','일상','날마다 이어지는 생활','매일 되풀이되는 평소 생활',array['日','常']),
('순서','순서','차례','먼저와 나중을 정해 놓은 차례',array['順','序']),
('선행','선행','착한 행동','다른 사람에게 도움이 되는 착한 행동',array['善','行']),
('설명','설명','알기 쉽게 풀어 말함','내용을 이해하기 쉽게 말해 주는 것',array['說','明']),
('성인','성인','지혜와 덕이 뛰어난 사람','옛날에 지혜와 덕이 매우 뛰어난 사람을 이르던 말',array['聖','人']),
('성대','성대','기운이나 규모가 매우 큼','행사나 모임의 규모가 크고 활발한 상태',array['盛','大']),
('음성','음성','사람이 내는 목소리','사람의 입에서 나오는 목소리',array['音','聲']),
('정성','정성','온 마음을 다하는 마음','어떤 일을 위해 마음과 힘을 다하는 태도',array['精','誠']),
('세력','세력','영향을 미치는 힘','다른 사람이나 일에 영향을 줄 수 있는 힘',array['勢','力']),
('세월','세월','흘러가는 시간','해가 지나며 흘러가는 시간',array['歲','月']),
('약속','약속','서로 지키기로 정한 일','앞으로 어떤 일을 하기로 서로 정하는 것',array['約','束']),
('수업','수업','가르치고 배우는 활동','학교에서 선생님과 함께 배우는 시간',array['授','業']),
('수비','수비','상대의 공격을 막음','경기에서 상대가 득점하지 못하게 막는 것',array['守','備']),
('시험','시험','배운 정도를 알아보는 평가','배운 내용을 얼마나 아는지 확인하는 평가',array['試','驗']),
('인식','인식','알고 이해함','어떤 것을 알아보고 뜻을 이해하는 것',array['認','識']),
('악행','악행','나쁜 행동','다른 사람에게 해를 주는 나쁜 행동',array['惡','行']),
('안구','안구','눈알','눈 안에서 빛을 받아들이는 둥근 부분',array['眼','球']),
('양육','양육','아이를 기름','아이를 돌보고 가르치며 키우는 일',array['養','育']),
('열기','열기','뜨거운 기운','뜨거운 곳에서 느껴지는 기운',array['熱','氣']),
('낙엽','낙엽','나무에서 떨어진 잎','가을 등에 나무에서 떨어진 잎',array['落','葉']),
('예술','예술','아름다움을 표현하는 활동','그림 음악 글 등으로 생각과 아름다움을 표현하는 활동',array['藝','術']),
('가옥','가옥','사람이 사는 집','사람이 생활하기 위해 지은 집',array['家','屋']),
('우천','우천','비가 오는 날씨','비가 내리는 날씨',array['雨','天']),
('영웅','영웅','용기 있고 훌륭한 사람','큰 용기와 능력으로 훌륭한 일을 한 사람',array['英','雄']),
('소원','소원','이루어지기를 바라는 일','마음속으로 꼭 이루어지기를 바라는 것',array['所','願']),
('위인','위인','훌륭한 일을 한 사람','큰 업적을 남겨 본받을 만한 사람',array['偉','人'])
), upserted as (
 insert into public.hanja_words(word,reading,meaning,child_explanation,content_status,source_note)
 select word,reading,meaning,child_explanation,'PUBLISHED','4급 예시어 2차 · 앱 자체 쉬운 뜻풀이 · 2026-10-05' from words
 on conflict(word,reading,meaning) do update set child_explanation=excluded.child_explanation,content_status='PUBLISHED',source_note=excluded.source_note returning id,word,reading,meaning
)
insert into public.hanja_word_map(word_id,hanja_id,position)
select hw.id,h.id,u.ord::integer from words w join upserted hw on hw.word=w.word and hw.reading=w.reading and hw.meaning=w.meaning
cross join lateral unnest(w.chars) with ordinality u(ch,ord) join public.hanja h on h.character=u.ch on conflict do nothing;
