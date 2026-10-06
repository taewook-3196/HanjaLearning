-- Backfill hanja_words.hanja_form only when the existing word map fully represents
-- every Hangul syllable position in the example word. This intentionally skips rows
-- with no mapping or partial mappings, which require individual review.
with reconstructed as (
  select
    w.id,
    string_agg(h.character, '' order by m.position) as mapped_form,
    count(*) as mapped_count,
    count(distinct m.position) as position_count,
    min(m.position) as min_position,
    max(m.position) as max_position,
    char_length(w.word) as word_length
  from public.hanja_words w
  join public.hanja_word_map m on m.word_id = w.id
  join public.hanja h on h.id = m.hanja_id
  where w.hanja_form is null
  group by w.id, w.word
),
safe as (
  select id, mapped_form
  from reconstructed
  where mapped_count = word_length
    and position_count = word_length
    and min_position = 1
    and max_position = word_length
)
update public.hanja_words w
set hanja_form = safe.mapped_form
from safe
where w.id = safe.id
  and w.hanja_form is null;
