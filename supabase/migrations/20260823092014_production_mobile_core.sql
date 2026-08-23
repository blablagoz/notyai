create schema if not exists private;
revoke all on schema private from public;

alter table public.profiles add column if not exists public_id text;

update public.profiles
set public_id = 'NTY-' || upper(substr(replace(id::text, '-', ''), 1, 12))
where public_id is null;

alter table public.profiles alter column public_id set not null;

create unique index if not exists profiles_public_id_key
  on public.profiles (public_id);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  start_time timestamptz not null,
  end_time timestamptz not null,
  reminder_minutes_before integer not null default 60
    check (reminder_minutes_before in (15, 30, 60, 120, 1440)),
  category text not null default 'Genel',
  location text,
  description text,
  is_completed boolean not null default false,
  native_calendar_event_id text,
  local_notification_id integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_end_after_start check (end_time > start_time)
);

create index if not exists events_user_start_idx
  on public.events (user_id, start_time);

alter table public.team_reminders
  add column if not exists reminder_minutes_before integer not null default 60
    check (reminder_minutes_before in (15, 30, 60, 120, 1440));

create table if not exists public.team_invitations (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  inviter_id uuid not null references public.profiles(id) on delete cascade,
  invitee_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'declined', 'cancelled')),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  constraint team_invitations_no_self_invite check (inviter_id <> invitee_id)
);

create unique index if not exists team_invitations_pending_key
  on public.team_invitations (team_id, invitee_id)
  where status = 'pending';

create index if not exists team_invitations_invitee_status_idx
  on public.team_invitations (invitee_id, status, created_at desc);

create index if not exists team_members_user_id_idx
  on public.team_members (user_id);

create index if not exists team_reminders_team_start_idx
  on public.team_reminders (team_id, start_time);

create index if not exists friendships_friend_id_idx
  on public.friendships (friend_id);

create table if not exists public.app_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('invite', 'team', 'reminder', 'system')),
  title text not null,
  subtitle text,
  related_id uuid,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists app_notifications_user_created_idx
  on public.app_notifications (user_id, created_at desc);

