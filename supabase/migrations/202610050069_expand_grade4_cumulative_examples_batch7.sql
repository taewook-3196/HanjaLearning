-- Expand cumulative DAEHAN grade-4 example-word coverage (batch 7).
with words(word,reading,meaning,child_explanation,chars) as (values
('매입','매입','물건을 사들임','필요한 물건이나 재료를 돈을 주고 사들이는 것',array['買','入']),
('매출','매출','물건을 팔아 얻은 금액','물건이나 서비스를 팔아서 생긴 금액',array['賣','出']),
('박질','박질','꾸밈없이 소박한 바탕','화려하게 꾸미지 않은 소박한 성질',array['朴','質']),
('발생','발생','어떤 일이 생겨남','없던 일이나 현상이 새로 생기는 것',array['發','生']),
('병사','병사','군대의 군사','군대에서 임무를 수행하는 군인',array['兵','士']),
('병원','병원','병을 살피고 치료하는 곳','아픈 사람을 진찰하고 치료하는 곳',array['病','院']),
('복기','복기','복되고 좋은 기운','행복과 좋은 일이 따르는 기운을 이르는 말',array['福','氣']),
('봉사','봉사','남을 위해 힘써 도움','다른 사람이나 사회를 위해 스스로 힘써 돕는 일',array['奉','仕']),
('빙수','빙수','얼음을 갈아 만든 음식','곱게 간 얼음에 여러 재료를 얹어 먹는 음식',array['冰','水']),
('사관','사관','관직에서 일하는 사람','나라의 관직을 맡아 일하는 사람을 이르는 말',array['仕','官']),
('사고','사고','생각하고 판단함','어떤 문제를 생각하고 판단하는 과정',array['思','考']),
('사서','사서','역사를 기록한 책','지난 시대의 일을 기록해 놓은 역사책',array['史','書']),
('사용','사용','사람이나 물건을 씀','필요한 목적에 맞게 사람이나 물건을 쓰는 것',array['使','用']),
('설산','설산','눈으로 덮인 산','눈이 많이 쌓여 하얗게 덮인 산',array['雪','山']),
('성찰','성찰','자신의 마음과 행동을 살핌','자신이 한 생각과 행동을 되돌아보고 살피는 것',array['省','察']),
('세면','세면','얼굴을 씻음','물로 얼굴을 깨끗하게 씻는 것',array['洗','面']),
('소화','소화','불을 꺼 없앰','난 불을 꺼서 사라지게 하는 것',array['消','火']),
('손자','손자','아들이나 딸의 아들','자녀가 낳은 아들을 이르는 말',array['孫','子']),
('수목','수목','나무를 통틀어 이르는 말','여러 종류의 나무를 한데 이르는 말',array['樹','木']),
('숙박','숙박','다른 곳에서 잠을 잠','집이 아닌 곳에서 머물며 잠을 자는 것',array['宿','泊']),
('승리','승리','겨루어 이김','경기나 경쟁에서 상대를 이기는 것',array['勝','利']),
('시작','시작','처음으로 일을 함','어떤 일을 처음으로 하거나 움직이기 시작하는 것',array['始','作']),
('신하','신하','임금을 섬기던 사람','옛날에 임금을 도와 나라의 일을 하던 사람',array['臣','下']),
('실과','실과','열매를 맺는 과일','나무나 풀에서 열리는 먹을 수 있는 열매',array['實','果']),
('약품','약품','치료 등에 쓰는 약','병을 치료하거나 예방하는 데 사용하는 약',array['藥','品'])
), upserted as (
insert into public.hanja_words(word,reading,meaning,child_explanation,content_status,source_note)
select word,reading,meaning,child_explanation,'PUBLISHED','4급 누적 예시어 보강 7차 · 앱 자체 쉬운 뜻풀이 · 2026-10-05' from words
on conflict(word,reading,meaning) do update set child_explanation=excluded.child_explanation,content_status='PUBLISHED',source_note=excluded.source_note
returning id,word,reading,meaning)
insert into public.hanja_word_map(word_id,hanja_id,position)
select hw.id,h.id,u.ord::integer from words w join upserted hw on hw.word=w.word and hw.reading=w.reading and hw.meaning=w.meaning
cross join lateral unnest(w.chars) with ordinality u(ch,ord) join public.hanja h on h.character=u.ch on conflict do nothing;