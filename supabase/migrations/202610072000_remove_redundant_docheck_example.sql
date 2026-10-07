-- Remove a redundant, low-value example for 圖.
-- 圖 remains covered by natural published examples such as 圖書 and 略圖.
do $$
begin
  if not exists (
    select 1 from public.hanja_words
    where id=1440 and word='도책' and hanja_form='圖冊' and content_status='PUBLISHED'
  ) then
    raise exception 'Expected 圖冊 example row not found';
  end if;

  if (
    select count(distinct w.id)
    from public.hanja h
    join public.hanja_word_map m on m.hanja_id=h.id
    join public.hanja_words w on w.id=m.word_id and w.content_status='PUBLISHED'
    where h.character='圖' and w.id<>1440
  ) < 1 then
    raise exception 'Cannot remove 圖冊: 圖 would lose published example coverage';
  end if;

  delete from public.hanja_words where id=1440;
end $$;
