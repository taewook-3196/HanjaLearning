-- New learners should use the device/browser's available Korean voice by default.
alter table public.user_settings alter column speech_voice set default 'AUTO';

-- The original default was DAD. Existing untouched DAD rows cannot be distinguished
-- perfectly from an explicit choice, so preserve existing users' saved preference.
