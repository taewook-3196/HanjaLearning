-- Keep repository migration history aligned with the production permission fix.
-- RLS still controls which rows an authenticated user may read or insert.
grant select, insert on table public.direct_messages to authenticated;
grant usage, select on sequence public.direct_messages_id_seq to authenticated;
