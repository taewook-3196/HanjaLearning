update public.hanja_words set word='해당',reading='해당',meaning='어떤 조건이나 대상에 맞음',child_explanation='어떤 조건이나 대상에 들어맞는 것',hanja_form='該當' where id=1427;
update public.hanja_words set word='지도',reading='지도',meaning='땅의 모습을 일정한 비율로 줄여 나타낸 그림',child_explanation='지역의 위치와 길, 지형 등을 알아보기 쉽게 그린 그림',hanja_form='地圖' where id=1440;
update public.hanja_words set meaning='일이나 작품의 마지막 부분',child_explanation='일이나 작품이 끝나 가는 마지막 부분을 이르는 말' where id=1444;
update public.hanja_words set word='미소',reading='미소',meaning='소리 없이 빙긋이 웃음',child_explanation='소리를 내지 않고 살짝 웃는 것',hanja_form='微笑' where id=1446;
update public.hanja_words set word='호적',reading='호적',meaning='가족 관계와 신분 사항을 적어 두던 공적인 장부',child_explanation='예전에 가족 관계와 신분 정보를 기록하던 공적인 장부',hanja_form='戶籍' where id=1450;
delete from public.hanja_word_map where word_id in (1427,1440,1446,1450);
insert into public.hanja_word_map(word_id,hanja_id,position)
select v.word_id,h.id,v.position from (values
(1440,'地',1),(1440,'圖',2),(1446,'笑',2),(1450,'戶',1)
) v(word_id,ch,position) join public.hanja h on h.character=v.ch;
