import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Header } from '@/components/ui/Header';
import { theme } from '@/constants/theme';
import { safeBack } from '@/lib/utils/navigation';
import { useStore, Reminder } from '@/stores/useStore';
import { getLogTypeColor } from '@/lib/utils/logTypeColors';
import {
  requestNotificationPermissions,
  scheduleReminderNotification,
  cancelReminderNotification,
} from '@/lib/utils/notifications';

function formatSchedule(reminder: Reminder): string {
  const time = `${reminder.hour.toString().padStart(2, '0')}:${reminder.minute.toString().padStart(2, '0')}`;
  return reminder.repeat === 'daily' ? `${time} daily` : `${time} once`;
}

export default function RemindersScreen() {
  const router = useRouter();
  const { reminders, setReminders } = useStore();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function toggleReminder(reminder: Reminder) {
    setBusyId(reminder.id);
    try {
      if (reminder.enabled) {
        if (reminder.notificationId) {
          await cancelReminderNotification(reminder.notificationId);
        }
        setReminders(
          reminders.map((r) => (r.id === reminder.id ? { ...r, enabled: false, notificationId: null } : r))
        );
      } else {
        const granted = await requestNotificationPermissions();
        if (!granted) {
          Alert.alert(
            'Notifications disabled',
            'Enable notifications for MyBabySteps in your device Settings to turn this reminder on.'
          );
          return;
        }
        const notificationId = await scheduleReminderNotification({
          title: reminder.title,
          hour: reminder.hour,
          minute: reminder.minute,
          repeat: reminder.repeat,
        });
        setReminders(
          reminders.map((r) => (r.id === reminder.id ? { ...r, enabled: true, notificationId } : r))
        );
      }
    } catch (error) {
      Alert.alert('Error', (error as any)?.message || 'Failed to update reminder');
    } finally {
      setBusyId(null);
    }
  }

  function handleDelete(reminder: Reminder) {
    Alert.alert('Delete Reminder?', `Remove "${reminder.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (reminder.notificationId) {
            await cancelReminderNotification(reminder.notificationId);
          }
          setReminders(reminders.filter((r) => r.id !== reminder.id));
        },
      },
    ]);
  }

  return (
    <ScreenContainer scrollable>
      <Header title="Reminders" leftLabel="‹" leftAction={() => safeBack(router, '/(tabs)/profile')} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/reminders/add')}>
          <Text style={styles.addButtonText}>+ Add Reminder</Text>
        </TouchableOpacity>

        {reminders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No reminders yet</Text>
            <Text style={styles.emptySubtext}>Add one to get a nudge at the right time.</Text>
          </View>
        ) : (
          reminders.map((reminder) => (
            <TouchableOpacity
              key={reminder.id}
              style={styles.card}
              onLongPress={() => handleDelete(reminder)}
              activeOpacity={0.8}
            >
              <View style={[styles.dot, { backgroundColor: getLogTypeColor(reminder.type) + '33' }]} />
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{reminder.title}</Text>
                <Text style={styles.cardSubtitle}>{formatSchedule(reminder)}</Text>
              </View>
              <TouchableOpacity
                style={[styles.toggle, reminder.enabled ? styles.toggleOn : styles.toggleOff]}
                onPress={() => toggleReminder(reminder)}
                disabled={busyId === reminder.id}
              >
                <Text style={[styles.toggleText, reminder.enabled ? styles.toggleTextOn : styles.toggleTextOff]}>
                  {reminder.enabled ? 'On' : 'Off'}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  addButton: {
    backgroundColor: theme.colors.mint,
    borderRadius: theme.borderRadius.button,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  addButtonText: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.teal,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
    ...theme.shadows.small,
  },
  dot: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '700' as const,
    color: theme.colors.text,
  },
  cardSubtitle: {
    fontSize: theme.typography.metadata.fontSize,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  toggle: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
    minWidth: 56,
    alignItems: 'center',
  },
  toggleOn: {
    backgroundColor: theme.colors.mint,
  },
  toggleOff: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  toggleText: {
    fontSize: theme.typography.bodySmall.fontSize,
    fontWeight: '600' as const,
  },
  toggleTextOn: {
    color: theme.colors.teal,
  },
  toggleTextOff: {
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyText: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptySubtext: {
    fontSize: theme.typography.metadata.fontSize,
    color: theme.colors.textSecondary,
  },
});
