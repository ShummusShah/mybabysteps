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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Header } from '@/components/ui/Header';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useBaby } from '@/hooks/useBaby';
import { supabase } from '@/lib/auth/supabase';
import { theme } from '@/constants/theme';
import { formatTime } from '@/lib/utils/dateUtils';
import { useStore } from '@/stores/useStore';

export default function AddTemperatureScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { baby } = useBaby();
  const { userPreferences } = useStore();

  const [temperature, setTemperature] = useState('');
  const [unit, setUnit] = useState<'C' | 'F'>(userPreferences.temperatureUnit as 'C' | 'F');
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
        taken_at: time.toISOString(),
        notes: notes || null,
      });

      if (error) throw error;

      // Invalidate queries to update UI live
      queryClient.invalidateQueries({ queryKey: ['temperature_logs'] });
      queryClient.invalidateQueries({ queryKey: ['history'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      Alert.alert('Success', '🌡️ Temperature logged!', [
        {
          text: 'Done',
          onPress: () => router.back(),
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
      <Header title="Log Temperature" leftAction={() => router.back()} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Temperature *</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, styles.tempInput]}
            placeholder="e.g., 37.2"
            value={temperature}
            onChangeText={setTemperature}
            keyboardType="decimal-pad"
            placeholderTextColor={theme.colors.textSecondary}
          />
          <TouchableOpacity
            style={[styles.unitButton, unit === 'C' && styles.unitButtonActive]}
            onPress={() => setUnit('C')}
          >
            <Text style={[styles.unitText, unit === 'C' && styles.unitTextActive]}>°C</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.unitButton, unit === 'F' && styles.unitButtonActive]}
            onPress={() => setUnit('F')}
          >
            <Text style={[styles.unitText, unit === 'F' && styles.unitTextActive]}>°F</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Time</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowTimePicker(true)}
        >
          <MaterialCommunityIcons name="clock-outline" size={20} color={theme.colors.teal} />
          <Text style={styles.dateButtonText}>{formatTime(time)}</Text>
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

        <Text style={styles.label}>Notes (Optional)</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          placeholder="Any observations..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          placeholderTextColor={theme.colors.textSecondary}
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
  label: {
    fontSize: theme.typography.label.fontSize,
    fontWeight: theme.typography.label.fontWeight,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  input: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.input,
    backgroundColor: theme.colors.white,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
  },
  tempInput: {
    flex: 1,
  },
  unitButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.input,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  unitButtonActive: {
    backgroundColor: theme.colors.mint,
    borderColor: theme.colors.teal,
  },
  unitText: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  unitTextActive: {
    color: theme.colors.teal,
  },
  notesInput: {
    minHeight: 80,
    paddingTop: theme.spacing.md,
    textAlignVertical: 'top',
    marginBottom: theme.spacing.lg,
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
  submitButton: {
    marginBottom: theme.spacing.xl,
  },
});
