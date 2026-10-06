delete from public.hanja_word_map where word_id=1328;
update public.hanja_words set content_status='DRAFT' where id=1328;
insert into public.hanja_words(word,reading,meaning,child_explanation,content_status,source_note,hanja_form)
values ('소성','소성','웃는 소리','사람이 웃을 때 내는 소리','PUBLISHED','예시어 품질 교정 · 2026-10-06','笑聲')
on conflict (word,reading,meaning) do update set content_status='PUBLISHED',hanja_form='笑聲',child_explanation='사람이 웃을 때 내는 소리';
insert into public.hanja_word_map(word_id,hanja_id,position)
select w.id,h.id,x.pos from (values ('笑',1),('聲',2)) x(ch,pos)
join public.hanja_words w on w.word='소성' and w.content_status='PUBLISHED'
join public.hanja h on h.character=x.ch on conflict do nothing;
