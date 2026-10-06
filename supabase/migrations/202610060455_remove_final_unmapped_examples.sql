-- Remove the final four unmapped/non-representative example rows.
-- All involved target Hanja remain covered by verified, better examples.
delete from public.hanja_word_map where word_id in (1244,1283,1341,1394);
delete from public.hanja_words where (id,word) in (
  (1244,'갑옷'),
  (1283,'두북'),
  (1341,'약일'),
  (1394,'편방')
);
