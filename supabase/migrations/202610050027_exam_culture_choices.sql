-- Culture/etiquette choices are part of the base schema from migration #023.
-- This migration is intentionally compatibility-only so a fresh database and
-- an upgraded development database follow the same migration sequence.
comment on column public.exam_culture_items.correct_choice is
  '1-based index of the reviewed correct answer among choice_a through choice_d.';
