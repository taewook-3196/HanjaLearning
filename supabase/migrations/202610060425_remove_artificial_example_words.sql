-- Remove example rows that were constructed from individual Hanja rather than useful Korean vocabulary.
-- Their target characters are already covered by better representative words.

-- 인오: 寅午 is meaningful in specialized calendrical/fortune contexts,
-- but this row merely glosses the two earthly branches as "tiger and horse".
delete from public.hanja_word_map where word_id=1364;
delete from public.hanja_words where id=1364 and word='인오';

-- 일일: the row explains the formal numeral 壹 itself rather than a Korean word "일일".
-- 壹 remains covered by the verified example 일등(壹等).
delete from public.hanja_word_map where word_id=1365;
delete from public.hanja_words where id=1365 and word='일일';
