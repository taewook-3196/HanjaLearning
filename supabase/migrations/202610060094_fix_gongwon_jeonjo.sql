delete from public.hanja_word_map where word_id in (1353,1374);
insert into public.hanja_word_map(word_id,hanja_id,position)
select 1353,id,1 from public.hanja where character='公'
union all select 1353,id,2 from public.hanja where character='園'
union all select 1374,id,1 from public.hanja where character='前'
union all select 1374,id,2 from public.hanja where character='兆'
on conflict do nothing;
update public.hanja_words set hanja_form='公園',source_note=coalesce(source_note,'')||' · 한자 표기 교정 2026-10-06' where id=1353;
update public.hanja_words set hanja_form='前兆',source_note=coalesce(source_note,'')||' · 한자 순서 교정 2026-10-06' where id=1374;
