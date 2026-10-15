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
