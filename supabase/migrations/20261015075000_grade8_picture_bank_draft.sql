-- Original 8급 picture assets. Review illustration semantics and distractors before publishing.
-- Safe to re-run: unique asset paths are inserted only once. Do not alter existing rows.
WITH proposed(hanja_id,asset_path,alt_text) AS (
 VALUES
 (22,'/exam-images/sun.svg','해가 빛나는 그림'),
 (19,'/exam-images/moon.svg','초승달이 떠 있는 그림'),
 (21,'/exam-images/person.svg','두 팔과 두 다리로 서 있는 사람 그림'),
 (10,'/exam-images/gate.svg','두 짝으로 열린 문 그림'),
 (27,'/exam-images/earth.svg','흙에서 새싹이 자라는 그림'),
 (24,'/exam-images/child.svg','어린아이가 서 있는 그림')
), eligible AS (
 SELECT p.*
 FROM proposed p
 WHERE EXISTS (SELECT 1 FROM grade_hanja gh JOIN exam_grades eg ON eg.id=gh.grade_id WHERE eg.code='8' AND gh.hanja_id=p.hanja_id)
 AND NOT EXISTS (SELECT 1 FROM hanja_image_items hi WHERE hi.asset_path=p.asset_path)
)
INSERT INTO hanja_image_items(id,hanja_id,asset_path,alt_text,asset_license,content_status,source_note)
SELECT nextval(pg_get_serial_sequence('hanja_image_items','id')),eligible.hanja_id,eligible.asset_path,eligible.alt_text,'APP_ORIGINAL','DRAFT','Original SVG created for 아빠한자 8급 picture question bank; awaiting editorial review'
FROM eligible
ON CONFLICT (asset_path) DO NOTHING;
