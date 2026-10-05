-- Ensure every DAEHAN through-grade-5 Hanja appears in at least one child-friendly example word.
with words(word,reading,meaning,child_explanation,chars) as (
 values
 ('구월','구월','아홉 번째 달','일 년의 아홉 번째 달',array['九','月']),
 ('유월','유월','여섯 번째 달','일 년의 여섯 번째 달',array['六','月']),
 ('대문','대문','집의 큰 문','집이나 건물의 바깥쪽 큰 문',array['大','門']),
 ('사방','사방','동서남북의 네 방향','동서남북 모든 방향',array['四','方']),
 ('삼월','삼월','세 번째 달','일 년의 세 번째 달',array['三','月']),
 ('오월','오월','다섯 번째 달','일 년의 다섯 번째 달',array['五','月']),
 ('이월','이월','두 번째 달','일 년의 두 번째 달',array['二','月']),
 ('칠월','칠월','일곱 번째 달','일 년의 일곱 번째 달',array['七','月']),
 ('팔월','팔월','여덟 번째 달','일 년의 여덟 번째 달',array['八','月']),
 ('견공','견공','개를 높여 이르는 말','개를 조금 높여 부르는 말',array['犬','公']),
 ('자기','자기','바로 그 사람 자신','나 또는 바로 그 사람 자신',array['自','己']),
 ('마차','마차','말이 끄는 수레','말이 끌고 가는 수레',array['馬','車']),
 ('석산','석산','돌이 많은 산','돌이 많이 있는 산',array['石','山']),
 ('산양','산양','산에 사는 양과 비슷한 동물','산에 사는 양처럼 생긴 동물',array['山','羊']),
 ('어시장','어시장','생선을 사고파는 시장','물고기와 해산물을 사고파는 시장',array['魚','市','場']),
 ('옥석','옥석','옥과 돌','귀한 옥과 보통 돌',array['玉','石']),
 ('우육','우육','소고기','소의 고기',array['牛','肉']),
 ('이목','이목','귀와 눈','귀와 눈, 또는 사람들의 관심',array['耳','目']),
 ('하천','하천','강과 시내','물이 흐르는 강이나 시내',array['河','川']),
 ('차도','차도','차가 다니는 길','자동차가 다니는 길',array['車','道']),
 ('두건','두건','머리에 쓰는 천','머리에 둘러 쓰는 천',array['頭','巾']),
 ('고서','고서','오래된 책','옛날에 만들어진 오래된 책',array['古','書']),
 ('연말','연말','한 해의 끝 무렵','한 해가 끝나 가는 때',array['年','末']),
 ('불안','불안','마음이 편하지 않음','걱정되어 마음이 편하지 않은 상태',array['不','安']),
 ('군사','군사','군대에서 나라를 지키는 사람','군대에서 나라를 지키는 사람',array['軍','士']),
 ('왕국','왕국','왕이 다스리는 나라','왕이 다스리는 나라',array['王','國']),
 ('왕위','왕위','왕의 자리','왕이 나라를 다스리는 자리',array['王','位']),
 ('치수','치수','길이의 크기','물건의 길이나 크기를 재어 나타낸 값',array['寸','數']),
 ('경성','경성','서울의 옛 이름','예전에 서울을 부르던 이름',array['京','城']),
 ('농민','농민','농사를 짓는 사람','논밭에서 농사를 짓는 사람',array['農','民']),
 ('도공','도공','칼을 만드는 장인','칼을 만드는 기술을 가진 사람',array['刀','工']),
 ('동리','동리','마을','사람들이 모여 사는 마을',array['洞','里']),
 ('이장','이장','마을을 대표하는 사람','마을의 일을 맡아 대표하는 사람',array['里','長']),
 ('모색','모색','털의 빛깔','동물의 털에 나타나는 빛깔',array['毛','色']),
 ('미식','미식','맛있는 음식을 즐겨 먹음','맛있는 음식을 골라 즐겨 먹는 것',array['美','食']),
 ('읍내','읍내','읍의 중심이 되는 곳','읍에서 가게와 집이 많이 모인 중심 지역',array['邑','內']),
 ('농촌','농촌','농사를 많이 짓는 마을','논밭이 많고 농사를 주로 짓는 마을',array['農','村']),
 ('패류','패류','조개 종류의 동물','조개처럼 단단한 껍데기가 있는 동물',array['貝','類']),
 ('혈색','혈색','얼굴에 드러나는 피의 기운','건강 상태에 따라 얼굴에 나타나는 빛깔',array['血','色']),
 ('화초','화초','꽃이 피는 풀이나 관상용 식물','꽃이나 잎을 보기 위해 기르는 식물',array['花','草'])
)
insert into public.hanja_words(word,reading,meaning,child_explanation,content_status,source_note)
select word,reading,meaning,child_explanation,'PUBLISHED','5급 250자 예시어 커버리지 보강 · 앱 자체 쉬운 뜻풀이 · 2026-10-05'
from words
on conflict(word,reading,meaning) do update set child_explanation=excluded.child_explanation,content_status='PUBLISHED',source_note=excluded.source_note;

