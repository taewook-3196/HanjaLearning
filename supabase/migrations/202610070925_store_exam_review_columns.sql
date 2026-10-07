alter table public.exam_attempt_questions
 add column if not exists question_snapshot jsonb,
 add column if not exists selected_answer text,
 add column if not exists correct_answer text;
