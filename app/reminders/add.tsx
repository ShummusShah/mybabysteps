import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, FlatList, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Header } from '@/components/ui/Header';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { theme } from '@/constants/theme';
import { safeBack } from '@/lib/utils/navigation';
import { formatTime } from '@/lib/utils/dateUtils';
import { useStore, Reminder } from '@/stores/useStore';
import { requestNotificationPermissions, scheduleReminderNotification } from '@/lib/utils/notifications';

const TYPE_OPTIONS: { label: string; value: Reminder['type'] }[] = [
  { label: 'Medicine', value: 'medicine' },
  { label: 'Feed', value: 'feed' },
  { label: 'Sleep', value: 'sleep' },
  { label: 'Tummy Time', value: 'tummy' },
  { label: 'Other', value: 'other' },
];

const REPEAT_OPTIONS: { label: string; value: Reminder['repeat'] }[] = [
  { label: 'Every day', value: 'daily' },
  { label: 'Once', value: 'once' },
];

export default function AddReminderScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reminders, setReminders } = useStore();

  const [title, setTitle] = useState('');
  const [type, setType] = useState<Reminder['type']>('medicine');
  const [time, setTime] = useState(new Date());
  const [repeat, setRepeat] = useState<Reminder['repeat']>('daily');
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showRepeatModal, setShowRepeatModal] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    setLoading(true);
    try {
      const granted = await requestNotificationPermissions();

      const reminder: Reminder = {
        id: `${Date.now()}`,
        title: title.trim(),
        type,
        hour: time.getHours(),
        minute: time.getMinutes(),
        repeat,
        enabled: false,
        notificationId: null,
      };

      if (granted) {
        const notificationId = await scheduleReminderNotification({
          title: reminder.title,
          hour: reminder.hour,
          minute: reminder.minute,
          repeat: reminder.repeat,
        });
        reminder.enabled = true;
        reminder.notificationId = notificationId;
      }

      setReminders([...reminders, reminder]);

      if (!granted) {
        Alert.alert(
          'Reminder saved',
          'Notifications are disabled, so this reminder won\'t fire until you enable them in Settings.',
          [{ text: 'OK', onPress: () => safeBack(router, '/reminders') }]
        );
      } else {
        safeBack(router, '/reminders');
      }
    } catch (error) {
      Alert.alert('Error', (error as any)?.message || 'Failed to save reminder');
    } finally {
      setLoading(false);
    }
  }

  const typeLabel = TYPE_OPTIONS.find((o) => o.value === type)?.label || 'Medicine';
  const repeatLabel = REPEAT_OPTIONS.find((o) => o.value === repeat)?.label || 'Every day';

  return (
    <ScreenContainer scrollable>
      <Header title="Add Reminder" leftLabel="‹" leftAction={() => safeBack(router, '/reminders')} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Vitamin D"
          placeholderTextColor={theme.colors.textSecondary}
        />

        <Text style={styles.label}>Type</Text>
        <TouchableOpacity style={styles.selectField} onPress={() => setShowTypeModal(true)}>
          <Text style={styles.selectFieldText}>{typeLabel}</Text>
          <MaterialCommunityIcons name="chevron-down" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <Text style={styles.label}>Time</Text>
        <TouchableOpacity style={styles.selectField} onPress={() => setShowTimePicker(true)}>
          <Text style={styles.selectFieldText}>{formatTime(time)}</Text>
          <MaterialCommunityIcons name="clock-outline" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            value={time}
            mode="time"
            display="spinner"
            onChange={(event, selected) => {
              setShowTimePicker(false);
              if (selected) setTime(selected);
            }}
          />
        )}

        <Text style={styles.label}>Repeat</Text>
        <TouchableOpacity style={styles.selectField} onPress={() => setShowRepeatModal(true)}>
          <Text style={styles.selectFieldText}>{repeatLabel}</Text>
          <MaterialCommunityIcons name="chevron-down" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <PrimaryButton
          title={loading ? 'Saving...' : 'Save Reminder'}
          onPress={handleSave}
          loading={loading}
          disabled={loading}
          style={styles.saveButton}
        />
      </ScrollView>

      <Modal visible={showTypeModal} transparent animationType="slide">
        <View style={[styles.modalContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowTypeModal(false)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Type</Text>
            <View style={{ width: 50 }} />
          </View>
          <FlatList
            data={TYPE_OPTIONS}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  setType(item.value);
                  setShowTypeModal(false);
                }}
              >
                <Text style={[styles.modalOptionText, type === item.value && styles.modalOptionTextSelected]}>
                  {item.label}
                </Text>
                {type === item.value && (
                  <MaterialCommunityIcons name="check" size={20} color={theme.colors.teal} />
                )}
              </TouchableOpacity>
            )}
            style={styles.modalList}
          />
        </View>
      </Modal>

      <Modal visible={showRepeatModal} transparent animationType="slide">
        <View style={[styles.modalContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowRepeatModal(false)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Repeat</Text>
            <View style={{ width: 50 }} />
          </View>
          <FlatList
            data={REPEAT_OPTIONS}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  setRepeat(item.value);
                  setShowRepeatModal(false);
                }}
              >
                <Text style={[styles.modalOptionText, repeat === item.value && styles.modalOptionTextSelected]}>
                  {item.label}
                </Text>
                {repeat === item.value && (
                  <MaterialCommunityIcons name="check" size={20} color={theme.colors.teal} />
                )}
              </TouchableOpacity>
            )}
            style={styles.modalList}
          />
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  label: {
    fontSize: theme.typography.label.fontSize,
    fontWeight: theme.typography.label.fontWeight,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  input: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.input,
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
  },
  selectField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.input,
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.white,
  },
  selectFieldText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
  },
  saveButton: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  modalCloseText: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.teal,
  },
  modalList: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalOptionText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
  },
  modalOptionTextSelected: {
    fontWeight: '600' as const,
    color: theme.colors.teal,
  },
});
