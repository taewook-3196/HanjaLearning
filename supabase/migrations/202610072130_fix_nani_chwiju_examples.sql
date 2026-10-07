-- Replace two artificial/incorrect examples with established Korean words.
do $$
begin
  if not exists (select 1 from public.hanja_words where id=1169 and word='이난' and hanja_form='易難' and content_status='PUBLISHED') then
    raise exception 'Expected 易難 example not found';
  end if;
  update public.hanja_words
  set word='난이', reading='난이', hanja_form='難易',
      meaning='어려움과 쉬움',
      child_explanation='어떤 일이 얼마나 어렵거나 쉬운지를 나타내는 말이에요.',
      source_note='국립국어원 표준국어대사전 기반 교정 · 2026-10-07'
  where id=1169;

  -- Preserve the existing mappings but fix their positions after reversing 難易.
  update public.hanja_word_map m
  set position = case h.character when '難' then 1 when '易' then 2 else m.position end
  from public.hanja h
  where m.word_id=1169 and m.hanja_id=h.id and h.character in ('難','易');

  if not exists (select 1 from public.hanja_words where id=1210 and word='취풍' and hanja_form='吹風' and content_status='PUBLISHED') then
    raise exception 'Expected 吹風 example not found';
  end if;
  update public.hanja_words
  set word='취주', reading='취주', hanja_form='吹奏',
      meaning='관악기를 불어서 연주함',
      child_explanation='피리나 나팔처럼 입으로 부는 악기를 연주하는 것을 말해요.',
      source_note='국립국어원 표준국어대사전 기반 자연스러운 예시어 교정 · 2026-10-07'
  where id=1210;

  if exists (
    select 1 from public.hanja h
    where not exists (
      select 1 from public.hanja_word_map m join public.hanja_words w on w.id=m.word_id and w.content_status='PUBLISHED'
      where m.hanja_id=h.id
    )
  ) then raise exception 'Published example coverage must remain complete for all Hanja'; end if;
end $$;
