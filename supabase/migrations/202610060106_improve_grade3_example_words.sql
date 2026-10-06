update public.hanja_words set word='잠복',reading='잠복',meaning='몸을 숨기고 기다림',child_explanation='몸을 드러내지 않고 숨어서 기다리는 것',hanja_form='潛伏' where id=1311;
update public.hanja_words set word='사시',reading='사시',meaning='십이지의 사에 해당하는 시각',child_explanation='십이지에서 사에 해당하는 시간',hanja_form='巳時' where id=1316;
update public.hanja_words set word='숙사',reading='숙사',meaning='여러 사람이 함께 묵는 숙소',child_explanation='여러 사람이 함께 생활하며 묵는 곳',hanja_form='宿舍' where id=1319;
update public.hanja_words set word='술시',reading='술시',meaning='십이지의 술에 해당하는 시각',child_explanation='십이지에서 술에 해당하는 시간',hanja_form='戌時' where id=1337;
update public.hanja_words set word='주행',reading='주행',meaning='달리거나 움직여 감',child_explanation='자동차 등이 달리거나 움직여 가는 것',hanja_form='走行' where id=1378;
update public.hanja_words set word='주홍',reading='주홍',meaning='밝고 선명한 붉은색',child_explanation='밝고 선명한 붉은색',hanja_form='朱紅' where id=1379;
update public.hanja_words set word='군중',reading='군중',meaning='한곳에 모인 많은 사람',child_explanation='한곳에 많이 모여 있는 사람들의 무리',hanja_form='群衆' where id=1380;
delete from public.hanja_word_map where word_id in (1311,1316,1319,1337,1378,1379,1380);
insert into public.hanja_word_map(word_id,hanja_id,position) select v.word_id,h.id,v.position from (values (1311,'伏',2),(1316,'巳',1),(1316,'時',2),(1319,'宿',1),(1319,'舍',2),(1337,'戌',1),(1337,'時',2),(1378,'走',1),(1378,'行',2),(1379,'朱',1),(1379,'紅',2),(1380,'群',1),(1380,'衆',2)) v(word_id,ch,position) join public.hanja h on h.character=v.ch;