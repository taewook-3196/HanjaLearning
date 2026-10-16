-- Add a reviewed fifth-grade synonym pair without changing existing relations.
-- 自己 (자기) → 自身 (자신). Both published and all characters are in grade 5.
-- Run manually after review. This file is not an automatic deployment migration.
BEGIN;
DO $$
DECLARE next_id bigint;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM hanja_word_relations
    WHERE from_word_id = 613 AND to_word_id = 259 AND relation_type = 'SIMILAR'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM hanja_words w
      WHERE w.id IN (613,259) AND w.content_status <> 'PUBLISHED'
    ) OR (SELECT count(*) FROM hanja_words WHERE id IN (613,259) AND content_status='PUBLISHED') <> 2 THEN
      RAISE EXCEPTION 'Both words must be published';
    END IF;
    IF EXISTS (
      SELECT 1 FROM hanja_word_map m
      WHERE m.word_id IN (613,259)
      AND NOT EXISTS (
        SELECT 1 FROM grade_hanja gh
        JOIN exam_grades eg ON eg.id = gh.grade_id
        WHERE eg.code = '5' AND gh.hanja_id = m.hanja_id
      )
    ) OR (SELECT count(DISTINCT word_id) FROM hanja_word_map WHERE word_id IN (613,259)) <> 2 THEN
      RAISE EXCEPTION 'Both words must be fully mapped to grade 5';
    END IF;
    LOCK TABLE hanja_word_relations IN SHARE ROW EXCLUSIVE MODE;
    SELECT coalesce(max(id),0)+1 INTO next_id FROM hanja_word_relations;
    INSERT INTO hanja_word_relations
      (id,from_word_id,to_word_id,relation_type,content_status,source_note)
    VALUES (next_id,613,259,'SIMILAR','PUBLISHED',
      'Reviewed grade 5 synonym: 自己(자기) → 自身(자신)');
  END IF;
END $$;
COMMIT;
