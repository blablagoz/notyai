export type AppThemeMode = 'obsidian' | 'petrol' | 'light';

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
  type: 'summary' | 'morning' | 'reminder' | 'team';
  title: string;
  subtitle: string;
  time: string;
  isRead: boolean;
}
