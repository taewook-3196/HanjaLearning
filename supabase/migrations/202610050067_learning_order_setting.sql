alter table public.user_settings add column if not exists learning_order text not null default 'STROKE' check (learning_order in ('STROKE','READING','RANDOM'));

create or replace function public.save_learning_order(target_learning_order text)
returns void language plpgsql security invoker set search_path='public' as $$
declare uid uuid:=auth.uid();
begin
 if uid is null then raise exception 'authentication required'; end if;
 if target_learning_order not in ('STROKE','READING','RANDOM') then raise exception 'invalid learning order'; end if;
 update public.user_settings set learning_order=target_learning_order,updated_at=now() where user_id=uid;
 if not found then raise exception 'settings not found'; end if;
end $$;

revoke all on function public.save_learning_order(text) from public;
grant execute on function public.save_learning_order(text) to authenticated;