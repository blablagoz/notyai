export type AppThemeMode = 'light' | 'dark';

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string; // ISO-8601 string
  endTime: string;   // ISO-8601 string
  reminderMinutesBefore: number;
  category: string;
  location?: string;
  description?: string;
  isCompleted?: boolean;
  teamId?: string;
  teamName?: string;
  nativeCalendarEventId?: string;
  localNotificationId?: number;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  publicId: string;
}

export interface PublicProfile {
  id: string;
  publicId: string;
  fullName?: string;
  avatarUrl?: string;
}

export interface TeamInvitation {
  id: string;
  teamId: string;
  teamName: string;
  inviterName: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
}

export interface ParsedAIResponse {
  title: string;
  startTime: string;
  endTime: string;
  reminderMinutesBefore?: number;
  category?: string;
  location?: string;
  description?: string;
  isReschedule?: boolean;
  rescheduleHours?: number;
  assistantSummary?: string;
}

export interface TeamModel {
  id: string;
  name: string;
  description?: string;
  createdBy?: string;
  role: 'admin' | 'member';
  memberCount: number;
  remindersCount: number;
  isAdmin: boolean;
  members: Array<{ id: string; name: string; role: string; avatar: string }>;
  reminders: TeamReminder[];
}

export interface TeamReminder {
  id: string;
  teamId: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  category: string;
  location?: string;
  createdBy: string;
  createdByName: string;
}

export interface FriendShare {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  sharedCount: number;
  lastActive: string;
}

export interface NotificationItem {
  id: string;
  type: 'summary' | 'morning' | 'reminder' | 'team' | 'invite' | 'system';
  title: string;
  subtitle: string;
  time: string;
  isRead: boolean;
}
