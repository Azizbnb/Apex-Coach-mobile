/**
 * Notifications — Sprint 4.
 *
 * Will handle:
 * - Push notifications via expo-notifications
 * - Permission requests (iOS)
 * - Token registration with backend
 * - Local notification scheduling (workout reminders, weekly bilan)
 */

export async function registerForPushNotifications(): Promise<string | null> {
  // Sprint 4: implement with expo-notifications
  return null;
}

export async function scheduleWorkoutReminder(_time: Date): Promise<void> {
  // Sprint 4
}

export async function cancelAllNotifications(): Promise<void> {
  // Sprint 4
}
