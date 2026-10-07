-- Remove exact duplicate published word contexts left after example-word consolidation.
-- Keep the oldest context row for each identical word/sentence/blank tuple.

delete from public.hanja_word_contexts c
using public.hanja_word_contexts keep
where c.content_status='PUBLISHED'
  and keep.content_status='PUBLISHED'
  and c.word_id=keep.word_id
  and c.sentence=keep.sentence
  and c.blank_text=keep.blank_text
  and c.id>keep.id;

create unique index if not exists uq_hanja_word_contexts_published_exact
  on public.hanja_word_contexts(word_id,sentence,blank_text)
  where content_status='PUBLISHED';
