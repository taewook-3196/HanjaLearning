-- Read-only regression checks for learning-state thresholds.
-- This script does not create objects or modify user records.
with cases(score,stage,expected) as (
  values
    (0,0,'LEARNING'),
    (29,7,'LEARNING'),
    (30,2,'LEARNING'),
    (30,3,'FAMILIAR'),
    (79,7,'FAMILIAR'),
    (80,4,'FAMILIAR'),
    (80,5,'MASTERED'),
    (100,7,'MASTERED'),
    (20,5,'LEARNING'),
    (29,3,'LEARNING'),
    (30,3,'FAMILIAR')
),
results as (
  select score,stage,expected,
    case
      when score>=80 and stage>=5 then 'MASTERED'
      when score>=30 and stage>=3 then 'FAMILIAR'
      else 'LEARNING'
    end actual
  from cases
)
select count(*) as tested,
       count(*) filter(where actual=expected) as passed,
       count(*) filter(where actual<>expected) as failed
from results;

-- Read-only impact report; run before applying the migration.
select
  case
    when mastery_score>=80 and review_stage>=5 then 'MASTERED'
    when mastery_score>=30 and review_stage>=3 then 'FAMILIAR'
    else 'LEARNING'
  end proposed_state,
  count(*) as affected_rows
from public.user_hanja_progress
where study_count>0
group by 1 order by 1;
