-- Harden objects reported by Supabase security advisor without changing app behavior.
alter view public.hanja_content_integrity set (security_invoker = true);

-- Trigger-only SECURITY DEFINER functions must not be exposed as RPCs.
revoke execute on function public.handle_new_public_user() from public, anon, authenticated;
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
revoke execute on function public.validate_friendship_update() from public, anon, authenticated;

-- Keep the intentionally public password-reset RPC callable only by anon.
revoke execute on function public.consume_password_reset(text,text) from public, authenticated;
grant execute on function public.consume_password_reset(text,text) to anon;
