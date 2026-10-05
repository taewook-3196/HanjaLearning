-- Reconcile databases that may already have migrations #023-#028 applied.
-- Safe on a fresh schema and on the earlier development schema.

alter table public.exam_culture_items add column if not exists grade_id bigint references public.exam_grades(id) on delete cascade;
alter table public.exam_culture_items add column if not exists choice_a text;
alter table public.exam_culture_items add column if not exists choice_b text;
alter table public.exam_culture_items add column if not exists choice_c text;
alter table public.exam_culture_items add column if not exists choice_d text;
alter table public.exam_culture_items add column if not exists correct_choice smallint;

do $body$
begin
  if exists(select 1 from information_schema.columns where table_schema='public' and table_name='exam_culture_items' and column_name='grade_code') then
    update public.exam_culture_items c
    set grade_id=g.id
    from public.exam_grades g
    where c.grade_id is null and g.provider_id=c.provider_id and g.code=c.grade_code;
  end if;
end $body$;

alter table public.hanja_special_readings add column if not exists choice_a text;
alter table public.hanja_special_readings add column if not exists choice_b text;
alter table public.hanja_special_readings add column if not exists choice_c text;
alter table public.hanja_special_readings add column if not exists choice_d text;
alter table public.hanja_special_readings add column if not exists correct_choice smallint;

-- Old rows are never exposed as valid new-format questions until reviewed.
update public.exam_culture_items set content_status='REVIEWED'
where content_status='PUBLISHED' and grade_id is null;

-- Preserve legacy idiom mappings. If an old mapping is impossible under the
-- stricter rule, hide the parent idiom until an editor repairs the mapping.
update public.hanja_idioms i
set content_status='REVIEWED'
where i.content_status='PUBLISHED'
  and exists (
    select 1 from public.hanja_idiom_map m
    where m.idiom_id=i.id and m.position not between 1 and 4
  );
update public.exam_culture_items set content_status='REVIEWED'
where content_status='PUBLISHED' and (grade_id is null or choice_a is null or choice_b is null or choice_c is null or choice_d is null or correct_choice not between 1 and 4);
update public.hanja_special_readings set content_status='REVIEWED'
where content_status='PUBLISHED' and (choice_a is null or choice_b is null or choice_c is null or choice_d is null or correct_choice not between 1 and 4);

alter table public.hanja_usage_items drop constraint if exists hanja_usage_items_choices_trimmed_check;
alter table public.hanja_usage_items add constraint hanja_usage_items_choices_trimmed_check check (
  length(btrim(prompt))>0
  and length(btrim(choice_a))>0 and length(btrim(choice_b))>0 and length(btrim(choice_c))>0 and length(btrim(choice_d))>0
  and btrim(choice_a)<>btrim(choice_b) and btrim(choice_a)<>btrim(choice_c) and btrim(choice_a)<>btrim(choice_d)
  and btrim(choice_b)<>btrim(choice_c) and btrim(choice_b)<>btrim(choice_d) and btrim(choice_c)<>btrim(choice_d)
) not valid;

alter table public.hanja_image_items drop constraint if exists hanja_image_items_safe_path_check;
alter table public.hanja_image_items add constraint hanja_image_items_safe_path_check check (
  asset_path like '/exam-images/%'
  and asset_path !~ '(^|/)\.\.(/|$)' and asset_path !~ '^//'
  and position('?' in asset_path)=0 and position('#' in asset_path)=0 and position('\\' in asset_path)=0
  and length(btrim(alt_text))>0
) not valid;

alter table public.hanja_idiom_map drop constraint if exists hanja_idiom_map_position_check;
alter table public.hanja_idiom_map add constraint hanja_idiom_map_position_check
  check(position between 1 and 4) not valid;

create or replace function public.validate_hanja_idiom_map()
returns trigger language plpgsql set search_path=public as $body$
declare v_idiom text; v_character text;
begin
  select idiom into v_idiom from public.hanja_idioms where id=new.idiom_id;
  select character into v_character from public.hanja where id=new.hanja_id;
  if v_idiom is null or v_character is null or substring(v_idiom from new.position for 1)<>v_character then
    raise exception 'Idiom mapping does not match the idiom character at position %',new.position;
  end if;
  return new;
end $body$;

drop trigger if exists trg_validate_hanja_idiom_map on public.hanja_idiom_map;
create trigger trg_validate_hanja_idiom_map before insert or update on public.hanja_idiom_map
for each row execute function public.validate_hanja_idiom_map();

drop policy if exists "authenticated read published culture items" on public.exam_culture_items;
create policy "authenticated read published culture items" on public.exam_culture_items
for select to authenticated using (
  content_status='PUBLISHED' and grade_id is not null
  and choice_a is not null and choice_b is not null and choice_c is not null and choice_d is not null
  and correct_choice between 1 and 4
  and exists(select 1 from public.exam_grades g where g.id=grade_id and g.provider_id=exam_culture_items.provider_id)
);

drop policy if exists "authenticated read published special readings" on public.hanja_special_readings;
create policy "authenticated read published special readings" on public.hanja_special_readings
for select to authenticated using (
  content_status='PUBLISHED'
  and choice_a is not null and choice_b is not null and choice_c is not null and choice_d is not null
  and correct_choice between 1 and 4
  and exists(select 1 from public.hanja h where h.id=hanja_id and h.content_status='PUBLISHED')
);
