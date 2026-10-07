revoke all on public.feedback_tickets,public.feedback_messages from anon,authenticated;
grant select,update on public.feedback_tickets to authenticated;
grant select on public.feedback_messages to authenticated;
create or replace function public.delete_feedback_ticket(target_ticket_id bigint) returns void language plpgsql security definer set search_path=public as $$ declare caller uuid:=auth.uid(); begin if caller is null then raise exception 'authentication required'; end if; if not exists(select 1 from public.account_status a where a.user_id=caller and a.status='ACTIVE') then raise exception 'active account required'; end if; delete from public.feedback_tickets t where t.id=target_ticket_id and (t.user_id=caller or public.is_app_admin()); if not found then raise exception 'feedback ticket not found'; end if; end $$;
revoke all on function public.delete_feedback_ticket(bigint) from public,anon;
grant execute on function public.delete_feedback_ticket(bigint) to authenticated;