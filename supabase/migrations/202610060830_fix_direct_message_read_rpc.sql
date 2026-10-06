create or replace function public.mark_friend_messages_read(friend_user_id uuid)
returns void
language sql
security definer
set search_path=public
as $$
 update public.direct_messages
 set read_at=now()
 where recipient_id=(select auth.uid())
   and sender_id=friend_user_id
   and read_at is null;
$$;
revoke all on function public.mark_friend_messages_read(uuid) from public;
grant execute on function public.mark_friend_messages_read(uuid) to authenticated;