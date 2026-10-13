-- Read-only production preflight. Run against the same Supabase project as the app.
-- Any row with status FAIL blocks a claim that the pictorial exam bank is ready.
WITH required(code, minimum) AS (VALUES ('8'::text,3), ('7'::text,1)),
grade_counts AS (
 SELECT g.code, g.id, r.minimum,
 jsonb_array_length(public.list_grade_exam_hanja_support(g.id)->'image_items') AS available
 FROM public.exam_grades g JOIN required r ON r.code=g.code
)
SELECT code, minimum AS required_images, available AS published_images,
 CASE WHEN available>=minimum THEN 'PASS' ELSE 'FAIL' END AS status
FROM grade_counts ORDER BY code;

-- Detect dangling or invalid registrations (zero rows expected).
SELECT im.id, im.hanja_id, im.asset_path, im.asset_license, im.content_status
FROM public.hanja_image_items im
LEFT JOIN public.hanja h ON h.id=im.hanja_id
WHERE h.id IS NULL OR im.asset_path NOT LIKE '/exam-images/%.svg'
   OR im.asset_license NOT IN ('APP_ORIGINAL','CC0')
   OR im.content_status <> 'PUBLISHED';