with words(word,reading,meaning,chars) as (
 values
 ('구월','구월','아홉 번째 달',array['九','月']),('유월','유월','여섯 번째 달',array['六','月']),('대문','대문','집의 큰 문',array['大','門']),('사방','사방','동서남북의 네 방향',array['四','方']),('삼월','삼월','세 번째 달',array['三','月']),('오월','오월','다섯 번째 달',array['五','月']),('이월','이월','두 번째 달',array['二','月']),('칠월','칠월','일곱 번째 달',array['七','月']),('팔월','팔월','여덟 번째 달',array['八','月']),('견공','견공','개를 높여 이르는 말',array['犬','公']),('자기','자기','바로 그 사람 자신',array['自','己']),('마차','마차','말이 끄는 수레',array['馬','車']),('석산','석산','돌이 많은 산',array['石','山']),('산양','산양','산에 사는 양과 비슷한 동물',array['山','羊']),('어시장','어시장','생선을 사고파는 시장',array['魚','市','場']),('옥석','옥석','옥과 돌',array['玉','石']),('우육','우육','소고기',array['牛','肉']),('이목','이목','귀와 눈',array['耳','目']),('하천','하천','강과 시내',array['河','川']),('차도','차도','차가 다니는 길',array['車','道']),('두건','두건','머리에 쓰는 천',array['頭','巾']),('고서','고서','오래된 책',array['古','書']),('연말','연말','한 해의 끝 무렵',array['年','末']),('불안','불안','마음이 편하지 않음',array['不','安']),('군사','군사','군대에서 나라를 지키는 사람',array['軍','士']),('왕국','왕국','왕이 다스리는 나라',array['王','國']),('왕위','왕위','왕의 자리',array['王','位']),('치수','치수','길이의 크기',array['寸','數']),('경성','경성','서울의 옛 이름',array['京','城']),('농민','농민','농사를 짓는 사람',array['農','民']),('도공','도공','칼을 만드는 장인',array['刀','工']),('동리','동리','마을',array['洞','里']),('이장','이장','마을을 대표하는 사람',array['里','長']),('모색','모색','털의 빛깔',array['毛','色']),('미식','미식','맛있는 음식을 즐겨 먹음',array['美','食']),('읍내','읍내','읍의 중심이 되는 곳',array['邑','內']),('농촌','농촌','농사를 많이 짓는 마을',array['農','村']),('패류','패류','조개 종류의 동물',array['貝','類']),('혈색','혈색','얼굴에 드러나는 피의 기운',array['血','色']),('화초','화초','꽃이 피는 풀이나 관상용 식물',array['花','草'])
)
insert into public.hanja_word_map(word_id,hanja_id,position)
select hw.id,h.id,u.ord::integer from words w
join public.hanja_words hw on hw.word=w.word and hw.reading=w.reading and hw.meaning=w.meaning
cross join lateral unnest(w.chars) with ordinality as u(ch,ord)
join public.hanja h on h.character=u.ch
on conflict do nothing;

do $body$
declare v_words integer;v_bad integer;v_uncovered integer;
begin
 select count(*) into v_words from public.hanja_words where source_note='5급 250자 예시어 커버리지 보강 · 앱 자체 쉬운 뜻풀이 · 2026-10-05';
 if v_words<>40 then raise exception 'Expected 40 coverage words, got %',v_words;end if;
 select count(*) into v_bad from public.hanja_words w where w.source_note='5급 250자 예시어 커버리지 보강 · 앱 자체 쉬운 뜻풀이 · 2026-10-05'
 and (select count(*) from public.hanja_word_map m where m.word_id=w.id)<>char_length(w.word);
 if v_bad<>0 then raise exception 'Coverage word mapping incomplete: %',v_bad;end if;
 select count(*) into v_uncovered
 from public.grade_hanja gh join public.exam_grades eg on eg.id=gh.grade_id join public.exam_providers ep on ep.id=eg.provider_id
 where ep.code='DAEHAN' and eg.code='5'
 and not exists(select 1 from public.hanja_word_map hwm join public.hanja_words hw on hw.id=hwm.word_id where hwm.hanja_id=gh.hanja_id and hw.content_status='PUBLISHED');
 if v_uncovered<>0 then raise exception 'Grade-5 Hanja still lack example words: %',v_uncovered;end if;
end $body$;
