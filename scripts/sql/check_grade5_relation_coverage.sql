-- Read-only post-application check: six distinct grade 5 source/type prompts required.
SELECT count(DISTINCT (a.word,r.relation_type)) AS grade5_relation_prompts
FROM hanja_word_relations r
JOIN hanja_words a ON a.id=r.from_word_id AND a.content_status='PUBLISHED'
JOIN hanja_words b ON b.id=r.to_word_id AND b.content_status='PUBLISHED'
WHERE r.content_status='PUBLISHED'
  AND r.relation_type IN ('SIMILAR','OPPOSITE')
  AND EXISTS (SELECT 1 FROM hanja_word_map m WHERE m.word_id=a.id)
  AND EXISTS (SELECT 1 FROM hanja_word_map m WHERE m.word_id=b.id)
  AND NOT EXISTS (
    SELECT 1 FROM hanja_word_map m
    WHERE m.word_id IN (a.id,b.id)
      AND NOT EXISTS (
        SELECT 1 FROM grade_hanja gh
        JOIN exam_grades eg ON eg.id=gh.grade_id
        WHERE eg.code='5' AND gh.hanja_id=m.hanja_id
      )
  );
