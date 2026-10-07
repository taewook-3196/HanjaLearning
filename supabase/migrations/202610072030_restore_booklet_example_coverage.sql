-- Restore natural example coverage for 冊 after removing the redundant 圖冊 example.
do $$
declare
  v_word_id bigint := 1463;
  v_hanja_id bigint;
begin
  select id into v_hanja_id from public.hanja where character='冊';
  if v_hanja_id is null then raise exception '冊 not found'; end if;

  if exists (
    select 1 from public.hanja_word_map m
    join public.hanja_words w on w.id=m.word_id and w.content_status='PUBLISHED'
    where m.hanja_id=v_hanja_id
  ) then return; end if;

  if exists (select 1 from public.hanja_words where id=v_word_id) then
    raise exception 'Reserved word id % already exists',v_word_id;
  end if;

  insert into public.hanja_words
    (id,word,reading,meaning,child_explanation,content_status,source_note,hanja_form)
  values
    (v_word_id,'책자','책자','책처럼 묶어 만든 인쇄물','여러 장을 책처럼 묶어 만든 것을 말해요.','PUBLISHED','교육용 자연어 예시','冊子');

  insert into public.hanja_word_map(word_id,hanja_id,position)
  values(v_word_id,v_hanja_id,1);
end $$;

do $$
begin
  if exists (
    select 1 from public.hanja h
    where not exists (
      select 1 from public.hanja_word_map m
      join public.hanja_words w on w.id=m.word_id and w.content_status='PUBLISHED'
      where m.hanja_id=h.id
    )
  ) then
    raise exception 'Published example coverage must remain complete for all Hanja';
  end if;
end $$;
