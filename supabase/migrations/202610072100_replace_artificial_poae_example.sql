-- Replace the artificial 抱愛 example with the standard Korean word 抱負.
do $$
declare
  v_id bigint := 1216;
begin
  if not exists (
    select 1 from public.hanja_words
    where id=v_id and word='포애' and hanja_form='抱愛' and content_status='PUBLISHED'
  ) then
    raise exception 'Expected 抱愛 example not found';
  end if;

  if exists (
    select 1 from public.hanja_words
    where content_status='PUBLISHED' and word='포부' and hanja_form='抱負' and id<>v_id
  ) then
    raise exception 'Published 抱負 example already exists';
  end if;

  update public.hanja_words
  set word='포부',
      reading='포부',
      hanja_form='抱負',
      meaning='마음속에 품은 미래의 계획이나 희망',
      child_explanation='앞으로 이루고 싶은 꿈이나 계획을 말해요.',
      source_note='표준사전 기반 자연스러운 예시어 교정 · 2026-10-07'
  where id=v_id;

  if exists (
    select 1 from public.hanja h
    where not exists (
      select 1 from public.hanja_word_map m
      join public.hanja_words w on w.id=m.word_id and w.content_status='PUBLISHED'
      where m.hanja_id=h.id
    )
  ) then raise exception 'Published example coverage must remain complete for all Hanja'; end if;
end $$;
