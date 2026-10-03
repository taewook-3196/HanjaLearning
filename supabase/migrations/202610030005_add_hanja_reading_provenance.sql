-- Task 3: add review/provenance metadata to Hanja readings.
-- Readings and meanings are content and must not be published without source verification.

alter table public.hanja_readings
  add column if not exists content_status text not null default 'DRAFT'
    check (content_status in ('DRAFT','REVIEWED','SOURCE_VERIFIED','PUBLISHED')),
  add column if not exists source_note text;

create index if not exists idx_hanja_readings_status
  on public.hanja_readings(content_status);
