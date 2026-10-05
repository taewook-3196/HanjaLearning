alter table public.user_settings add column if not exists target_exam_date date;

comment on column public.user_settings.target_exam_date is 'Optional exam date used to pace new learning while reserving time for mastery and review.';
