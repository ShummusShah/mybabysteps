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
import { safeBack } from '@/lib/utils/navigation';
import { formatTime } from '@/lib/utils/dateUtils';
import { useStore } from '@/stores/useStore';

export default function AddGrowthScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { baby } = useBaby();
  const { userPreferences } = useStore();

  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [headCircumference, setHeadCircumference] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!baby) {
      Alert.alert('Error', 'No baby selected');
      return;
    }

    if (!weight.trim() && !height.trim() && !headCircumference.trim()) {
      Alert.alert('Error', 'Please enter at least one measurement');
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

      const { error } = await supabase.from('growth_logs').insert({
        baby_id: baby.id,
        created_by: user.id,
        weight: weight ? parseFloat(weight) : null,
        height: height ? parseFloat(height) : null,
        head_circumference: headCircumference ? parseFloat(headCircumference) : null,
        weight_unit: userPreferences.weightUnit,
        height_unit: userPreferences.heightUnit,
        measured_at: date.toISOString(),
        notes: notes || null,
      });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['growth_logs'] });
      queryClient.invalidateQueries({ queryKey: ['log-entries'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['today-timeline'] });

      Alert.alert('Success', '📏 Growth measurement logged!', [
        {
          text: 'Done',
          onPress: () => safeBack(router, '/(tabs)'),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', (error as any)?.message || 'Failed to log growth');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer scrollable>
      <Header title="Log Growth" leftAction={() => safeBack(router, '/(tabs)')} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Measurements</Text>

        <Text style={styles.label}>Weight ({userPreferences.weightUnit})</Text>
        <TextInput
          style={styles.input}
          placeholder={`e.g., 5.5 ${userPreferences.weightUnit}`}
          value={weight}
          onChangeText={setWeight}
          keyboardType="decimal-pad"
          placeholderTextColor={theme.colors.textSecondary}
        />

        <Text style={styles.label}>Height ({userPreferences.heightUnit})</Text>
        <TextInput
          style={styles.input}
          placeholder={`e.g., 65 ${userPreferences.heightUnit}`}
          value={height}
          onChangeText={setHeight}
          keyboardType="decimal-pad"
          placeholderTextColor={theme.colors.textSecondary}
        />

        <Text style={styles.label}>Head Circumference (cm)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 40.5"
          value={headCircumference}
          onChangeText={setHeadCircumference}
          keyboardType="decimal-pad"
          placeholderTextColor={theme.colors.textSecondary}
        />

        <Text style={styles.label}>Date</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <MaterialCommunityIcons name="calendar-outline" size={20} color={theme.colors.teal} />
          <Text style={styles.dateButtonText}>
            {date.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="spinner"
            onChange={(event, selected) => {
              setShowDatePicker(false);
              if (selected) setDate(selected);
            }}
          />
        )}

        <Text style={styles.label}>Notes (Optional)</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          placeholder="e.g., Measured at pediatrician..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          placeholderTextColor={theme.colors.textSecondary}
        />

        <PrimaryButton
          title={loading ? 'Saving...' : 'Save Growth'}
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
  notesInput: {
    minHeight: 80,
    paddingTop: theme.spacing.md,
    textAlignVertical: 'top',
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
