-- Proposal only. Do not apply to production without approval and verified backup.
-- Nullable for backward compatibility: existing published culture items retain NULL.
ALTER TABLE public.exam_culture_items
  ADD COLUMN IF NOT EXISTS concept_tags text[];

COMMENT ON COLUMN public.exam_culture_items.concept_tags IS
  'Optional editorial concept keys used to avoid duplicate concepts in a single mock exam. NULL uses legacy behavior.';

-- After application, verify:
-- SELECT count(*) AS total, count(*) FILTER (WHERE concept_tags IS NOT NULL) AS tagged
-- FROM public.exam_culture_items;
