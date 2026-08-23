import { Capacitor } from '@capacitor/core';
import { NativeDevice, NativePermissionStatus, prepareEventNotifications } from './native';

export type RequiredPermission = 'calendar' | 'notifications' | 'microphone';
export type RequiredPermissionStatuses = Record<RequiredPermission, NativePermissionStatus>;

export const PERMISSION_ONBOARDING_STORAGE_KEY = 'notyai_permission_onboarding_v1';

const initialStatuses: RequiredPermissionStatuses = {
  calendar: 'prompt',
  notifications: 'prompt',
  microphone: 'prompt',
};

export function supportsRequiredPermissionOnboarding() {
  return Capacitor.getPlatform() === 'android';
}

export function hasSeenPermissionOnboarding() {
  return localStorage.getItem(PERMISSION_ONBOARDING_STORAGE_KEY) === 'completed';
}

export function markPermissionOnboardingSeen() {
  localStorage.setItem(PERMISSION_ONBOARDING_STORAGE_KEY, 'completed');
}

export async function getRequiredPermissionStatuses(): Promise<RequiredPermissionStatuses> {
  if (!supportsRequiredPermissionOnboarding()) {
    return {
      calendar: 'granted',
      notifications: 'granted',
      microphone: 'granted',
    };
  }

  try {
    return await NativeDevice.getPermissionStatus();
  } catch {
    return initialStatuses;
  }
}

export async function requestRequiredPermissions(
  onProgress?: (permission: RequiredPermission, granted: boolean) => void,
): Promise<RequiredPermissionStatuses> {
  if (!supportsRequiredPermissionOnboarding()) return getRequiredPermissionStatuses();

  const requests: Array<{
    permission: RequiredPermission;
    request: () => Promise<{ granted: boolean }>;
  }> = [
    { permission: 'calendar', request: () => NativeDevice.requestCalendarPermission() },
    {
      permission: 'notifications',
      request: async () => {
        const result = await NativeDevice.requestNotificationPermission();
        if (result.granted) await prepareEventNotifications(true);
        return result;
      },
    },
    { permission: 'microphone', request: () => NativeDevice.requestMicrophonePermission() },
  ];

  for (const item of requests) {
    try {
      const result = await item.request();
      onProgress?.(item.permission, result.granted);
    } catch {
      onProgress?.(item.permission, false);
    }
  }

  return getRequiredPermissionStatuses();
}
