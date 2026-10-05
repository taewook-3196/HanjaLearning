-- Grade-5 example vocabulary expansion, batch 3.
-- Focuses on remaining common 5급 new Hanja with fully mapped Hanja compounds.
with words(word,reading,meaning,child_explanation,chars) as (
 values
 ('시인','시인','시를 짓는 사람','시를 쓰는 사람',array['詩','人']),
 ('표시','표시','알아볼 수 있게 나타냄','무엇인지 알 수 있도록 나타내는 것',array['表','示']),
 ('시장','시장','물건을 사고파는 곳','여러 물건을 사고파는 곳',array['市','場']),
 ('식물','식물','땅에 뿌리를 내리고 자라는 생물','나무나 풀처럼 자라는 생물',array['植','物']),
 ('신화','신화','신이나 영웅 등에 관한 옛이야기','옛날부터 전해 오는 신과 영웅 이야기',array['神','話']),
 ('신체','신체','사람의 몸','사람의 몸 전체',array['身','體']),
 ('신용','신용','믿을 수 있는 정도','사람을 믿을 수 있다고 여기는 마음',array['信','用']),
 ('신입','신입','새로 들어옴 또는 새로 들어온 사람','어떤 곳에 새로 들어온 사람',array['新','入']),
 ('실내','실내','방이나 건물의 안','건물 안쪽',array['室','內']),
 ('안전','안전','위험이 없는 상태','다치거나 위험할 걱정이 적은 상태',array['安','全']),
 ('야간','야간','밤 시간','해가 진 뒤의 밤 시간',array['夜','間']),
 ('약점','약점','부족하거나 약한 점','잘하지 못하거나 보완할 점',array['弱','點']),
 ('언어','언어','생각을 말이나 글로 나타내는 수단','생각과 마음을 전하는 말과 글',array['言','語']),
 ('영원','영원','끝없이 오래 계속됨','끝이 없을 만큼 아주 오래 이어짐',array['永','遠']),
 ('영어','영어','영국과 미국 등에서 쓰는 언어','여러 나라에서 널리 배우고 쓰는 말',array['英','語']),
 ('우정','우정','친구 사이의 정','친구끼리 서로 아끼는 마음',array['友','情']),
 ('원인','원인','어떤 일이 생긴 까닭','일이 생기게 된 까닭',array['原','因']),
 ('유명','유명','이름이 널리 알려져 있음','많은 사람이 알고 있을 만큼 이름이 알려짐',array['有','名']),
 ('육식','육식','고기를 먹음','고기를 음식으로 먹는 것',array['肉','食']),
 ('육아','육아','어린아이를 기름','어린아이를 돌보고 키우는 일',array['育','兒']),
 ('은행','은행','돈을 맡기거나 빌리는 등의 일을 하는 기관','돈을 맡기고 찾는 등의 일을 하는 곳',array['銀','行']),
 ('음악','음악','소리를 어울리게 하여 표현하는 예술','노래나 악기 소리로 느낌을 나타내는 예술',array['音','樂']),
 ('의견','의견','어떤 일에 대한 생각','어떤 일에 대해 가진 생각',array['意','見']),
 ('작품','작품','만들어 낸 예술이나 글 등의 결과물','글이나 그림처럼 만들어 낸 결과물',array['作','品']),
 ('장점','장점','좋거나 잘하는 점','다른 것보다 좋은 점',array['長','點']),
 ('재능','재능','어떤 일을 잘할 수 있는 능력','어떤 일을 잘하는 타고난 능력',array['才','能']),
 ('전원','전원','도시에서 떨어진 시골 지역','논밭이 있는 한적한 시골',array['田','園']),
 ('전기','전기','전하의 움직임으로 생기는 에너지','전등이나 전자기기를 움직이게 하는 에너지',array['電','氣']),
 ('전방','전방','앞쪽 방향','앞쪽이나 앞을 향한 방향',array['前','方']),
 ('전체','전체','모든 부분을 합친 것','빠짐없이 모두 합친 것',array['全','體']),
 ('조식','조식','아침 식사','아침에 먹는 식사',array['朝','食']),
 ('조상','조상','오래전의 부모와 그 윗대 사람들','우리보다 앞선 세대의 가족 어른들',array['祖','上']),
 ('주간','주간','낮 동안','아침부터 저녁 전까지의 낮 시간',array['晝','間']),
 ('주민','주민','어떤 지역에 사는 사람','그 지역에 살고 있는 사람',array['住','民']),
 ('죽림','죽림','대나무가 많이 자라는 숲','대나무가 모여 자라는 숲',array['竹','林']),
 ('중량','중량','물건의 무게','물건이 얼마나 무거운지를 나타낸 것',array['重','量']),
 ('직접','직접','중간에 다른 것을 거치지 않음','다른 사람이나 단계를 거치지 않고 바로 하는 것',array['直','接']),
 ('초원','초원','풀이 넓게 자라는 들판','풀이 넓게 펼쳐진 들판',array['草','原']),
 ('추석','추석','우리나라의 대표적인 가을 명절','가을에 가족과 함께 보내는 우리나라 명절',array['秋','夕']),
 ('춘계','춘계','봄철','봄 시기',array['春','季']),
 ('친구','친구','가깝게 사귀는 사람','서로 친하게 지내는 사람',array['親','舊']),
 ('태양','태양','지구에 빛과 열을 주는 별','낮에 밝게 빛나며 지구에 빛과 열을 주는 별',array['太','陽']),
 ('통행','통행','길을 오고 감','길을 지나서 오고 가는 일',array['通','行']),
 ('편리','편리','사용하거나 생활하기에 좋고 쉬움','쓰거나 생활하기 쉽고 편한 상태',array['便','利']),
 ('평지','평지','평평한 땅','높낮이가 거의 없이 평평한 땅',array['平','地']),
 ('하계','하계','여름철','여름 시기',array['夏','季']),
 ('한국','한국','대한민국을 줄여 이르는 말','우리가 사는 대한민국',array['韓','國']),
 ('한자','한자','중국에서 만들어져 우리나라 등에서 사용해 온 문자','지금 배우고 있는 漢字 문자',array['漢','字']),
 ('합계','합계','여러 수를 모두 합한 값','여러 수를 더한 전체 값',array['合','計']),
 ('해수','해수','바닷물','바다에 있는 짠물',array['海','水']),
 ('행동','행동','몸을 움직여 하는 일','생각한 것을 몸으로 옮겨 하는 일',array['行','動']),
 ('대화','대화','서로 말을 주고받음','두 사람 이상이 서로 이야기를 나누는 것',array['對','話']),
 ('평화','평화','싸움이나 갈등 없이 편안한 상태','서로 싸우지 않고 편안하게 지내는 상태',array['平','和']),
 ('생활','생활','살아가며 하는 여러 활동','날마다 살아가며 하는 일들',array['生','活']),
 ('황색','황색','노란색','노란 빛깔',array['黃','色']),
 ('회의','회의','여러 사람이 모여 의논함','여러 사람이 모여 생각을 나누는 일',array['會','議']),
 ('효도','효도','부모를 정성껏 섬김','부모님을 사랑하고 잘 모시는 일',array['孝','道']),
 ('후반','후반','전체를 둘로 나눈 뒤쪽 부분','처음과 끝을 반으로 나눴을 때 뒤쪽',array['後','半'])
)
insert into public.hanja_words(word,reading,meaning,child_explanation,content_status,source_note)
select word,reading,meaning,child_explanation,'PUBLISHED','초등 학습용 대표 어휘 3차 · 앱 자체 쉬운 뜻풀이 · 2026-10-05'
from words
on conflict(word,reading,meaning) do update set child_explanation=excluded.child_explanation,content_status='PUBLISHED',source_note=excluded.source_note;

with words(word,reading,meaning,chars) as (
 values
)
insert into public.hanja_word_map(word_id,hanja_id,position)
select hw.id,h.id,u.ord::integer
from words w join public.hanja_words hw on hw.word=w.word and hw.reading=w.reading and hw.meaning=w.meaning
cross join lateral unnest(w.chars) with ordinality as u(ch,ord)
join public.hanja h on h.character=u.ch
on conflict do nothing;

do $body$
declare v_words integer;v_bad integer;
begin
 select count(*) into v_words from public.hanja_words where source_note='초등 학습용 대표 어휘 3차 · 앱 자체 쉬운 뜻풀이 · 2026-10-05';
 if v_words<>58 then raise exception 'Expected 58 batch-3 example words, got %',v_words;end if;
 select count(*) into v_bad from public.hanja_words w
 where w.source_note='초등 학습용 대표 어휘 3차 · 앱 자체 쉬운 뜻풀이 · 2026-10-05'
 and (select count(*) from public.hanja_word_map m where m.word_id=w.id)<>char_length(w.word);
 if v_bad<>0 then raise exception 'Batch-3 example word mapping incomplete: %',v_bad;end if;
end $body$;
