-- Keep the persisted award keys in sync with GrowthStickerKind (17 kinds).
-- Applied to production on 2026-10-12; retained here for reproducible new databases.
alter table public.user_growth_stickers
  drop constraint if exists user_growth_stickers_sticker_key_check;
alter table public.user_growth_stickers
  add constraint user_growth_stickers_sticker_key_check
  check (sticker_key = any (array['first', 'stack', 'write', 'retry', 'master', 'week', 'streak3', 'streak7', 'streak14', 'streak30', 'learn50', 'learn100', 'learn250', 'write50', 'write100', 'recover5', 'recover20']));
