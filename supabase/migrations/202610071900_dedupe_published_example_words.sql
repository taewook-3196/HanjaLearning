-- Consolidate duplicate published example words that have the same Hanja form.
-- Keep the older canonical row and move dependent exam metadata before deletion.

do $$
declare
  pair record;
begin
  for pair in
    select * from (values
      (704::bigint,216::bigint), -- 午前
      (682::bigint,605::bigint), -- 大門
      (697::bigint,338::bigint), -- 時間
      (693::bigint,512::bigint), -- 漢字
      (698::bigint,639::bigint), -- 農村
      (699::bigint,492::bigint), -- 電氣
      (692::bigint,511::bigint)  -- 韓國
    ) v(duplicate_id, canonical_id)
  loop
    if not exists (
      select 1 from public.hanja_words d
      join public.hanja_words c on c.id=pair.canonical_id
      where d.id=pair.duplicate_id
        and d.word=c.word and d.reading=c.reading and d.hanja_form=c.hanja_form
    ) then
      raise exception 'Example-word dedupe pair is no longer equivalent: % -> %',
        pair.duplicate_id,pair.canonical_id;
    end if;

    update public.hanja_word_contexts set word_id=pair.canonical_id
      where word_id=pair.duplicate_id;

    insert into public.hanja_common_character_words(set_id,word_id)
      select set_id,pair.canonical_id from public.hanja_common_character_words
      where word_id=pair.duplicate_id
      on conflict do nothing;
    delete from public.hanja_common_character_words where word_id=pair.duplicate_id;

    insert into public.hanja_word_structures(word_id,structure_type,explanation,content_status,source_note,updated_at)
      select pair.canonical_id,structure_type,explanation,content_status,source_note,updated_at
      from public.hanja_word_structures where word_id=pair.duplicate_id
      on conflict (word_id) do nothing;
    delete from public.hanja_word_structures where word_id=pair.duplicate_id;

    update public.hanja_word_relations set from_word_id=pair.canonical_id
      where from_word_id=pair.duplicate_id
        and not exists (
          select 1 from public.hanja_word_relations x
          where x.from_word_id=pair.canonical_id
            and x.to_word_id=hanja_word_relations.to_word_id
            and x.relation_type=hanja_word_relations.relation_type
        );
    delete from public.hanja_word_relations where from_word_id=pair.duplicate_id;

    update public.hanja_word_relations set to_word_id=pair.canonical_id
      where to_word_id=pair.duplicate_id
        and not exists (
          select 1 from public.hanja_word_relations x
          where x.from_word_id=hanja_word_relations.from_word_id
            and x.to_word_id=pair.canonical_id
            and x.relation_type=hanja_word_relations.relation_type
        );
    delete from public.hanja_word_relations where to_word_id=pair.duplicate_id;

    delete from public.hanja_word_map where word_id=pair.duplicate_id;
    delete from public.hanja_words where id=pair.duplicate_id;
  end loop;
end $$;

-- Prevent another published duplicate with the same visible word/Hanja form.
create unique index if not exists uq_hanja_words_published_word_form
  on public.hanja_words(word,hanja_form)
  where content_status='PUBLISHED';
