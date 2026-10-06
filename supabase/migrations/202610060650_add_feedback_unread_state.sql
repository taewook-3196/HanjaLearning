alter table public.feedback_tickets add column if not exists user_last_read_at timestamptz not null default now();
create or replace function public.mark_feedback_ticket_read(target_ticket_id bigint) returns void language plpgsql security invoker set search_path=public as $$
begin
 update public.feedback_tickets set user_last_read_at=now()
 where id=target_ticket_id and user_id=(select auth.uid());
 if not found then raise exception 'feedback ticket not found'; end if;
end $$;
create or replace function public.feedback_unread_reply_count() returns bigint language sql stable security invoker set search_path=public as $$
 select count(*) from public.feedback_tickets t
 where t.user_id=(select auth.uid())
 and exists(
   select 1 from public.feedback_messages m
   where m.ticket_id=t.id and m.sender_id<>t.user_id and m.created_at>t.user_last_read_at
 );
$$;