-- Seed source-verified alternate Hanja readings.
-- Only readings explicitly attested by dictionary Hanja metadata are published.

with specs(character,reading,meaning,usage_note,choice_a,choice_b,choice_c,choice_d,correct_choice,source_note) as (
 values
 ('行','항','항렬을 나타낼 때의 읽기','行列(항렬)에서 行을 읽는 소리','행','항','강','상',2,
  '국립국어원 한국어기초사전 行: 다닐 행/항렬 항, 항렬(行列) 표제어 교차검증 · 2026-10-05'),
 ('金','김','성씨로 쓰일 때의 읽기','사람의 성씨 金을 읽는 소리','금','김','근','감',2,
  '국립국어원 한국어기초사전 金: 쇠 금/성 김 한자 정보 · 2026-10-05')
)
insert into public.hanja_special_readings(hanja_id,reading,meaning,usage_note,choice_a,choice_b,choice_c,choice_d,correct_choice,content_status,source_note)
select h.id,s.reading,s.meaning,s.usage_note,s.choice_a,s.choice_b,s.choice_c,s.choice_d,s.correct_choice,'PUBLISHED',s.source_note
from specs s
join public.hanja h on h.character=s.character and h.content_status='PUBLISHED'
on conflict(hanja_id,reading,meaning) do update set
 usage_note=excluded.usage_note,
 choice_a=excluded.choice_a,choice_b=excluded.choice_b,choice_c=excluded.choice_c,choice_d=excluded.choice_d,
 correct_choice=excluded.correct_choice,content_status='PUBLISHED',source_note=excluded.source_note;

do $body$
declare v_count integer; v_bad integer;
begin
 select count(*) into v_count from public.hanja_special_readings
 where source_note like '국립국어원 한국어기초사전%2026-10-05';
 if v_count<2 then raise exception 'Expected at least 2 verified special readings, got %',v_count; end if;

 select count(*) into v_bad from public.hanja_special_readings
 where source_note like '국립국어원 한국어기초사전%2026-10-05'
 and case correct_choice when 1 then choice_a when 2 then choice_b when 3 then choice_c when 4 then choice_d end<>reading;
 if v_bad<>0 then raise exception 'Special-reading correct choice mismatch: %',v_bad; end if;
end $body$;
