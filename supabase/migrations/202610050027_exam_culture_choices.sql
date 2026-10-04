-- Add structured answer choices for reviewed culture/etiquette questions.
-- prompt_summary remains an original reviewed prompt, not copied past-paper wording.
alter table public.exam_culture_items
  add column if not exists choice_a text,
  add column if not exists choice_b text,
  add column if not exists choice_c text,
  add column if not exists choice_d text,
  add column if not exists correct_choice smallint;

alter table public.exam_culture_items
  drop constraint if exists exam_culture_items_correct_choice_check;
alter table public.exam_culture_items
  add constraint exam_culture_items_correct_choice_check
  check (correct_choice is null or correct_choice between 1 and 4);

alter table public.exam_culture_items
  drop constraint if exists exam_culture_items_published_choices_check;
alter table public.exam_culture_items
  add constraint exam_culture_items_published_choices_check
  check (
    content_status<>'PUBLISHED'
    or (
      choice_a is not null and length(trim(choice_a))>0
      and choice_b is not null and length(trim(choice_b))>0
      and choice_c is not null and length(trim(choice_c))>0
      and choice_d is not null and length(trim(choice_d))>0
      and correct_choice between 1 and 4
      and choice_a<>choice_b and choice_a<>choice_c and choice_a<>choice_d
      and choice_b<>choice_c and choice_b<>choice_d and choice_c<>choice_d
    )
  );

comment on column public.exam_culture_items.correct_choice is
  '1-based index of the reviewed correct answer among choice_a through choice_d.';
