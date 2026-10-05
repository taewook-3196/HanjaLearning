-- Remove legacy overloaded RPC signatures so PostgREST resolves the current settings RPC unambiguously.
drop function if exists public.save_learning_settings(text,text,bigint);
drop function if exists public.save_learning_settings(text,text,bigint,boolean,text);
