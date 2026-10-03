-- Task 7: learning-engine support indexes.
create index if not exists idx_user_hanja_progress_user_due
  on public.user_hanja_progress(user_id, next_review_at)
  where next_review_at is not null;