create or replace function private.is_team_member(requested_team_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and exists (
      select 1
      from public.team_members tm
      where tm.team_id = requested_team_id
        and tm.user_id = (select auth.uid())
    );
$$;

create or replace function private.is_team_admin(requested_team_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and (
      exists (
        select 1
        from public.teams t
        where t.id = requested_team_id
          and t.created_by = (select auth.uid())
      )
      or exists (
        select 1
        from public.team_members tm
        where tm.team_id = requested_team_id
          and tm.user_id = (select auth.uid())
          and tm.role = 'admin'
      )
    );
$$;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  generated_public_id text;
begin
  loop
    generated_public_id := 'NTY-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));
    exit when not exists (
      select 1 from public.profiles where public_id = generated_public_id
    );
  end loop;

  insert into public.profiles (id, email, full_name, avatar_url, public_id)
  values (
    new.id,
    coalesce(new.email, new.id::text || '@notyai.local'),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url',
    generated_public_id
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(public.profiles.full_name, excluded.full_name),
        avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update of email, raw_user_meta_data on auth.users
  for each row execute function private.handle_new_user();

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
  before update on public.events
  for each row execute function private.set_updated_at();

create or replace function public.find_profile_by_public_id(requested_public_id text)
returns table (id uuid, public_id text, full_name text, avatar_url text)
language sql
stable
security definer
set search_path = ''
as $$
  select p.id, p.public_id, p.full_name, p.avatar_url
  from public.profiles p
  where (select auth.uid()) is not null
    and p.public_id = upper(trim(requested_public_id))
  limit 1;
$$;

create or replace function public.create_team(team_name text, team_description text default null)
returns public.teams
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  created_team public.teams;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;
  if char_length(trim(team_name)) not between 2 and 100 then
    raise exception 'Team name must contain between 2 and 100 characters';
  end if;

  insert into public.teams (name, description, created_by)
  values (trim(team_name), nullif(trim(team_description), ''), current_user_id)
  returning * into created_team;

  insert into public.team_members (team_id, user_id, role)
  values (created_team.id, current_user_id, 'admin')
  on conflict (team_id, user_id) do update set role = 'admin';

  return created_team;
end;
$$;

create or replace function public.invite_team_member(requested_team_id uuid, requested_public_id text)
returns public.team_invitations
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  target_profile public.profiles;
  created_invitation public.team_invitations;
  requested_team public.teams;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;
  if not private.is_team_admin(requested_team_id) then
    raise exception 'Only team administrators can invite members';
  end if;

  select * into target_profile
  from public.profiles
  where public_id = upper(trim(requested_public_id));

  if target_profile.id is null then
    raise exception 'User not found';
  end if;
  if target_profile.id = current_user_id then
    raise exception 'You cannot invite yourself';
  end if;
  if exists (
    select 1 from public.team_members
    where team_id = requested_team_id and user_id = target_profile.id
  ) then
    raise exception 'User is already a team member';
  end if;

  select * into requested_team from public.teams where id = requested_team_id;

  insert into public.team_invitations (team_id, inviter_id, invitee_id)
  values (requested_team_id, current_user_id, target_profile.id)
  returning * into created_invitation;

  insert into public.app_notifications (user_id, type, title, subtitle, related_id)
  values (
    target_profile.id,
    'invite',
    'Yeni ekip daveti',
    requested_team.name || ' ekibine davet edildiniz.',
    created_invitation.id
  );

  return created_invitation;
exception
  when unique_violation then
    raise exception 'A pending invitation already exists for this user';
end;
$$;

create or replace function public.respond_team_invitation(invitation_id uuid, accept_invitation boolean)
returns public.team_invitations
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  invitation public.team_invitations;
  responder_name text;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  select * into invitation
  from public.team_invitations
  where id = invitation_id
  for update;

  if invitation.id is null or invitation.invitee_id <> current_user_id then
    raise exception 'Invitation not found';
  end if;
  if invitation.status <> 'pending' then
    raise exception 'Invitation has already been answered';
  end if;

  update public.team_invitations
  set status = case when accept_invitation then 'accepted' else 'declined' end,
      responded_at = now()
  where id = invitation_id
  returning * into invitation;

  if accept_invitation then
    insert into public.team_members (team_id, user_id, role)
    values (invitation.team_id, current_user_id, 'member')
    on conflict (team_id, user_id) do nothing;
  end if;

  select coalesce(full_name, public_id) into responder_name
  from public.profiles where id = current_user_id;

  insert into public.app_notifications (user_id, type, title, subtitle, related_id)
  values (
    invitation.inviter_id,
    'team',
    case when accept_invitation then 'Ekip daveti kabul edildi' else 'Ekip daveti reddedildi' end,
    responder_name || case when accept_invitation then ' ekibe katıldı.' else ' daveti reddetti.' end,
    invitation.id
  );

  return invitation;
end;
$$;

do $$
declare
  existing_policy record;
begin
  for existing_policy in
    select tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = any(array[
        'profiles', 'events', 'teams', 'team_members', 'team_reminders',
        'team_invitations', 'friendships', 'app_notifications'
      ])
  loop
    execute format(
      'drop policy if exists %I on public.%I',
      existing_policy.policyname,
      existing_policy.tablename
    );
  end loop;
end;
$$;

alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.team_reminders enable row level security;
alter table public.team_invitations enable row level security;
alter table public.friendships enable row level security;
alter table public.app_notifications enable row level security;

create policy profiles_select_authenticated on public.profiles
  for select to authenticated
  using ((select auth.uid()) is not null);

create policy profiles_update_own on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy events_select_own on public.events
  for select to authenticated
  using ((select auth.uid()) = user_id);
create policy events_insert_own on public.events
  for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy events_update_own on public.events
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy events_delete_own on public.events
  for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy teams_select_member on public.teams
  for select to authenticated
  using (created_by = (select auth.uid()) or (select private.is_team_member(id)));
create policy teams_update_admin on public.teams
  for update to authenticated
  using ((select private.is_team_admin(id)))
  with check ((select private.is_team_admin(id)));
create policy teams_delete_owner on public.teams
  for delete to authenticated
  using (created_by = (select auth.uid()));

create policy team_members_select_team on public.team_members
  for select to authenticated
  using ((select private.is_team_member(team_id)) or user_id = (select auth.uid()));

create policy team_reminders_select_member on public.team_reminders
  for select to authenticated
  using ((select private.is_team_member(team_id)));
create policy team_reminders_insert_admin on public.team_reminders
  for insert to authenticated
  with check ((select private.is_team_admin(team_id)) and created_by = (select auth.uid()));
create policy team_reminders_update_admin on public.team_reminders
  for update to authenticated
  using ((select private.is_team_admin(team_id)))
  with check ((select private.is_team_admin(team_id)));
create policy team_reminders_delete_admin on public.team_reminders
  for delete to authenticated
  using ((select private.is_team_admin(team_id)));

create policy team_invitations_select_participant on public.team_invitations
  for select to authenticated
  using (
    invitee_id = (select auth.uid())
    or inviter_id = (select auth.uid())
    or (select private.is_team_admin(team_id))
  );

create policy friendships_select_participant on public.friendships
  for select to authenticated
  using ((select auth.uid()) in (user_id, friend_id));
create policy friendships_insert_sender on public.friendships
  for insert to authenticated
  with check ((select auth.uid()) = user_id and user_id <> friend_id);
create policy friendships_update_participant on public.friendships
  for update to authenticated
  using ((select auth.uid()) in (user_id, friend_id))
  with check ((select auth.uid()) in (user_id, friend_id));
create policy friendships_delete_participant on public.friendships
  for delete to authenticated
  using ((select auth.uid()) in (user_id, friend_id));

create policy app_notifications_select_own on public.app_notifications
  for select to authenticated
  using ((select auth.uid()) = user_id);
create policy app_notifications_update_own on public.app_notifications
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy app_notifications_delete_own on public.app_notifications
  for delete to authenticated
  using ((select auth.uid()) = user_id);

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.events from anon, authenticated;
revoke all on table public.teams from anon, authenticated;
revoke all on table public.team_members from anon, authenticated;
revoke all on table public.team_reminders from anon, authenticated;
revoke all on table public.team_invitations from anon, authenticated;
revoke all on table public.friendships from anon, authenticated;
revoke all on table public.app_notifications from anon, authenticated;

grant select (id, public_id, full_name, avatar_url, created_at)
  on table public.profiles to authenticated;
grant update (full_name, avatar_url)
  on table public.profiles to authenticated;
grant select, insert, update, delete on table public.events to authenticated;
grant select, update, delete on table public.teams to authenticated;
grant select on table public.team_members to authenticated;
grant select, insert, update, delete on table public.team_reminders to authenticated;
grant select on table public.team_invitations to authenticated;
grant select, insert, update, delete on table public.friendships to authenticated;
grant select, update, delete on table public.app_notifications to authenticated;

revoke all on function private.is_team_member(uuid) from public, anon, authenticated;
revoke all on function private.is_team_admin(uuid) from public, anon, authenticated;
grant usage on schema private to authenticated;
grant execute on function private.is_team_member(uuid) to authenticated;
grant execute on function private.is_team_admin(uuid) to authenticated;

revoke all on function private.handle_new_user() from public, anon, authenticated;
revoke all on function private.set_updated_at() from public, anon, authenticated;
revoke all on function public.find_profile_by_public_id(text) from public, anon, authenticated;
revoke all on function public.create_team(text, text) from public, anon, authenticated;
revoke all on function public.invite_team_member(uuid, text) from public, anon, authenticated;
revoke all on function public.respond_team_invitation(uuid, boolean) from public, anon, authenticated;

grant execute on function public.find_profile_by_public_id(text) to authenticated;
grant execute on function public.create_team(text, text) to authenticated;
grant execute on function public.invite_team_member(uuid, text) to authenticated;
grant execute on function public.respond_team_invitation(uuid, boolean) to authenticated;

insert into public.profiles (id, email, full_name, avatar_url, public_id)
select
  u.id,
  coalesce(u.email, u.id::text || '@notyai.local'),
  coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name'),
  u.raw_user_meta_data ->> 'avatar_url',
  'NTY-' || upper(substr(replace(u.id::text, '-', ''), 1, 12))
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id);
