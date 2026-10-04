-- Relations used by mock exams must be independently verifiable.
-- Existing rows remain DRAFT until a source is reviewed.
alter table public.hanja_relations
  add column if not exists content_status text not null default 'DRAFT'
    check (content_status in ('DRAFT','REVIEWED','SOURCE_VERIFIED','PUBLISHED')),
  add column if not exists source_note text;

drop policy if exists "authenticated read published relations" on public.hanja_relations;
create policy "authenticated read published relations" on public.hanja_relations
  for select to authenticated using (
    content_status='PUBLISHED'
    and exists (select 1 from public.hanja h where h.id=from_hanja_id and h.content_status='PUBLISHED')
    and exists (select 1 from public.hanja h where h.id=to_hanja_id and h.content_status='PUBLISHED')
  );

create index if not exists idx_hanja_relations_type_status
  on public.hanja_relations(relation_type,content_status);
