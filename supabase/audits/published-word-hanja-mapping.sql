-- Read-only audit: published words whose mapped Hanja differ from their displayed Hanja.
-- Run in Supabase SQL Editor after data imports or mapping corrections.
WITH mapped AS (
  SELECT w.id, w.word, w.hanja_form,
         COUNT(m.hanja_id) AS mapped_count,
         COALESCE(STRING_AGG(h.character, '' ORDER BY m.position), '') AS mapped_form
  FROM public.hanja_words w
  LEFT JOIN public.hanja_word_map m ON m.word_id = w.id
  LEFT JOIN public.hanja h ON h.id = m.hanja_id
  WHERE w.content_status = 'PUBLISHED'
  GROUP BY w.id, w.word, w.hanja_form
)
SELECT id, word, hanja_form, mapped_form, mapped_count,
       CHAR_LENGTH(hanja_form) AS expected_count,
       CASE WHEN mapped_count <> CHAR_LENGTH(hanja_form)
            THEN 'INCOMPLETE' ELSE 'WRONG_CHARACTER_OR_ORDER' END AS issue
FROM mapped
WHERE mapped_form IS DISTINCT FROM hanja_form
ORDER BY id;
