insert into public.hanja_word_map(word_id,hanja_id,position)
select 1387,id,2 from public.hanja where character='具'
on conflict do nothing;
