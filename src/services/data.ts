import { supabase } from '../lib/supabase';
import { CalendarEvent, NotificationItem, PublicProfile, TeamInvitation, TeamModel, TeamReminder, UserProfile } from '../types';

const unwrap = <T>(result: { data: T | null; error: { message: string } | null }): T => {
  if (result.error) throw new Error(result.error.message);
  return result.data as T;
};

export async function loadProfile(userId: string): Promise<UserProfile> {
  const row: any = unwrap(await supabase.from('profiles').select('id,email,full_name,avatar_url,public_id').eq('id', userId).single());
  return { id: row.id, email: row.email, fullName: row.full_name || undefined, avatarUrl: row.avatar_url || undefined, publicId: row.public_id };
}

const mapEvent = (row: any): CalendarEvent => ({
  id: row.id, title: row.title, startTime: row.start_time, endTime: row.end_time,
  reminderMinutesBefore: row.reminder_minutes_before, category: row.category,
  location: row.location || undefined, description: row.description || undefined,
  isCompleted: row.is_completed, nativeCalendarEventId: row.native_calendar_event_id || undefined,
  localNotificationId: row.local_notification_id ?? undefined,
});

export async function loadEvents(): Promise<CalendarEvent[]> {
  const rows: any[] = unwrap(await supabase.from('events').select('*').order('start_time'));
  return rows.map(mapEvent);
}

export async function saveEvent(userId: string, event: Omit<CalendarEvent, 'id'>, id?: string): Promise<CalendarEvent> {
  const payload = { user_id: userId, title: event.title, start_time: event.startTime, end_time: event.endTime,
    reminder_minutes_before: event.reminderMinutesBefore, category: event.category, location: event.location || null,
    description: event.description || null, is_completed: !!event.isCompleted,
    native_calendar_event_id: event.nativeCalendarEventId || null, local_notification_id: event.localNotificationId ?? null };
  const query = id ? supabase.from('events').update(payload).eq('id', id) : supabase.from('events').insert(payload);
  const row: any = unwrap(await query.select().single());
  return mapEvent(row);
}

export async function updateEvent(id: string, patch: Record<string, unknown>) {
  unwrap(await supabase.from('events').update(patch).eq('id', id).select().single());
}

export async function removeEvent(id: string) {
  const result = await supabase.from('events').delete().eq('id', id);
  if (result.error) throw new Error(result.error.message);
}

export async function loadTeams(): Promise<TeamModel[]> {
  const memberships: any[] = unwrap(await supabase.from('team_members').select('team_id,role,teams(id,name,description),profiles(id,full_name,public_id)').order('joined_at'));
  const teamIds = memberships.map((m) => m.team_id);
  if (!teamIds.length) return [];
  const allMembers: any[] = unwrap(await supabase.from('team_members').select('team_id,role,profiles(id,full_name,public_id)').in('team_id', teamIds));
  const reminders: any[] = unwrap(await supabase.from('team_reminders').select('*,profiles(full_name)').in('team_id', teamIds).order('start_time'));
  return memberships.map((membership) => {
    const team = membership.teams;
    const members = allMembers.filter((m) => m.team_id === team.id).map((m) => ({
      id: m.profiles?.id || '', name: m.profiles?.full_name || m.profiles?.public_id || 'NotyAI Kullanıcısı', role: m.role,
      avatar: (m.profiles?.full_name || 'N').slice(0, 2).toUpperCase(),
    }));
    const teamReminders: TeamReminder[] = reminders.filter((r) => r.team_id === team.id).map((r) => ({
      id: r.id, teamId: r.team_id, title: r.title, description: r.description || undefined,
      startTime: r.start_time, endTime: r.end_time, category: r.category || 'Ekip', location: r.location || undefined,
      createdBy: r.created_by, createdByName: r.profiles?.full_name || 'Ekip yöneticisi',
    }));
    return { id: team.id, name: team.name, description: team.description || undefined, role: membership.role,
      memberCount: members.length, remindersCount: teamReminders.length, isAdmin: membership.role === 'admin', members, reminders: teamReminders };
  });
}

export async function createTeam(name: string, description: string) {
  const result = await supabase.rpc('create_team', { team_name: name, team_description: description || null });
  if (result.error) throw new Error(result.error.message);
}

export async function addTeamReminder(userId: string, teamId: string, reminder: Omit<TeamReminder, 'id' | 'teamId' | 'createdBy' | 'createdByName'>) {
  const result = await supabase.from('team_reminders').insert({ team_id: teamId, created_by: userId, title: reminder.title,
    description: reminder.description || null, start_time: reminder.startTime, end_time: reminder.endTime,
    category: reminder.category, location: reminder.location || null, reminder_minutes_before: 60 });
  if (result.error) throw new Error(result.error.message);
}

export async function findProfile(publicId: string): Promise<PublicProfile | null> {
  const result = await supabase.rpc('find_profile_by_public_id', { requested_public_id: publicId.trim().toUpperCase() });
  if (result.error) throw new Error(result.error.message);
  const row: any = result.data?.[0];
  return row ? { id: row.id, publicId: row.public_id, fullName: row.full_name || undefined, avatarUrl: row.avatar_url || undefined } : null;
}

export async function inviteMember(teamId: string, publicId: string) {
  const result = await supabase.rpc('invite_team_member', { requested_team_id: teamId, requested_public_id: publicId.trim().toUpperCase() });
  if (result.error) throw new Error(result.error.message);
}

export async function loadInvitations(): Promise<TeamInvitation[]> {
  const rows: any[] = unwrap(await supabase.from('team_invitations').select('id,team_id,status,created_at,teams(name),profiles!team_invitations_inviter_id_fkey(full_name)').eq('status', 'pending').order('created_at', { ascending: false }));
  return rows.map((r) => ({ id: r.id, teamId: r.team_id, teamName: r.teams?.name || 'Ekip', inviterName: r.profiles?.full_name || 'NotyAI kullanıcısı', createdAt: r.created_at, status: r.status }));
}

export async function respondInvitation(id: string, accept: boolean) {
  const result = await supabase.rpc('respond_team_invitation', { invitation_id: id, accept_invitation: accept });
  if (result.error) throw new Error(result.error.message);
}

export async function loadNotifications(): Promise<NotificationItem[]> {
  const rows: any[] = unwrap(await supabase.from('app_notifications').select('*').order('created_at', { ascending: false }).limit(50));
  return rows.map((r) => ({ id: r.id, type: r.type, title: r.title, subtitle: r.subtitle || '', time: r.created_at, isRead: r.is_read }));
}

export async function markAllNotificationsRead() {
  const result = await supabase.from('app_notifications').update({ is_read: true }).eq('is_read', false);
  if (result.error) throw new Error(result.error.message);
}
