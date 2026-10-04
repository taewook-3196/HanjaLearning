with p as (
  select id from public.exam_providers where code = 'DAEHAN'
), g as (
  select eg.id, eg.code from public.exam_grades eg join p on p.id = eg.provider_id
)
insert into public.exam_specs
(grade_id, exam_mode, question_count, time_limit_minutes, passing_percent, objective_count, subjective_count, source_year, source_url)
select g.id, v.exam_mode, v.questions, v.minutes, 70, v.questions, 0, 2026, v.source_url
from g
join (values
 ('8','FIELD',25,40,'https://www.hanja.ne.kr/apply/info01.asp'),
 ('7','FIELD',25,40,'https://www.hanja.ne.kr/apply/info01.asp'),
 ('6','FIELD',50,40,'https://www.hanja.ne.kr/apply/info01.asp'),
 ('PRE5','FIELD',50,40,'https://www.hanja.ne.kr/apply/info01.asp'),
 ('5','FIELD',50,40,'https://www.hanja.ne.kr/apply/info01.asp'),
 ('PRE4','FIELD',50,40,'https://www.hanja.ne.kr/apply/info01.asp'),
 ('4','FIELD',50,40,'https://www.hanja.ne.kr/apply/info01.asp'),
 ('PRE3','FIELD',50,40,'https://www.hanja.ne.kr/apply/info01.asp'),
 ('3','FIELD',50,40,'https://www.hanja.ne.kr/apply/info01.asp'),
 ('8','ONLINE',25,15,'https://www.hanja.ne.kr/info/info01_online.asp'),
 ('7','ONLINE',25,15,'https://www.hanja.ne.kr/info/info01_online.asp'),
 ('6','ONLINE',50,25,'https://www.hanja.ne.kr/info/info01_online.asp'),
 ('PRE5','ONLINE',50,25,'https://www.hanja.ne.kr/info/info01_online.asp'),
 ('5','ONLINE',50,25,'https://www.hanja.ne.kr/info/info01_online.asp'),
 ('PRE4','ONLINE',50,25,'https://www.hanja.ne.kr/info/info01_online.asp'),
 ('4','ONLINE',50,25,'https://www.hanja.ne.kr/info/info01_online.asp'),
 ('PRE3','ONLINE',50,25,'https://www.hanja.ne.kr/info/info01_online.asp'),
 ('3','ONLINE',50,25,'https://www.hanja.ne.kr/info/info01_online.asp')
) as v(code, exam_mode, questions, minutes, source_url) on v.code = g.code
on conflict (grade_id, exam_mode) do update set
 question_count=excluded.question_count,
 time_limit_minutes=excluded.time_limit_minutes,
 passing_percent=excluded.passing_percent,
 objective_count=excluded.objective_count,
 subjective_count=excluded.subjective_count,
 source_year=excluded.source_year,
 source_url=excluded.source_url,
 verified_at=current_date;
