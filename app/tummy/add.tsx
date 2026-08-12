import React, { useEffect, useRef, useState } from 'react';
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
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Header } from '@/components/ui/Header';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useBaby } from '@/hooks/useBaby';
import { supabase } from '@/lib/auth/supabase';
import { theme } from '@/constants/theme';
import { safeBack } from '@/lib/utils/navigation';
import { formatTime, formatDate, formatStopwatch, isToday } from '@/lib/utils/dateUtils';
import { useStore } from '@/stores/useStore';

const AMBER = theme.colors.yellowAccent;
const AMBER_LIGHT = theme.colors.yellow;
const AMBER_PALE = '#FBEACA';

export default function AddTummyTimeScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { baby } = useBaby();
  const { activeTimer, setActiveTimer } = useStore();
  const scrollRef = useRef<ScrollView>(null);
  const manualSectionY = useRef(0);

  const [activeTab, setActiveTab] = useState<'live' | 'manual'>('live');
  const [now, setNow] = useState(Date.now());
  const [startLoading, setStartLoading] = useState(false);
  const [pauseLoading, setPauseLoading] = useState(false);
  const [finishLoading, setFinishLoading] = useState(false);
  const [manualLoading, setManualLoading] = useState(false);

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [manualStart, setManualStart] = useState(new Date());
  const [manualDate, setManualDate] = useState(new Date());
  const [durationMinutes, setDurationMinutes] = useState('');
  const [notes, setNotes] = useState('');

  const { data: currentTummy } = useQuery({
    queryKey: ['currentTummy', baby?.id],
    queryFn: async () => {
      if (!baby) return null;
      const { data, error } = await supabase
        .from('tummy_time_logs')
        .select('*')
        .eq('baby_id', baby.id)
        .is('end_time', null)
        .order('start_time', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) return null;
      return data;
    },
    enabled: !!baby,
    refetchInterval: 30000,
  });

  const isRunning = !!currentTummy;
  const isPaused = isRunning && activeTimer?.type === 'tummy' && !!activeTimer.metadata?.paused;
  const pausedAt = isPaused ? (activeTimer!.metadata!.pausedAt as number) : null;

  useEffect(() => {
    if (!isRunning || isPaused) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [isRunning, isPaused, currentTummy?.id]);

  const elapsedSeconds = isRunning
    ? Math.floor(((isPaused ? pausedAt! : now) - new Date(currentTummy.start_time).getTime()) / 1000)
    : 0;

  function invalidateTummyQueries() {
    queryClient.invalidateQueries({ queryKey: ['currentTummy', baby?.id] });
    queryClient.invalidateQueries({ queryKey: ['tummy_logs'] });
    queryClient.invalidateQueries({ queryKey: ['log-entries'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['today-timeline'] });
  }

  async function handleStart() {
    if (!baby) {
      Alert.alert('Error', 'No baby selected');
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
      const { error } = await supabase.from('tummy_time_logs').insert({
        baby_id: baby.id,
        created_by: user.id,
        start_time: start.toISOString(),
        end_time: null,
      });

      if (error) throw error;

      setActiveTimer({
        type: 'tummy',
        startedAt: start.getTime(),
        babyId: baby.id,
        metadata: { paused: false },
      });

      setNow(Date.now());
      invalidateTummyQueries();
    } catch (error) {
      Alert.alert('Error', (error as any)?.message || 'Failed to start tummy time');
    } finally {
      setStartLoading(false);
    }
  }

  function handlePause() {
    if (!currentTummy || !baby) return;
    // activeTimer may be unset on this device if a different caregiver
    // started the session — fall back to the shared DB row's start_time.
    const base =
      activeTimer?.type === 'tummy'
        ? activeTimer
        : { type: 'tummy' as const, startedAt: new Date(currentTummy.start_time).getTime(), babyId: baby.id };
    setPauseLoading(true);
    setActiveTimer({
      ...base,
      metadata: { ...base.metadata, paused: true, pausedAt: Date.now() },
    });
    setPauseLoading(false);
  }

  async function handleResume() {
    if (!activeTimer || activeTimer.type !== 'tummy' || !activeTimer.metadata?.paused) return;
    if (!currentTummy) return;

    setPauseLoading(true);
    try {
      const pausedDurationMs = Date.now() - (activeTimer.metadata.pausedAt as number);
      const shiftedStart = new Date(new Date(currentTummy.start_time).getTime() + pausedDurationMs);

      const { error } = await supabase
        .from('tummy_time_logs')
        .update({ start_time: shiftedStart.toISOString() })
        .eq('id', currentTummy.id);

      if (error) throw error;

      setActiveTimer({
        ...activeTimer,
        metadata: { ...activeTimer.metadata, paused: false, pausedAt: undefined },
      });
      setNow(Date.now());
      invalidateTummyQueries();
    } catch (error) {
      Alert.alert('Error', (error as any)?.message || 'Failed to resume');
    } finally {
      setPauseLoading(false);
    }
  }

  async function handleFinishAndSave() {
    if (!currentTummy) return;

    setFinishLoading(true);
    try {
      const endTime = isPaused ? new Date(pausedAt!) : new Date();

      const { error } = await supabase
        .from('tummy_time_logs')
        .update({ end_time: endTime.toISOString() })
        .eq('id', currentTummy.id);

      if (error) throw error;

      setActiveTimer(null);
      invalidateTummyQueries();
    } catch (error) {
      Alert.alert('Error', (error as any)?.message || 'Failed to save tummy time');
    } finally {
      setFinishLoading(false);
    }
  }

  async function handleManualEntry() {
    if (!baby) {
      Alert.alert('Error', 'No baby selected');
      return;
    }

    const durationMins = parseInt(durationMinutes || '0', 10);
    if (!durationMins || durationMins <= 0) {
      Alert.alert('Error', 'Enter a duration greater than 0');
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

      const start = new Date(manualDate);
      start.setHours(manualStart.getHours(), manualStart.getMinutes(), 0, 0);
      const end = new Date(start.getTime() + durationMins * 60000);

      const { error } = await supabase.from('tummy_time_logs').insert({
        baby_id: baby.id,
        created_by: user.id,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        notes: notes || null,
      });

      if (error) throw error;

      invalidateTummyQueries();

      Alert.alert('Success', 'Tummy time logged!', [
        {
          text: 'Done',
          onPress: () => safeBack(router, '/(tabs)'),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', (error as any)?.message || 'Failed to log tummy time');
    } finally {
      setManualLoading(false);
    }
  }

  return (
    <ScreenContainer scrollable>
      <Header title="Tummy Time" leftLabel="‹" leftAction={() => safeBack(router, '/(tabs)')} />

      <ScrollView ref={scrollRef} style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.pillRow}>
          <TouchableOpacity
            style={[styles.pill, activeTab === 'live' && styles.pillActive]}
            onPress={() => {
              setActiveTab('live');
              scrollRef.current?.scrollTo({ y: 0, animated: true });
            }}
          >
            <Text style={[styles.pillText, activeTab === 'live' && styles.pillTextActive]}>Live Timer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.pill, activeTab === 'manual' && styles.pillActive]}
            onPress={() => {
              setActiveTab('manual');
              scrollRef.current?.scrollTo({ y: manualSectionY.current, animated: true });
            }}
          >
            <Text style={[styles.pillText, activeTab === 'manual' && styles.pillTextActive]}>Add Manually</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.timerCard}>
          <Text style={styles.timerDigits}>{isRunning ? formatStopwatch(elapsedSeconds) : '00:00'}</Text>
          <Text style={styles.timerStatus}>
            {isRunning ? (isPaused ? 'Tummy time paused' : 'Tummy time in progress') : 'Not started yet'}
          </Text>
        </View>

        {isRunning ? (
          <>
            <PrimaryButton
              title={pauseLoading ? '...' : isPaused ? 'Resume' : 'Pause'}
              onPress={isPaused ? handleResume : handlePause}
              loading={pauseLoading}
              disabled={pauseLoading}
              style={styles.pauseButton}
              textStyle={styles.pauseButtonText}
            />
            <PrimaryButton
              title={finishLoading ? 'Saving...' : 'Finish & Save'}
              onPress={handleFinishAndSave}
              loading={finishLoading}
              disabled={finishLoading}
              style={styles.finishButton}
            />
          </>
        ) : (
          <PrimaryButton
            title={startLoading ? 'Starting...' : 'Start Tummy Time'}
            onPress={handleStart}
            loading={startLoading}
            disabled={startLoading}
            style={styles.finishButton}
          />
        )}

        <View onLayout={(e) => (manualSectionY.current = e.nativeEvent.layout.y)}>
          <Text style={styles.sectionHeading}>Manual entry</Text>

          <View style={styles.manualCard}>
            <View style={styles.manualRow}>
              <TouchableOpacity style={styles.fieldCell} onPress={() => setShowStartPicker(true)}>
                <Text style={styles.fieldLabel}>Start time</Text>
                <Text style={styles.fieldValue}>{formatTime(manualStart)}</Text>
              </TouchableOpacity>
              <View style={styles.fieldCell}>
                <Text style={styles.fieldLabel}>Duration</Text>
                <View style={styles.durationInputRow}>
                  <TextInput
                    style={styles.durationInput}
                    value={durationMinutes}
                    onChangeText={setDurationMinutes}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                  <Text style={styles.fieldValue}>m</Text>
                </View>
              </View>
            </View>

            <View style={styles.manualRow}>
              <TouchableOpacity style={styles.fieldCell} onPress={() => setShowDatePicker(true)}>
                <Text style={styles.fieldLabel}>Date</Text>
                <Text style={styles.fieldValue}>{isToday(manualDate) ? 'Today' : formatDate(manualDate)}</Text>
              </TouchableOpacity>
              <View style={styles.fieldCell}>
                <Text style={styles.fieldLabel}>Notes</Text>
                <TextInput
                  style={styles.notesInput}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Optional"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>
            </View>

            <Text style={styles.helperText}>Use this for tummy time you forgot to start live.</Text>
          </View>

          <PrimaryButton
            title={manualLoading ? 'Saving...' : 'Add Manual Session'}
            onPress={handleManualEntry}
            loading={manualLoading}
            disabled={manualLoading}
            variant="secondary"
            style={styles.addManualButton}
            textStyle={styles.addManualButtonText}
          />
        </View>

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

        {showDatePicker && (
          <DateTimePicker
            value={manualDate}
            mode="date"
            display="spinner"
            maximumDate={new Date()}
            onChange={(event, selected) => {
              setShowDatePicker(false);
              if (selected) setManualDate(selected);
            }}
          />
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
  pillRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  pill: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: 24,
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  pillActive: {
    backgroundColor: AMBER,
    borderColor: AMBER,
  },
  pillText: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600' as const,
    color: AMBER,
  },
  pillTextActive: {
    color: theme.colors.white,
  },
  timerCard: {
    backgroundColor: AMBER_LIGHT,
    borderRadius: theme.borderRadius.card,
    paddingVertical: theme.spacing.xxl,
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  timerDigits: {
    fontSize: 48,
    fontWeight: '700' as const,
    color: AMBER,
  },
  timerStatus: {
    fontSize: theme.typography.cardHeadline.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  pauseButton: {
    backgroundColor: AMBER_PALE,
    marginBottom: theme.spacing.md,
  },
  pauseButtonText: {
    color: AMBER,
  },
  finishButton: {
    backgroundColor: AMBER,
    marginBottom: theme.spacing.xl,
  },
  sectionHeading: {
    fontSize: theme.typography.sectionTitle.fontSize,
    fontWeight: theme.typography.sectionTitle.fontWeight,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  manualCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.input,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  manualRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  fieldCell: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: theme.typography.metadata.fontSize,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  fieldValue: {
    fontSize: theme.typography.bodyLarge.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  durationInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  durationInput: {
    fontSize: theme.typography.bodyLarge.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.text,
    minWidth: 30,
    padding: 0,
  },
  notesInput: {
    fontSize: theme.typography.bodyLarge.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.text,
    padding: 0,
  },
  helperText: {
    fontSize: theme.typography.metadata.fontSize,
    color: theme.colors.textSecondary,
  },
  addManualButton: {
    marginBottom: theme.spacing.xl,
  },
  addManualButtonText: {
    color: AMBER,
  },
});
