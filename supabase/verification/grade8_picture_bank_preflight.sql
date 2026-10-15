-- Read-only production preflight for 8급 original picture assets.
-- Run BEFORE applying 20261015075000_grade8_picture_bank_draft.sql.
-- Every expected_character must match actual_character; existing_path_count must be 0
-- before first application (or 1 with matching hanja_id after re-run).
WITH expected(hanja_id,expected_character,asset_path) AS (
 VALUES (22,'日','/exam-images/sun.svg'),(19,'月','/exam-images/moon.svg'),
 (21,'人','/exam-images/person.svg'),(10,'門','/exam-images/gate.svg'),
 (27,'土','/exam-images/earth.svg'),(24,'子','/exam-images/child.svg')
)
SELECT e.expected_character,h.character AS actual_character,e.hanja_id,e.asset_path,
 EXISTS(SELECT 1 FROM grade_hanja gh JOIN exam_grades eg ON eg.id=gh.grade_id WHERE eg.code='8' AND gh.hanja_id=e.hanja_id) AS in_grade_8,
 (SELECT count(*) FROM hanja_image_items im WHERE im.asset_path=e.asset_path) AS existing_path_count,
 (SELECT min(im.hanja_id) FROM hanja_image_items im WHERE im.asset_path=e.asset_path) AS existing_hanja_id
FROM expected e LEFT JOIN hanja h ON h.id=e.hanja_id ORDER BY e.hanja_id;

-- A post-insert query (still read-only): ensure all nine image items are
-- published before expecting three distinct 8급 exam picture rotations.
SELECT im.asset_path,im.hanja_id,im.asset_license,im.content_status
FROM hanja_image_items im JOIN grade_hanja gh ON gh.hanja_id=im.hanja_id
JOIN exam_grades eg ON eg.id=gh.grade_id
WHERE eg.code='8' AND im.asset_path LIKE '/exam-images/%'
ORDER BY im.asset_path;


-- Read-only editorial approval gate. The six new assets MUST remain DRAFT
-- until explicitly approved. No UPDATE or automatic publishing is performed.
-- Rows with check_result <> 'OK' require investigation before approval.
WITH expected(hanja_id,character,asset_path,expected_alt) AS (
 VALUES
 (22,'日','/exam-images/sun.svg','해가 빛나는 그림'),
 (19,'月','/exam-images/moon.svg','초승달이 떠 있는 그림'),
 (21,'人','/exam-images/person.svg','두 팔과 두 다리로 서 있는 사람 그림'),
 (10,'門','/exam-images/gate.svg','두 짝으로 열린 문 그림'),
 (27,'土','/exam-images/earth.svg','흙의 단면과 흙덩이가 보이는 그림'),
 (24,'子','/exam-images/child.svg','어린아이의 얼굴과 몸이 보이는 그림')
)
SELECT e.character,e.asset_path,im.content_status,im.asset_license,
 CASE
  WHEN count(im.id) OVER (PARTITION BY e.asset_path) <> 1 OR im.id IS NULL THEN 'MISSING_OR_DUPLICATE'
  WHEN h.character IS DISTINCT FROM e.character OR im.hanja_id IS DISTINCT FROM e.hanja_id THEN 'HANJA_MISMATCH'
  WHEN im.alt_text IS DISTINCT FROM e.expected_alt THEN 'DESCRIPTION_MISMATCH'
  WHEN im.asset_license NOT IN ('APP_ORIGINAL','CC0') THEN 'LICENSE_UNAPPROVED'
  WHEN NOT EXISTS(SELECT 1 FROM grade_hanja gh JOIN exam_grades eg ON eg.id=gh.grade_id
                  WHERE eg.code='8' AND gh.hanja_id=e.hanja_id) THEN 'NOT_IN_GRADE_8'
  WHEN im.content_status NOT IN ('DRAFT','PUBLISHED') THEN 'INVALID_STATUS'
  ELSE 'OK'
 END AS check_result
FROM expected e
LEFT JOIN hanja_image_items im ON im.asset_path=e.asset_path
LEFT JOIN hanja h ON h.id=im.hanja_id
ORDER BY e.character;

-- Count only assets actually returned by the production exam RPC.
-- DRAFT assets must never be included in published_picture_count.
SELECT eg.code,
 jsonb_array_length(public.list_grade_exam_hanja_support(eg.id)->'image_items') AS published_picture_count,
 (SELECT count(*) FROM hanja_image_items im JOIN grade_hanja gh ON gh.hanja_id=im.hanja_id
  WHERE gh.grade_id=eg.id AND im.content_status='DRAFT') AS draft_picture_count
FROM exam_grades eg WHERE eg.code IN ('8','7') ORDER BY eg.code;
