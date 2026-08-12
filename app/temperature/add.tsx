import React, { useState } from 'react';
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
import { useQueryClient } from '@tanstack/react-query';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Header } from '@/components/ui/Header';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useBaby } from '@/hooks/useBaby';
import { supabase } from '@/lib/auth/supabase';
import { theme } from '@/constants/theme';
import { safeBack } from '@/lib/utils/navigation';
import { formatTime } from '@/lib/utils/dateUtils';
import { useStore } from '@/stores/useStore';

export default function AddTemperatureScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { baby } = useBaby();
  const { userPreferences } = useStore();

  const [temperature, setTemperature] = useState('');
  const [unit, setUnit] = useState<'C' | 'F'>(userPreferences.temperatureUnit === 'fahrenheit' ? 'F' : 'C');
  const [measuredAt, setMeasuredAt] = useState('');
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!baby) {
      Alert.alert('Error', 'No baby selected');
      return;
    }

    if (!temperature.trim()) {
      Alert.alert('Error', 'Please enter temperature');
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

      const tempValue = parseFloat(temperature);
      if (isNaN(tempValue)) {
        Alert.alert('Error', 'Please enter a valid temperature');
        setLoading(false);
        return;
      }

      const { error } = await supabase.from('temperature_logs').insert({
        baby_id: baby.id,
        created_by: user.id,
        temperature: tempValue,
        unit,
        measurement_location: measuredAt || null,
        taken_at: time.toISOString(),
        notes: notes || null,
      });

      if (error) throw error;

      // Invalidate queries to update UI live
      queryClient.invalidateQueries({ queryKey: ['temperature_logs'] });
      queryClient.invalidateQueries({ queryKey: ['log-entries'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['today-timeline'] });

      Alert.alert('Success', '🌡️ Temperature logged!', [
        {
          text: 'Done',
          onPress: () => safeBack(router, '/(tabs)'),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', (error as any)?.message || 'Failed to log temperature');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer scrollable>
      <Header title="Temperature" leftLabel="‹" leftAction={() => safeBack(router, '/(tabs)')} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.valueRow}>
          <TextInput
            style={styles.valueInput}
            placeholder="0.0"
            placeholderTextColor={theme.colors.border}
            value={temperature}
            onChangeText={setTemperature}
            keyboardType="decimal-pad"
          />
          <Text style={styles.degreeSign}>°</Text>
        </View>

        <View style={styles.unitRow}>
          <TouchableOpacity
            style={[styles.unitPill, unit === 'C' && styles.unitPillActive]}
            onPress={() => setUnit('C')}
          >
            <Text style={[styles.unitPillText, unit === 'C' && styles.unitPillTextActive]}>°C</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.unitPill, unit === 'F' && styles.unitPillActive]}
            onPress={() => setUnit('F')}
          >
            <Text style={[styles.unitPillText, unit === 'F' && styles.unitPillTextActive]}>°F</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Measured at</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Forehead"
          placeholderTextColor={theme.colors.textSecondary}
          value={measuredAt}
          onChangeText={setMeasuredAt}
        />

        <Text style={styles.label}>Time</Text>
        <TouchableOpacity style={styles.input} onPress={() => setShowTimePicker(true)}>
          <Text style={styles.inputText}>{formatTime(time)}</Text>
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

        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={styles.input}
          placeholder=""
          placeholderTextColor={theme.colors.textSecondary}
          value={notes}
          onChangeText={setNotes}
        />

        <PrimaryButton
          title={loading ? 'Saving...' : 'Save Temperature'}
          onPress={handleSave}
          loading={loading}
          disabled={loading}
          style={styles.submitButton}
        />
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
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  valueInput: {
    fontSize: 56,
    fontWeight: '700' as const,
    color: theme.colors.teal,
    textAlign: 'right',
    minWidth: 100,
    padding: 0,
  },
  degreeSign: {
    fontSize: 56,
    fontWeight: '700' as const,
    color: theme.colors.teal,
  },
  unitRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xxl,
  },
  unitPill: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: 20,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  unitPillActive: {
    backgroundColor: theme.colors.teal,
    borderColor: theme.colors.teal,
  },
  unitPillText: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.textSecondary,
  },
  unitPillTextActive: {
    color: theme.colors.white,
  },
  label: {
    fontSize: theme.typography.metadata.fontSize,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  input: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.input,
    backgroundColor: theme.colors.white,
    marginBottom: theme.spacing.lg,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    minHeight: 48,
    justifyContent: 'center',
  },
  inputText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
  },
  submitButton: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
});
