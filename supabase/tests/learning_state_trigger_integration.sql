-- Integration test: execute ONLY in a disposable/staging database AFTER
-- applying 20261014080000_sync_learning_state_from_progress.sql.
-- Uses a temporary table, never inserts into public.user_hanja_progress.
begin;
create temporary table test_learning_state (
  study_count integer not null,
  mastery_score integer not null,
  review_stage integer not null,
  learning_state text not null default 'LEARNING'
) on commit drop;
create trigger sync_learning_state_from_progress
before insert or update on test_learning_state
for each row execute function public.sync_learning_state_from_progress();

insert into test_learning_state(study_count,mastery_score,review_stage)
values (1,30,3);
do $$
begin
  if (select learning_state from test_learning_state limit 1) <> 'FAMILIAR' then
    raise exception 'Expected FAMILIAR after insert';
  end if;
end $$;

update test_learning_state set mastery_score=80,review_stage=5;
do $$
begin
  if (select learning_state from test_learning_state limit 1) <> 'MASTERED' then
    raise exception 'Expected MASTERED after promotion';
  end if;
end $$;

update test_learning_state set mastery_score=20;
do $$
begin
  if (select learning_state from test_learning_state limit 1) <> 'LEARNING' then
    raise exception 'Expected LEARNING after demotion';
  end if;
end $$;

insert into test_learning_state(study_count,mastery_score,review_stage,learning_state)
values (0,0,0,'NEW');
do $$
begin
  if (select learning_state from test_learning_state where study_count=0) <> 'NEW' then
    raise exception 'Unstudied rows must remain NEW';
  end if;
end $$;
rollback;
