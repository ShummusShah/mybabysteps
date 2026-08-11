import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Header } from '@/components/ui/Header';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useBaby } from '@/hooks/useBaby';
import { supabase } from '@/lib/auth/supabase';
import { theme } from '@/constants/theme';
import { safeBack } from '@/lib/utils/navigation';
import { formatTime, formatStopwatch, formatDuration } from '@/lib/utils/dateUtils';
import { useStore } from '@/stores/useStore';

export default function AddSleepScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { baby } = useBaby();
  const { setActiveTimer } = useStore();

  const [now, setNow] = useState(Date.now());
  const [startLoading, setStartLoading] = useState(false);
  const [wakeLoading, setWakeLoading] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualLoading, setManualLoading] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [sleepType, setSleepType] = useState<'nap' | 'night'>('nap');
  const [manualStart, setManualStart] = useState(new Date());
  const [manualEnd, setManualEnd] = useState(new Date());
  const [notes, setNotes] = useState('');

  const { data: currentSleep } = useQuery({
    queryKey: ['currentSleep', baby?.id],
    queryFn: async () => {
      if (!baby) return null;
      const { data, error } = await supabase
        .from('sleep_logs')
        .select('*')
        .eq('baby_id', baby.id)
        .is('end_time', null)
        .single();
      if (error) return null;
      return data;
    },
    enabled: !!baby,
    refetchInterval: 30000,
  });

  const { data: todayStats = { totalSeconds: 0, naps: 0 } } = useQuery({
    queryKey: ['todaySleepStats', baby?.id],
    queryFn: async () => {
      if (!baby) return { totalSeconds: 0, naps: 0 };

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data, error } = await supabase
        .from('sleep_logs')
        .select('*')
        .eq('baby_id', baby.id)
        .gte('start_time', today.toISOString())
        .lt('start_time', tomorrow.toISOString());

      if (error) return { totalSeconds: 0, naps: 0 };

      const totalSeconds = (data || []).reduce((acc, log) => {
        if (log.end_time) {
          const start = new Date(log.start_time).getTime();
          const end = new Date(log.end_time).getTime();
          return acc + Math.floor((end - start) / 1000);
        }
        return acc;
      }, 0);

      const naps = (data || []).filter((log) => log.sleep_type === 'nap').length;

      return { totalSeconds, naps };
    },
    enabled: !!baby,
  });

  useEffect(() => {
    if (!currentSleep) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [currentSleep?.id]);

  const elapsedSeconds = currentSleep
    ? Math.floor((now - new Date(currentSleep.start_time).getTime()) / 1000)
    : 0;

  function invalidateSleepQueries() {
    queryClient.invalidateQueries({ queryKey: ['currentSleep', baby?.id] });
    queryClient.invalidateQueries({ queryKey: ['todaySleepStats', baby?.id] });
    queryClient.invalidateQueries({ queryKey: ['todaySleep', baby?.id] });
    queryClient.invalidateQueries({ queryKey: ['latestSleep', baby?.id] });
    queryClient.invalidateQueries({ queryKey: ['sleep_logs'] });
    queryClient.invalidateQueries({ queryKey: ['history'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['today-timeline'] });
  }

  async function handleStartSleep() {
    if (!baby) {
      Alert.alert(
        'No Baby Profile',
        'Please create a baby profile first in your settings.',
        [{ text: 'OK', onPress: () => router.push('/profile') }]
      );
      return;
    }

    setStartLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert('Error', 'Not authenticated');
        return;
      }

      const start = new Date();
      const hour = start.getHours();
      const detectedSleepType = hour >= 20 || hour < 6 ? 'night' : 'nap';

      const { error } = await supabase.from('sleep_logs').insert({
        baby_id: baby.id,
        created_by: user.id,
        sleep_type: detectedSleepType,
        start_time: start.toISOString(),
        end_time: null,
      });

      if (error) throw error;

      setActiveTimer({
        type: 'sleep',
        startedAt: start.getTime(),
        babyId: baby.id,
        metadata: { sleepType: detectedSleepType },
      });

      setNow(Date.now());
      invalidateSleepQueries();
    } catch (error) {
      Alert.alert('Error', (error as any)?.message || 'Failed to start sleep');
    } finally {
      setStartLoading(false);
    }
  }

  async function handleWakeUp() {
    if (!currentSleep) return;

    setWakeLoading(true);
    try {
      const { error } = await supabase
        .from('sleep_logs')
        .update({ end_time: new Date().toISOString() })
        .eq('id', currentSleep.id);

      if (error) throw error;

      setActiveTimer(null);
      invalidateSleepQueries();
    } catch (error) {
      Alert.alert('Error', (error as any)?.message || 'Failed to log wake up');
    } finally {
      setWakeLoading(false);
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

    if (manualEnd <= manualStart) {
      Alert.alert('Error', 'End time must be after start time');
      return;
    }

    setManualLoading(true);
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
        start_time: manualStart.toISOString(),
        end_time: manualEnd.toISOString(),
        notes: notes || null,
      });

      if (error) throw error;

      invalidateSleepQueries();

      Alert.alert('Success', 'Sleep logged successfully!', [
        {
          text: 'Done',
          onPress: () => safeBack(router, '/(tabs)'),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', (error as any)?.message || 'Failed to log sleep');
    } finally {
      setManualLoading(false);
    }
  }

  const isSleeping = !!currentSleep;

  return (
    <ScreenContainer scrollable>
      <Header title="Sleep" leftLabel="‹" leftAction={() => safeBack(router, '/(tabs)')} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.stopwatchCard}>
          <MaterialCommunityIcons name="moon-waning-crescent" size={40} color={theme.colors.purple} />
          <Text style={styles.stopwatchStatus}>
            {isSleeping ? 'Baby is sleeping' : 'Baby is awake'}
          </Text>
          <Text style={styles.stopwatchTime}>
            {isSleeping ? formatStopwatch(elapsedSeconds) : '00:00'}
          </Text>
          <Text style={styles.stopwatchSubtitle}>
            {isSleeping ? `Started ${formatTime(new Date(currentSleep.start_time))}` : 'Not sleeping yet'}
          </Text>
        </View>

        {isSleeping ? (
          <PrimaryButton
            title={wakeLoading ? 'Logging...' : 'Baby woke up'}
            onPress={handleWakeUp}
            loading={wakeLoading}
            disabled={wakeLoading}
            style={styles.primaryPurpleButton}
          />
        ) : (
          <PrimaryButton
            title={startLoading ? 'Starting...' : 'Start Sleep'}
            onPress={handleStartSleep}
            loading={startLoading}
            disabled={startLoading}
            style={styles.primaryPurpleButton}
          />
        )}

        <PrimaryButton
          title="Add sleep manually"
          onPress={() => setShowManualEntry((v) => !v)}
          variant="secondary"
          style={styles.secondaryButton}
          textStyle={styles.secondaryButtonText}
        />

        {showManualEntry && (
          <View style={styles.manualSection}>
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
            <TouchableOpacity style={styles.dateButton} onPress={() => setShowStartPicker(true)}>
              <MaterialCommunityIcons name="clock-outline" size={20} color={theme.colors.purple} />
              <Text style={styles.dateButtonText}>{formatTime(manualStart)}</Text>
            </TouchableOpacity>
            {showStartPicker && (
              <DateTimePicker
                value={manualStart}
                mode="time"
                display="spinner"
                onChange={(event, selected) => {
                  setShowStartPicker(false);
                  if (selected) setManualStart(selected);
                }}
              />
            )}

            <Text style={styles.label}>End Time</Text>
            <TouchableOpacity style={styles.dateButton} onPress={() => setShowEndPicker(true)}>
              <MaterialCommunityIcons name="clock-outline" size={20} color={theme.colors.purple} />
              <Text style={styles.dateButtonText}>{formatTime(manualEnd)}</Text>
            </TouchableOpacity>
            {showEndPicker && (
              <DateTimePicker
                value={manualEnd}
                mode="time"
                display="spinner"
                onChange={(event, selected) => {
                  setShowEndPicker(false);
                  if (selected) setManualEnd(selected);
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
              title={manualLoading ? 'Saving...' : 'Save Sleep'}
              onPress={handleManualEntry}
              loading={manualLoading}
              disabled={manualLoading}
              style={styles.primaryPurpleButton}
            />
          </View>
        )}

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total today</Text>
            <Text style={styles.statValue}>{formatDuration(todayStats.totalSeconds)}</Text>
            <View style={styles.statBarTrack}>
              <View style={[styles.statBarFill, { width: '60%' }]} />
            </View>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Naps</Text>
            <Text style={styles.statValue}>{todayStats.naps}</Text>
            <View style={styles.statBarTrack}>
              <View style={[styles.statBarFill, { width: '45%' }]} />
            </View>
          </View>
        </View>
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
  stopwatchCard: {
    backgroundColor: theme.colors.lavender,
    borderRadius: theme.borderRadius.card,
    paddingVertical: theme.spacing.xxl,
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  stopwatchStatus: {
    fontSize: theme.typography.cardHeadline.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  stopwatchTime: {
    fontSize: 48,
    fontWeight: '700' as const,
    color: theme.colors.purple,
    marginTop: theme.spacing.sm,
  },
  stopwatchSubtitle: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  primaryPurpleButton: {
    backgroundColor: theme.colors.purple,
    marginBottom: theme.spacing.md,
  },
  secondaryButton: {
    marginBottom: theme.spacing.xl,
  },
  secondaryButtonText: {
    color: theme.colors.purple,
  },
  manualSection: {
    marginBottom: theme.spacing.xl,
  },
  label: {
    fontSize: theme.typography.label.fontSize,
    fontWeight: theme.typography.label.fontWeight,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
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
    borderColor: theme.colors.purple,
  },
  typeButtonText: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  typeButtonTextActive: {
    color: theme.colors.purple,
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
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.input,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
  },
  statLabel: {
    fontSize: theme.typography.metadata.fontSize,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  statValue: {
    fontSize: theme.typography.sectionTitle.fontSize,
    fontWeight: '700' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  statBarTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.lavender,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    backgroundColor: theme.colors.purple,
    borderRadius: 2,
  },
});
