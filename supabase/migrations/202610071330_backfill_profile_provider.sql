-- Repair legacy profiles created before user_settings/provider initialization was guaranteed.
-- Only one provider is currently supported, so fill missing profile provider from the user's settings provider.
update public.profiles p
set target_provider=ep.code
from public.user_settings s
join public.exam_providers ep on ep.id=s.exam_provider_id
where p.user_id=s.user_id
  and p.target_provider is null;

-- Future profiles are still initialized by handle_new_public_user; this backfill intentionally
-- does not overwrite an existing provider or target grade.
