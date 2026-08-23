create index if not exists teams_created_by_idx on public.teams (created_by);
create index if not exists team_reminders_created_by_idx on public.team_reminders (created_by);
create index if not exists team_invitations_inviter_id_idx on public.team_invitations (inviter_id);
