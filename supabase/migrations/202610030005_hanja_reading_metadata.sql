-- Hanja reading provenance/status columns used by the verified reading seed migrations.
-- Kept separate for compatibility with databases created from the original content schema.
alter table public.hanja_readings
  add column if not exists content_status text not null default 'DRAFT'
    check (content_status in ('DRAFT','REVIEWED','SOURCE_VERIFIED','PUBLISHED')),
  add column if not exists source_note text;

-- Existing authenticated read policy is gated by the parent Hanja publication status.
-- Reading status is provenance/review metadata and does not broaden RLS access.
