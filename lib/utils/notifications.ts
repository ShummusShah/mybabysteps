import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;

  const result = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: true, allowSound: true },
  });
  return !!result.granted;
}

export async function scheduleReminderNotification(params: {
  title: string;
  hour: number;
  minute: number;
  repeat: 'daily' | 'once';
}): Promise<string> {
  if (params.repeat === 'daily') {
    return Notifications.scheduleNotificationAsync({
      content: { title: params.title, body: 'Reminder from MyBabySteps' },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: params.hour,
        minute: params.minute,
      },
    });
  }

  const now = new Date();
  const target = new Date();
  target.setHours(params.hour, params.minute, 0, 0);
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }
  const seconds = Math.max(1, Math.round((target.getTime() - now.getTime()) / 1000));

  return Notifications.scheduleNotificationAsync({
    content: { title: params.title, body: 'Reminder from MyBabySteps' },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
    },
  });
}

export async function cancelReminderNotification(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // already cancelled or fired — nothing to clean up
  }
}
