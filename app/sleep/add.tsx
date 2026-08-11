import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Header } from '@/components/ui/Header';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useBaby } from '@/hooks/useBaby';
import { supabase } from '@/lib/auth/supabase';
import { theme } from '@/constants/theme';
import { safeBack } from '@/lib/utils/navigation';
import { formatDuration, formatTime } from '@/lib/utils/dateUtils';
import { useStore } from '@/stores/useStore';

export default function AddSleepScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { baby } = useBaby();
  const { activeTimer, setActiveTimer } = useStore();

  const [sleepMode, setSleepMode] = useState<'start' | 'manual'>('start');
  const [loading, setLoading] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [sleepType, setSleepType] = useState<'nap' | 'night'>('nap');
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [notes, setNotes] = useState('');

  // Check if there's an active sleep timer
  useEffect(() => {
    if (activeTimer?.type === 'sleep') {
      setSleepMode('manual');
    }
  }, [activeTimer]);

  async function handleStartSleep() {
    if (!baby) {
      Alert.alert(
        'No Baby Profile',
        'Please create a baby profile first in your settings.',
        [{ text: 'OK', onPress: () => router.push('/profile') }]
      );
      return;
    }

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert('Error', 'Not authenticated');
        return;
      }

      const now = new Date();

      // Determine sleep type based on time
      const hour = now.getHours();
      const detectedSleepType = (hour >= 20 || hour < 6) ? 'night' : 'nap';

      const { error } = await supabase.from('sleep_logs').insert({
        baby_id: baby.id,
        created_by: user.id,
        sleep_type: detectedSleepType,
        start_time: now.toISOString(),
        end_time: null,
      });

      if (error) throw error;

      // Set active timer in store
      setActiveTimer({
        type: 'sleep',
        startedAt: now.getTime(),
        babyId: baby.id,
        metadata: { sleepType: detectedSleepType },
      });

      Alert.alert('Sleep Started', `Baby is ${detectedSleepType === 'night' ? 'sleeping for the night' : 'napping'}`, [
        {
          text: 'Done',
          onPress: () => safeBack(router, '/(tabs)'),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', (error as any)?.message || 'Failed to start sleep');
    } finally {
      setLoading(false);
    }
  }

  async function handleManualEntry() {
    if (!baby) {
      Alert.alert(
        'No Baby Profile',
        'Please create a baby profile first in your settings.',
        [{ text: 'OK', onPress: () => router.push('/profile') }]
      );
      return;
    }

    if (endTime <= startTime) {
      Alert.alert('Error', 'End time must be after start time');
      return;
    }

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert('Error', 'Not authenticated');
        return;
      }

      const { error } = await supabase.from('sleep_logs').insert({
        baby_id: baby.id,
        created_by: user.id,
        sleep_type: sleepType,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        notes: notes || null,
      });

      if (error) throw error;

      // Invalidate queries to update UI live
      queryClient.invalidateQueries({ queryKey: ['sleep_logs'] });
      queryClient.invalidateQueries({ queryKey: ['history'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['today-timeline'] });

      Alert.alert('Success', 'Sleep logged successfully!', [
        {
          text: 'Done',
          onPress: () => safeBack(router, '/(tabs)'),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', (error as any)?.message || 'Failed to log sleep');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer scrollable>
      <Header title="Log Sleep" leftAction={() => safeBack(router, '/(tabs)')} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Mode Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How would you like to log sleep?</Text>

          <TouchableOpacity
            style={[styles.modeButton, sleepMode === 'start' && styles.modeButtonActive]}
            onPress={() => setSleepMode('start')}
          >
            <MaterialCommunityIcons
              name="play-circle"
              size={24}
              color={sleepMode === 'start' ? theme.colors.teal : theme.colors.textSecondary}
            />
            <View style={styles.modeButtonText}>
              <Text style={[styles.modeButtonTitle, sleepMode === 'start' && styles.modeButtonTitleActive]}>
                Start Now
              </Text>
              <Text style={styles.modeButtonSubtitle}>Baby is sleeping now</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeButton, sleepMode === 'manual' && styles.modeButtonActive]}
            onPress={() => setSleepMode('manual')}
          >
            <MaterialCommunityIcons
              name="clock"
              size={24}
              color={sleepMode === 'manual' ? theme.colors.teal : theme.colors.textSecondary}
            />
            <View style={styles.modeButtonText}>
              <Text style={[styles.modeButtonTitle, sleepMode === 'manual' && styles.modeButtonTitleActive]}>
                Manual Entry
              </Text>
              <Text style={styles.modeButtonSubtitle}>Enter past sleep session</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Start Now */}
        {sleepMode === 'start' && (
          <View style={styles.section}>
            <Text style={styles.description}>
              {activeTimer?.type === 'sleep'
                ? 'A sleep timer is already running. You can log the wake-up time instead.'
                : 'Start tracking sleep now. The app will keep the timer running in the background.'}
            </Text>

            <PrimaryButton
              title={loading ? 'Starting...' : 'Start Sleep'}
              onPress={handleStartSleep}
              loading={loading}
              disabled={loading}
              style={styles.submitButton}
            />
          </View>
        )}

        {/* Manual Entry */}
        {sleepMode === 'manual' && (
          <View style={styles.section}>
            <Text style={styles.label}>Sleep Type</Text>
            <View style={styles.typeButtons}>
              {(['nap', 'night'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeButton, sleepType === type && styles.typeButtonActive]}
                  onPress={() => setSleepType(type)}
                >
                  <Text style={[styles.typeButtonText, sleepType === type && styles.typeButtonTextActive]}>
                    {type === 'nap' ? '🌤️ Nap' : '🌙 Night'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Start Time</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowStartPicker(true)}
            >
              <MaterialCommunityIcons name="clock-outline" size={20} color={theme.colors.teal} />
              <Text style={styles.dateButtonText}>{formatTime(startTime)}</Text>
            </TouchableOpacity>
            {showStartPicker && (
              <DateTimePicker
                value={startTime}
                mode="time"
                display="spinner"
                onChange={(event, selected) => {
                  setShowStartPicker(false);
                  if (selected) setStartTime(selected);
                }}
              />
            )}

            <Text style={styles.label}>End Time</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowEndPicker(true)}
            >
              <MaterialCommunityIcons name="clock-outline" size={20} color={theme.colors.teal} />
              <Text style={styles.dateButtonText}>{formatTime(endTime)}</Text>
            </TouchableOpacity>
            {showEndPicker && (
              <DateTimePicker
                value={endTime}
                mode="time"
                display="spinner"
                onChange={(event, selected) => {
                  setShowEndPicker(false);
                  if (selected) setEndTime(selected);
                }}
              />
            )}

            <Text style={styles.label}>Notes (Optional)</Text>
            <TextInput
              style={[styles.inputField, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add notes..."
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              numberOfLines={3}
            />

            <PrimaryButton
              title={loading ? 'Saving...' : 'Save Sleep'}
              onPress={handleManualEntry}
              loading={loading}
              disabled={loading}
              style={styles.submitButton}
            />
          </View>
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
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.sectionTitle.fontSize,
    fontWeight: theme.typography.sectionTitle.fontWeight,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.typography.label.fontSize,
    fontWeight: theme.typography.label.fontWeight,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  description: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    lineHeight: 20,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.input,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.white,
  },
  modeButtonActive: {
    backgroundColor: theme.colors.mint,
    borderColor: theme.colors.teal,
  },
  modeButtonText: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  modeButtonTitle: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  modeButtonTitleActive: {
    color: theme.colors.teal,
  },
  modeButtonSubtitle: {
    fontSize: theme.typography.metadata.fontSize,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  typeButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.input,
    alignItems: 'center',
    backgroundColor: theme.colors.white,
  },
  typeButtonActive: {
    backgroundColor: theme.colors.lavender,
    borderColor: theme.colors.teal,
  },
  typeButtonText: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  typeButtonTextActive: {
    color: theme.colors.teal,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.input,
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.white,
  },
  dateButtonText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
  },
  inputField: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.input,
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    minHeight: 48,
    justifyContent: 'center',
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
  },
  notesInput: {
    minHeight: 100,
    paddingTop: theme.spacing.md,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginBottom: theme.spacing.xl,
  },
});
