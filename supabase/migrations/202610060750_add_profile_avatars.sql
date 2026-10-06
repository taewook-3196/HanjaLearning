alter table public.profiles
 add column if not exists avatar_type text not null default 'CHARACTER' check (avatar_type in ('CHARACTER','PHOTO')),
 add column if not exists avatar_key text not null default 'boy',
 add column if not exists avatar_path text;
comment on column public.profiles.avatar_key is 'Built-in avatar identifier; independent of nickname and friendship identity.';
