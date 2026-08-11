import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Header } from '@/components/ui/Header';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useBaby } from '@/hooks/useBaby';
import { supabase } from '@/lib/auth/supabase';
import { theme } from '@/constants/theme';

type NappyType = 'wet' | 'dirty' | 'both' | 'dry';
type NappyColour = 'yellow' | 'brown' | 'green' | 'black' | 'other' | null;
type NappyConsistency = 'loose' | 'soft' | 'formed' | 'hard' | 'other' | null;

export default function AddNappyScreen() {
  const router = useRouter();
  const { baby } = useBaby();
  const [selectedType, setSelectedType] = useState<NappyType | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [colour, setColour] = useState<NappyColour>(null);
  const [consistency, setConsistency] = useState<NappyConsistency>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  async function saveNappy(type: NappyType) {
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

      const { error } = await supabase.from('nappy_logs').insert({
        baby_id: baby.id,
        created_by: user.id,
        type,
        colour: colour || null,
        consistency: consistency || null,
        logged_at: new Date().toISOString(),
        notes: notes || null,
      });

      if (error) throw error;

      Alert.alert('Success', '💩 Nappy logged!', [
        {
          text: 'Done',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', (error as any)?.message || 'Failed to log nappy');
    } finally {
      setLoading(false);
    }
  }

  async function handleQuickLog(type: NappyType) {
    if (!colour && !consistency && !notes) {
      // Quick log - no details
      await saveNappy(type);
    } else {
      // Show details modal
      setSelectedType(type);
      setShowDetails(true);
    }
  }

  async function handleSaveWithDetails() {
    if (!selectedType) return;
    setShowDetails(false);
    await saveNappy(selectedType);
  }

  const nappyOptions = [
    {
      type: 'wet' as const,
      icon: 'water-circle',
      label: 'Wet',
      colour: theme.colors.mint,
      description: 'Wet nappy',
    },
    {
      type: 'dirty' as const,
      icon: 'cloud-circle',
      label: 'Dirty',
      colour: theme.colors.peach,
      description: 'Dirty nappy',
    },
    {
      type: 'both' as const,
      icon: 'checkbox-multiple-marked-circle',
      label: 'Both',
      colour: theme.colors.yellow,
      description: 'Wet & dirty',
    },
    {
      type: 'dry' as const,
      icon: 'check-circle',
      label: 'Dry',
      colour: theme.colors.lavender,
      description: 'Dry nappy',
    },
  ];

  const colourOptions: Array<{ value: NappyColour; label: string; emoji: string }> = [
    { value: 'yellow', label: 'Yellow', emoji: '💛' },
    { value: 'brown', label: 'Brown', emoji: '🟤' },
    { value: 'green', label: 'Green', emoji: '💚' },
    { value: 'black', label: 'Black', emoji: '🖤' },
    { value: 'other', label: 'Other', emoji: '❓' },
  ];

  const consistencyOptions: Array<{ value: NappyConsistency; label: string; emoji: string }> = [
    { value: 'loose', label: 'Loose', emoji: '💧' },
    { value: 'soft', label: 'Soft', emoji: '☁️' },
    { value: 'formed', label: 'Formed', emoji: '🍌' },
    { value: 'hard', label: 'Hard', emoji: '🪨' },
    { value: 'other', label: 'Other', emoji: '❓' },
  ];

  return (
    <ScreenContainer>
      <Header title="Log Nappy" leftAction={() => router.back()} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.instruction}>What type of nappy?</Text>
        <Text style={styles.hint}>Tap any button to log instantly, or long-press for details</Text>

        <View style={styles.buttonGrid}>
          {nappyOptions.map((option) => (
            <TouchableOpacity
              key={option.type}
              style={[
                styles.nappyButton,
                { backgroundColor: option.colour },
              ]}
              onPress={() => handleQuickLog(option.type)}
              onLongPress={() => {
                setSelectedType(option.type);
                setShowDetails(true);
              }}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name={option.icon}
                size={48}
                color={theme.colors.text}
              />
              <Text style={styles.nappyLabel}>{option.label}</Text>
              <Text style={styles.nappyDescription}>{option.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.hint Container}>
          <MaterialCommunityIcons
            name="lightbulb-outline"
            size={16}
            color={theme.colors.textSecondary}
          />
          <Text style={styles.hintText}>
            Tap for quick logging • Long-press to add details
          </Text>
        </View>
      </ScrollView>

      {/* Details Modal */}
      <Modal
        visible={showDetails}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowDetails(false)}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowDetails(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={theme.colors.text}
              />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Nappy Details</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Colour */}
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Colour (optional)</Text>
              <View style={styles.optionGrid}>
                {colourOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionButton,
                      colour === option.value && styles.optionButtonActive,
                    ]}
                    onPress={() => setColour(colour === option.value ? null : option.value)}
                  >
                    <Text style={styles.optionEmoji}>{option.emoji}</Text>
                    <Text
                      style={[
                        styles.optionLabel,
                        colour === option.value && styles.optionLabelActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Consistency */}
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Consistency (optional)</Text>
              <View style={styles.optionGrid}>
                {consistencyOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionButton,
                      consistency === option.value && styles.optionButtonActive,
                    ]}
                    onPress={() =>
                      setConsistency(consistency === option.value ? null : option.value)
                    }
                  >
                    <Text style={styles.optionEmoji}>{option.emoji}</Text>
                    <Text
                      style={[
                        styles.optionLabel,
                        consistency === option.value && styles.optionLabelActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Notes */}
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Notes (optional)</Text>
              <TouchableOpacity
                style={[styles.notesInput, notes && styles.notesInputActive]}
              >
                <Text
                  style={notes ? styles.notesText : styles.notesPlaceholder}
                >
                  {notes || 'Any observations...'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Save Button */}
            <PrimaryButton
              title={loading ? 'Saving...' : 'Save Nappy'}
              onPress={handleSaveWithDetails}
              loading={loading}
              disabled={loading}
              style={styles.saveButton}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  instruction: {
    fontSize: theme.typography.sectionTitle.fontSize,
    fontWeight: theme.typography.sectionTitle.fontWeight,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  hint: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xxl,
  },
  nappyButton: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: theme.borderRadius.card,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    ...theme.shadows.medium,
  },
  nappyLabel: {
    fontSize: theme.typography.cardHeadline.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  nappyDescription: {
    fontSize: theme.typography.metadata.fontSize,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.input,
    gap: theme.spacing.sm,
  },
  hintText: {
    fontSize: theme.typography.metadata.fontSize,
    color: theme.colors.textSecondary,
    flex: 1,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: theme.typography.screenTitle.fontSize,
    fontWeight: theme.typography.screenTitle.fontWeight,
    color: theme.colors.text,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  detailSection: {
    marginBottom: theme.spacing.xl,
  },
  detailLabel: {
    fontSize: theme.typography.label.fontSize,
    fontWeight: theme.typography.label.fontWeight,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  optionButton: {
    flex: 1,
    minWidth: '30%',
    aspectRatio: 0.9,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.input,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
  },
  optionButtonActive: {
    backgroundColor: theme.colors.mint,
    borderColor: theme.colors.teal,
  },
  optionEmoji: {
    fontSize: 24,
    marginBottom: theme.spacing.xs,
  },
  optionLabel: {
    fontSize: theme.typography.metadata.fontSize,
    color: theme.colors.text,
    fontWeight: '500' as const,
  },
  optionLabelActive: {
    color: theme.colors.teal,
  },
  notesInput: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.input,
    minHeight: 80,
    justifyContent: 'flex-start',
    backgroundColor: theme.colors.white,
  },
  notesInputActive: {
    borderColor: theme.colors.teal,
  },
  notesText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
  },
  notesPlaceholder: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
  },
  saveButton: {
    marginBottom: theme.spacing.xl,
  },
});
