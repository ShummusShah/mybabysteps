import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Header } from '@/components/ui/Header';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useBaby } from '@/hooks/useBaby';
import { supabase } from '@/lib/auth/supabase';
import { theme } from '@/constants/theme';
import { formatTime, formatDuration } from '@/lib/utils/dateUtils';
import { useStore } from '@/stores/useStore';

export default function AddTummyTimeScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { baby } = useBaby();
  const { activeTimer, setActiveTimer } = useStore();

  const [mode, setMode] = useState<'start' | 'manual'>('start');
  const [loading, setLoading] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (activeTimer?.type === 'tummy') {
      setMode('manual');
    }
  }, [activeTimer]);

  async function handleStartTummy() {
    if (!baby) {
      Alert.alert('Error', 'No baby selected');
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
      const { error } = await supabase.from('tummy_time_logs').insert({
        baby_id: baby.id,
        created_by: user.id,
        start_time: now.toISOString(),
        end_time: null,
      });

      if (error) throw error;

      setActiveTimer({
        type: 'tummy',
        startedAt: now.getTime(),
        babyId: baby.id,
      });

      Alert.alert('Tummy Time Started', 'Baby is having tummy time!', [
        {
          text: 'Done',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', (error as any)?.message || 'Failed to start tummy time');
    } finally {
      setLoading(false);
    }
  }

  async function handleManualEntry() {
    if (!baby) {
      Alert.alert('Error', 'No baby selected');
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

      const { error } = await supabase.from('tummy_time_logs').insert({
        baby_id: baby.id,
        created_by: user.id,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        notes: notes || null,
      });

      if (error) throw error;

      // Invalidate queries to update UI live
      queryClient.invalidateQueries({ queryKey: ['tummy_logs'] });
      queryClient.invalidateQueries({ queryKey: ['history'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      Alert.alert('Success', 'Tummy time logged!', [
        {
          text: 'Done',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', (error as any)?.message || 'Failed to log tummy time');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer scrollable>
      <Header title="Log Tummy Time" leftAction={() => router.back()} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How would you like to log tummy time?</Text>

          <TouchableOpacity
            style={[styles.modeButton, mode === 'start' && styles.modeButtonActive]}
            onPress={() => setMode('start')}
          >
            <MaterialCommunityIcons
              name="play-circle"
              size={24}
              color={mode === 'start' ? theme.colors.teal : theme.colors.textSecondary}
            />
            <View style={styles.modeButtonText}>
              <Text style={[styles.modeButtonTitle, mode === 'start' && styles.modeButtonTitleActive]}>
                Start Now
              </Text>
              <Text style={styles.modeButtonSubtitle}>Baby is doing tummy time now</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeButton, mode === 'manual' && styles.modeButtonActive]}
            onPress={() => setMode('manual')}
          >
            <MaterialCommunityIcons
              name="clock"
              size={24}
              color={mode === 'manual' ? theme.colors.teal : theme.colors.textSecondary}
            />
            <View style={styles.modeButtonText}>
              <Text style={[styles.modeButtonTitle, mode === 'manual' && styles.modeButtonTitleActive]}>
                Manual Entry
              </Text>
              <Text style={styles.modeButtonSubtitle}>Enter past tummy time session</Text>
            </View>
          </TouchableOpacity>
        </View>

        {mode === 'start' && (
          <View style={styles.section}>
            <Text style={styles.description}>
              {activeTimer?.type === 'tummy'
                ? 'A tummy time timer is already running.'
                : 'Start tracking tummy time now. The app will keep the timer running.'}
            </Text>

            <PrimaryButton
              title={loading ? 'Starting...' : 'Start Tummy Time'}
              onPress={handleStartTummy}
              loading={loading}
              disabled={loading}
              style={styles.submitButton}
            />
          </View>
        )}

        {mode === 'manual' && (
          <View style={styles.section}>
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
            <TouchableOpacity style={[styles.inputField, styles.notesInput]}>
              <Text style={notes ? styles.inputText : styles.placeholderText}>
                {notes || 'Add notes...'}
              </Text>
            </TouchableOpacity>

            <PrimaryButton
              title={loading ? 'Saving...' : 'Save Tummy Time'}
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
  },
  notesInput: {
    minHeight: 100,
    paddingTop: theme.spacing.md,
  },
  inputText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
  },
  placeholderText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
  },
  submitButton: {
    marginBottom: theme.spacing.xl,
  },
});
