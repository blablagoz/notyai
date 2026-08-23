create or replace function public.delete_team(requested_team_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  deleted_team_id uuid;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  if not exists (
    select 1
    from public.teams t
    where t.id = requested_team_id
      and (
        t.created_by = current_user_id
        or exists (
          select 1
          from public.team_members tm
          where tm.team_id = t.id
            and tm.user_id = current_user_id
            and tm.role = 'admin'
        )
      )
  ) then
    raise exception 'Only team administrators can delete the team';
  end if;

  delete from public.teams
  where id = requested_team_id
  returning id into deleted_team_id;

  if deleted_team_id is null then
    raise exception 'Team not found';
  end if;

  return true;
end;
$$;

create or replace function public.remove_team_member(requested_team_id uuid, requested_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  team_creator_id uuid;
  removed_user_id uuid;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  if current_user_id = requested_user_id then
    raise exception 'Administrators cannot remove themselves; delete the team instead';
  end if;

  select t.created_by into team_creator_id
  from public.teams t
  where t.id = requested_team_id;

  if team_creator_id is null then
    raise exception 'Team not found';
  end if;

  if not exists (
    select 1
    from public.team_members tm
    where tm.team_id = requested_team_id
      and tm.user_id = current_user_id
      and tm.role = 'admin'
  ) then
    raise exception 'Only team administrators can remove members';
  end if;

  if requested_user_id = team_creator_id then
    raise exception 'The team creator cannot be removed';
  end if;

  delete from public.team_members tm
  where tm.team_id = requested_team_id
    and tm.user_id = requested_user_id
  returning tm.user_id into removed_user_id;

  if removed_user_id is null then
    raise exception 'Team member not found';
  end if;

  return true;
end;
$$;

revoke all on function public.delete_team(uuid) from public, anon, authenticated;
revoke all on function public.remove_team_member(uuid, uuid) from public, anon, authenticated;

grant execute on function public.delete_team(uuid) to authenticated;
grant execute on function public.remove_team_member(uuid, uuid) to authenticated;
