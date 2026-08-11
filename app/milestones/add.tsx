import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Header } from '@/components/ui/Header';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useMilestones } from '@/hooks/useMilestones';
import { theme } from '@/constants/theme';

const COMMON_MILESTONES = [
  'First smile',
  'Rolled over',
  'First laugh',
  'Sat up unassisted',
  'First tooth',
  'Started crawling',
  'Pulled to stand',
  'First word',
  'First steps',
  'Waved bye-bye',
];

export default function AddMilestoneScreen() {
  const router = useRouter();
  const { createMilestone } = useMilestones();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSave(selectedTitle?: string) {
    const finalTitle = (selectedTitle || title).trim();
    if (!finalTitle) {
      Alert.alert('Missing title', 'Please enter or select a milestone.');
      return;
    }

    setLoading(true);
    try {
      await createMilestone({
        title: finalTitle,
        notes: notes.trim() || undefined,
        isCustom: !selectedTitle,
      });
      router.back();
    } catch (error) {
      Alert.alert('Error', (error as any)?.message || 'Failed to save milestone');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer scrollable>
      <Header title="Add Milestone" leftAction={() => router.back()} />

      <View style={styles.content}>
        <Text style={styles.label}>Quick add</Text>
        <View style={styles.chipGrid}>
          {COMMON_MILESTONES.map((item) => (
            <TouchableOpacity
              key={item}
              style={styles.chip}
              onPress={() => handleSave(item)}
              disabled={loading}
            >
              <MaterialCommunityIcons name="star-outline" size={16} color={theme.colors.teal} />
              <Text style={styles.chipText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, styles.customLabel]}>Or write your own</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Said grandma's name"
          placeholderTextColor={theme.colors.textSecondary}
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Notes (optional)</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          placeholder="Any details worth remembering..."
          placeholderTextColor={theme.colors.textSecondary}
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        <PrimaryButton
          title={loading ? 'Saving...' : 'Save Milestone'}
          onPress={() => handleSave()}
          loading={loading}
          disabled={loading || !title.trim()}
          style={styles.saveButton}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  label: {
    fontSize: theme.typography.label.fontSize,
    fontWeight: theme.typography.label.fontWeight,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  customLabel: {
    marginTop: theme.spacing.xl,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.mint,
    borderRadius: theme.borderRadius.button,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  chipText: {
    fontSize: theme.typography.bodySmall.fontSize,
    fontWeight: '500' as const,
    color: theme.colors.teal,
  },
  input: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.input,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    marginBottom: theme.spacing.xl,
  },
  notesInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    marginBottom: theme.spacing.xl,
  },
});
