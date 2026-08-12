import React, { useState } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Header } from '@/components/ui/Header';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useBaby } from '@/hooks/useBaby';
import { supabase } from '@/lib/auth/supabase';
import { theme } from '@/constants/theme';
import { safeBack } from '@/lib/utils/navigation';
import { flOzToMl } from '@/lib/utils/unitConversion';
import { useStore } from '@/stores/useStore';

const feedSchema = z.object({
  feedType: z.enum(['breast', 'bottle', 'pump']),
  milkType: z.enum(['formula', 'expressed', 'mixed', 'other']).optional(),
  amount: z.string().optional(),
  leftDuration: z.string().optional(),
  rightDuration: z.string().optional(),
  notes: z.string().optional(),
});

type FeedFormData = z.infer<typeof feedSchema>;

export default function AddFeedScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type?: string }>();
  const queryClient = useQueryClient();
  const { baby } = useBaby();
  const { userPreferences } = useStore();
  const [feedType, setFeedType] = useState(type === 'pump' ? 2 : 0); // 0=breast, 1=bottle, 2=pump
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FeedFormData>({
    resolver: zodResolver(feedSchema),
    defaultValues: {
      feedType: 'breast',
      amount: '',
      leftDuration: '',
      rightDuration: '',
      notes: '',
    },
  });

  async function onSubmit(data: FeedFormData) {
    if (!baby) {
      Alert.alert(
        'No Baby Profile',
        'Please create a baby profile first in your settings.',
        [{ text: 'OK', onPress: () => router.push('/profile') }]
      );
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      Alert.alert('Error', 'Not authenticated');
      return;
    }

    setLoading(true);
    try {
      const feedTypes = ['breast', 'bottle', 'pump'];
      const selectedFeedType = feedTypes[feedType];

      const now = new Date();
      let leftSeconds = 0;
      let rightSeconds = 0;
      let amountMl: number | null = null;

      const toMl = (value: string) => {
        const parsed = parseFloat(value || '0');
        return userPreferences.milkUnit === 'fl_oz' ? flOzToMl(parsed) : parsed;
      };

      if (selectedFeedType === 'breast') {
        leftSeconds = parseInt(data.leftDuration || '0', 10) * 60;
        rightSeconds = parseInt(data.rightDuration || '0', 10) * 60;
      } else if (selectedFeedType === 'bottle') {
        amountMl = toMl(data.amount || '0');
      } else if (selectedFeedType === 'pump') {
        amountMl = toMl(data.leftDuration || '0') + toMl(data.rightDuration || '0');
      }

      const { error } = await supabase.from('feeding_logs').insert({
        baby_id: baby.id,
        created_by: user.id,
        feed_type: selectedFeedType,
        milk_type: selectedFeedType === 'bottle' ? data.milkType : null,
        amount_ml: amountMl,
        left_duration_seconds: selectedFeedType === 'breast' ? leftSeconds : null,
        right_duration_seconds: selectedFeedType === 'breast' ? rightSeconds : null,
        start_time: now.toISOString(),
        end_time: now.toISOString(),
        notes: data.notes,
      });

      if (error) throw error;

      // Invalidate queries to update UI live
      queryClient.invalidateQueries({ queryKey: ['feeding_logs'] });
      queryClient.invalidateQueries({ queryKey: ['log-entries'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['today-timeline'] });

      Alert.alert('Success', 'Feed logged successfully!', [
        {
          text: 'Done',
          onPress: () => safeBack(router, '/(tabs)'),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', (error as any)?.message || 'Failed to log feed');
    } finally {
      setLoading(false);
    }
  }

  const feedTypes = ['Breastfeed', 'Bottle', 'Pump'];

  return (
    <ScreenContainer scrollable>
      <Header title="Log Feed" leftAction={() => safeBack(router, '/(tabs)')} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Feed Type Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>Feed Type</Text>
          <View style={styles.segmentedControl}>
            {feedTypes.map((label, index) => (
              <TouchableOpacity
                key={label}
                style={[
                  styles.segmentButton,
                  feedType === index && styles.segmentButtonActive,
                ]}
                onPress={() => setFeedType(index)}
              >
                <Text
                  style={[
                    styles.segmentButtonText,
                    feedType === index && styles.segmentButtonTextActive,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Breastfeed */}
        {feedType === 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Breastfeed Duration</Text>

            <View style={styles.durationRow}>
              <View style={styles.durationInput}>
                <Text style={styles.durationLabel}>Left Side (min)</Text>
                <Controller
                  control={control}
                  name="leftDuration"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={styles.inputField}
                      value={value}
                      onChangeText={onChange}
                      placeholder="0"
                      placeholderTextColor={theme.colors.textSecondary}
                      keyboardType="number-pad"
                    />
                  )}
                />
              </View>

              <View style={styles.durationInput}>
                <Text style={styles.durationLabel}>Right Side (min)</Text>
                <Controller
                  control={control}
                  name="rightDuration"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={styles.inputField}
                      value={value}
                      onChangeText={onChange}
                      placeholder="0"
                      placeholderTextColor={theme.colors.textSecondary}
                      keyboardType="number-pad"
                    />
                  )}
                />
              </View>
            </View>
          </View>
        )}

        {/* Bottle Feed */}
        {feedType === 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bottle Details</Text>

            <Text style={styles.label}>Milk Type</Text>
            <Controller
              control={control}
              name="milkType"
              render={({ field: { onChange, value } }) => (
                <View style={styles.milkTypeButtons}>
                  {['formula', 'expressed', 'mixed', 'other'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.milkTypeButton,
                        value === type && styles.milkTypeButtonActive,
                      ]}
                      onPress={() => onChange(type as any)}
                    >
                      <Text
                        style={[
                          styles.milkTypeButtonText,
                          value === type && styles.milkTypeButtonTextActive,
                        ]}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />

            <Text style={styles.label}>Amount ({userPreferences.milkUnit === 'ml' ? 'ml' : 'fl oz'})</Text>
            <Controller
              control={control}
              name="amount"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.inputField}
                  value={value}
                  onChangeText={onChange}
                  placeholder="0"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="decimal-pad"
                />
              )}
            />
          </View>
        )}

        {/* Pump Feed */}
        {feedType === 2 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pump Details</Text>

            <View style={styles.durationRow}>
              <View style={styles.durationInput}>
                <Text style={styles.durationLabel}>Left ({userPreferences.milkUnit === 'ml' ? 'ml' : 'fl oz'})</Text>
                <Controller
                  control={control}
                  name="leftDuration"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={styles.inputField}
                      value={value}
                      onChangeText={onChange}
                      placeholder="0"
                      placeholderTextColor={theme.colors.textSecondary}
                      keyboardType="decimal-pad"
                    />
                  )}
                />
              </View>

              <View style={styles.durationInput}>
                <Text style={styles.durationLabel}>Right ({userPreferences.milkUnit === 'ml' ? 'ml' : 'fl oz'})</Text>
                <Controller
                  control={control}
                  name="rightDuration"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={styles.inputField}
                      value={value}
                      onChangeText={onChange}
                      placeholder="0"
                      placeholderTextColor={theme.colors.textSecondary}
                      keyboardType="decimal-pad"
                    />
                  )}
                />
              </View>
            </View>
          </View>
        )}

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.label}>Notes (Optional)</Text>
          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.inputField, styles.notesInput]}
                value={value}
                onChangeText={onChange}
                placeholder="Add notes..."
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                numberOfLines={3}
              />
            )}
          />
        </View>

        <PrimaryButton
          title={loading ? 'Saving...' : 'Save Feed'}
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          style={styles.submitButton}
          disabled={loading}
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
  section: {
    marginBottom: theme.spacing.xl,
  },
  label: {
    fontSize: theme.typography.label.fontSize,
    fontWeight: theme.typography.label.fontWeight,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.typography.sectionTitle.fontSize,
    fontWeight: theme.typography.sectionTitle.fontWeight,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: theme.colors.border,
    borderRadius: theme.borderRadius.input,
    padding: 2,
    height: 40,
  },
  segmentButton: {
    flex: 1,
    borderRadius: theme.borderRadius.input - 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmentButtonActive: {
    backgroundColor: theme.colors.white,
  },
  segmentButtonText: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '500' as const,
    color: theme.colors.textSecondary,
  },
  segmentButtonTextActive: {
    color: theme.colors.teal,
    fontWeight: '600' as const,
  },
  durationRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  durationInput: {
    flex: 1,
  },
  durationLabel: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  inputField: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.input,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
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
  milkTypeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  milkTypeButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.input,
    alignItems: 'center',
    backgroundColor: theme.colors.white,
  },
  milkTypeButtonActive: {
    backgroundColor: theme.colors.mint,
    borderColor: theme.colors.teal,
  },
  milkTypeButtonText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    fontWeight: '600' as const,
  },
  milkTypeButtonTextActive: {
    color: theme.colors.teal,
  },
  submitButton: {
    marginBottom: theme.spacing.xl,
  },
});
