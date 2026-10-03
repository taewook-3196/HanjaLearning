-- Task 3: verified exam provider and grade master data
-- Source: 대한검정회 official 2026 한자급수자격검정 안내.
-- Individual Hanja assignments are intentionally not seeded until official lists are source-verified.

insert into public.exam_providers (code, name)
values ('DAEHAN', '대한검정회')
on conflict (code) do update set name = excluded.name;

with provider as (
  select id from public.exam_providers where code = 'DAEHAN'
)
insert into public.exam_grades (provider_id, code, name, cumulative_hanja_count, sort_order)
select provider.id, v.code, v.name, v.cumulative_hanja_count, v.sort_order
from provider
cross join (
  values
    ('8', '8급', 30, 10),
    ('7', '7급', 50, 20),
    ('6', '6급', 70, 30),
    ('PRE5', '준5급', 100, 40),
    ('5', '5급', 250, 50),
    ('PRE4', '준4급', 400, 60),
    ('4', '4급', 600, 70),
    ('PRE3', '준3급', 800, 80),
    ('3', '3급', 1000, 90),
    ('PRE2', '준2급', 1500, 100),
    ('2', '2급', 2000, 110),
    ('PRE1', '준1급', 2500, 120),
    ('1', '1급', 3500, 130),
    ('TEACHER', '사범', 5000, 140)
) as v(code, name, cumulative_hanja_count, sort_order)
on conflict (provider_id, code) do update set
  name = excluded.name,
  cumulative_hanja_count = excluded.cumulative_hanja_count,
  sort_order = excluded.sort_order;
