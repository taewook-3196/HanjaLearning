create or replace function public.remove_friend(p_friend_user_id uuid)
returns void language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid();relation_id bigint;
begin
 if uid is null then raise exception 'authentication required';end if;
 if p_friend_user_id is null or p_friend_user_id=uid then raise exception 'invalid friend';end if;
 select id into relation_id from public.friendships where status='ACCEPTED' and((requester_id=uid and addressee_id=p_friend_user_id)or(requester_id=p_friend_user_id and addressee_id=uid))limit 1;
 if relation_id is null then raise exception 'friendship not found';end if;
 delete from public.direct_messages where(sender_id=uid and recipient_id=p_friend_user_id)or(sender_id=p_friend_user_id and recipient_id=uid);
 delete from public.friendships where id=relation_id;
end $$;
revoke all on function public.remove_friend(uuid) from public,anon;
grant execute on function public.remove_friend(uuid) to authenticated;