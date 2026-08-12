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

const UNITS = ['ml', 'mg', 'drops', 'other'] as const;

export default function AddMedicineScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { baby } = useBaby();

  const [medicineName, setMedicineName] = useState('');
  const [dose, setDose] = useState('');
  const [unit, setUnit] = useState<(typeof UNITS)[number]>('ml');
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!baby) {
      Alert.alert('Error', 'No baby selected');
      return;
    }

    if (!medicineName.trim()) {
      Alert.alert('Error', 'Please enter medicine name');
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

      const dosage = dose.trim() ? `${dose.trim()} ${unit}` : null;

      const { error } = await supabase.from('medicine_logs').insert({
        baby_id: baby.id,
        created_by: user.id,
        medicine_name: medicineName,
        dosage,
        given_at: time.toISOString(),
        notes: notes || null,
      });

      if (error) throw error;

      // Invalidate queries to update UI live
      queryClient.invalidateQueries({ queryKey: ['medicine_logs'] });
      queryClient.invalidateQueries({ queryKey: ['log-entries'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['today-timeline'] });

      Alert.alert('Success', '💊 Medicine logged!', [
        {
          text: 'Done',
          onPress: () => safeBack(router, '/(tabs)'),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', (error as any)?.message || 'Failed to log medicine');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer scrollable>
      <Header title="Log Medicine" leftLabel="‹" leftAction={() => safeBack(router, '/(tabs)')} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Medicine name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Vitamin D, Paracetamol"
          value={medicineName}
          onChangeText={setMedicineName}
          placeholderTextColor={theme.colors.textSecondary}
        />

        <Text style={styles.label}>Dose</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 0.5"
          value={dose}
          onChangeText={setDose}
          keyboardType="decimal-pad"
          placeholderTextColor={theme.colors.textSecondary}
        />

        <Text style={styles.label}>Unit</Text>
        <View style={styles.unitRow}>
          {UNITS.map((u) => (
            <TouchableOpacity
              key={u}
              style={[styles.unitPill, unit === u && styles.unitPillActive]}
              onPress={() => setUnit(u)}
            >
              <Text style={[styles.unitPillText, unit === u && styles.unitPillTextActive]}>{u}</Text>
            </TouchableOpacity>
          ))}
        </View>

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
          value={notes}
          onChangeText={setNotes}
          placeholderTextColor={theme.colors.textSecondary}
        />

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerTitle}>For recording only</Text>
          <Text style={styles.disclaimerText}>MyBabySteps does not provide dosing advice.</Text>
        </View>

        <PrimaryButton
          title={loading ? 'Saving...' : 'Save Medicine'}
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
    fontSize: theme.typography.metadata.fontSize,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  input: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.input,
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    minHeight: 48,
    justifyContent: 'center',
  },
  inputText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
  },
  unitRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  unitPill: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  unitPillActive: {
    backgroundColor: theme.colors.teal,
    borderColor: theme.colors.teal,
  },
  unitPillText: {
    fontSize: theme.typography.bodySmall.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.textSecondary,
  },
  unitPillTextActive: {
    color: theme.colors.white,
  },
  disclaimer: {
    backgroundColor: theme.colors.yellow,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  disclaimerTitle: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '700' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  disclaimerText: {
    fontSize: theme.typography.bodySmall.fontSize,
    color: theme.colors.textSecondary,
  },
  submitButton: {
    marginBottom: theme.spacing.xl,
  },
});
