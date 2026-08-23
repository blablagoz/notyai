drop policy if exists teams_delete_owner on public.teams;
drop policy if exists teams_delete_admin on public.teams;

create policy teams_delete_admin on public.teams
  for delete to authenticated
  using (
    created_by = (select auth.uid())
    or (select private.is_team_admin(id))
  );

drop policy if exists team_members_delete_admin on public.team_members;

create policy team_members_delete_admin on public.team_members
  for delete to authenticated
  using (
    (select private.is_team_admin(team_id))
    and user_id <> (select auth.uid())
    and not exists (
      select 1
      from public.teams t
      where t.id = team_members.team_id
        and t.created_by = team_members.user_id
    )
  );

grant delete on table public.team_members to authenticated;

alter function public.delete_team(uuid) security invoker;
alter function public.remove_team_member(uuid, uuid) security invoker;
