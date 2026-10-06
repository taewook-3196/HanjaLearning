update storage.buckets set public=false where id='profile-avatars';

drop policy if exists profile_avatar_owner_select on storage.objects;
create policy profile_avatar_owner_select on storage.objects
for select to authenticated
using (
 bucket_id='profile-avatars'
 and (
  (storage.foldername(name))[1]=(select auth.uid())::text
  or exists (
   select 1 from public.friendships f
   where f.status='ACCEPTED'
   and (
    (f.requester_id=(select auth.uid()) and f.addressee_id::text=(storage.foldername(name))[1])
    or
    (f.addressee_id=(select auth.uid()) and f.requester_id::text=(storage.foldername(name))[1])
   )
  )
 )
);