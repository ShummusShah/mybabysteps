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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Header } from '@/components/ui/Header';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { supabase } from '@/lib/auth/supabase';
import { theme } from '@/constants/theme';
import { safeBack } from '@/lib/utils/navigation';
import { formatTime, formatDuration } from '@/lib/utils/dateUtils';
import { useStore } from '@/stores/useStore';
import { useQueryClient } from '@tanstack/react-query';

export default function FeedDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { userPreferences } = useStore();

  const [log, setLog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadFeed();
  }, [id]);

  async function loadFeed() {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('feeding_logs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setLog(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load feed details');
      safeBack(router, '/(tabs)');
    } finally {
      setLoading(false);
    }
  }

  async function deleteFeed() {
    Alert.alert('Delete Feed?', 'This cannot be undone.', [
      { text: 'Cancel', onPress: () => {}, style: 'cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          setDeleting(true);
          try {
            const { error } = await supabase
              .from('feeding_logs')
              .delete()
              .eq('id', id);

            if (error) throw error;

            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            queryClient.invalidateQueries({ queryKey: ['feeding'] });
            queryClient.invalidateQueries({ queryKey: ['today-timeline'] });
            queryClient.invalidateQueries({ queryKey: ['log-entries'] });

            Alert.alert('Deleted', 'Feed log removed', [
              {
                text: 'OK',
                onPress: () => safeBack(router, '/(tabs)'),
              },
            ]);
          } catch (error) {
            Alert.alert('Error', (error as any)?.message || 'Failed to delete');
          } finally {
            setDeleting(false);
          }
        },
        style: 'destructive',
      },
    ]);
  }

  if (loading) {
    return (
      <ScreenContainer>
        <Header title="Feed Details" leftAction={() => safeBack(router, '/(tabs)')} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.teal} />
        </View>
      </ScreenContainer>
    );
  }

  if (!log) {
    return (
      <ScreenContainer>
        <Header title="Feed Details" leftAction={() => safeBack(router, '/(tabs)')} />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Feed not found</Text>
        </View>
      </ScreenContainer>
    );
  }

  const startTime = new Date(log.start_time);
  const endTime = new Date(log.end_time);
  const durationMs = endTime.getTime() - startTime.getTime();
  const durationSeconds = Math.floor(durationMs / 1000);

  return (
    <ScreenContainer scrollable>
      <Header
        title="Feed Details"
        leftAction={() => safeBack(router, '/(tabs)')}
        rightAction={() => setIsEditing(!isEditing)}
        rightLabel={isEditing ? 'Cancel' : 'Edit'}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Feed Type */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="bottle-soda"
              size={20}
              color={theme.colors.teal}
            />
            <Text style={styles.sectionTitle}>Feed Type</Text>
          </View>
          <Text style={styles.value}>
            {log.feed_type === 'breast'
              ? 'Breastfeed'
              : log.feed_type === 'bottle'
                ? 'Bottle'
                : 'Pump'}
          </Text>
        </View>

        {/* Breastfeed Details */}
        {log.feed_type === 'breast' && (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={20}
                  color={theme.colors.teal}
                />
                <Text style={styles.sectionTitle}>Duration</Text>
              </View>
              <View style={styles.durationGrid}>
                <View style={styles.durationItem}>
                  <Text style={styles.durationLabel}>Left</Text>
                  <Text style={styles.durationValue}>
                    {formatDuration(log.left_duration_seconds || 0)}
                  </Text>
                </View>
                <View style={styles.durationItem}>
                  <Text style={styles.durationLabel}>Right</Text>
                  <Text style={styles.durationValue}>
                    {formatDuration(log.right_duration_seconds || 0)}
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}

        {/* Bottle Details */}
        {log.feed_type === 'bottle' && (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons
                  name="bottle-soda"
                  size={20}
                  color={theme.colors.teal}
                />
                <Text style={styles.sectionTitle}>Milk Type</Text>
              </View>
              <Text style={styles.value}>
                {log.milk_type
                  ? log.milk_type.charAt(0).toUpperCase() + log.milk_type.slice(1)
                  : 'Not specified'}
              </Text>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons
                  name="beaker-outline"
                  size={20}
                  color={theme.colors.teal}
                />
                <Text style={styles.sectionTitle}>Amount</Text>
              </View>
              <Text style={styles.value}>
                {log.amount_ml} {userPreferences.milkUnit === 'ml' ? 'ml' : 'fl oz'}
              </Text>
            </View>
          </>
        )}

        {/* Pump Details */}
        {log.feed_type === 'pump' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons
                name="water-pump"
                size={20}
                color={theme.colors.teal}
              />
              <Text style={styles.sectionTitle}>Volume</Text>
            </View>
            <View style={styles.durationGrid}>
              <View style={styles.durationItem}>
                <Text style={styles.durationLabel}>Left</Text>
                <Text style={styles.durationValue}>
                  {log.left_duration_seconds} {userPreferences.milkUnit}
                </Text>
              </View>
              <View style={styles.durationItem}>
                <Text style={styles.durationLabel}>Right</Text>
                <Text style={styles.durationValue}>
                  {log.right_duration_seconds} {userPreferences.milkUnit}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Time */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="clock"
              size={20}
              color={theme.colors.teal}
            />
            <Text style={styles.sectionTitle}>Time</Text>
          </View>
          <Text style={styles.value}>{formatTime(startTime)}</Text>
        </View>

        {/* Notes */}
        {log.notes && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons
                name="note-outline"
                size={20}
                color={theme.colors.teal}
              />
              <Text style={styles.sectionTitle}>Notes</Text>
            </View>
            <Text style={styles.value}>{log.notes}</Text>
          </View>
        )}

        {/* Delete Button */}
        <PrimaryButton
          title={deleting ? 'Deleting...' : 'Delete Feed Log'}
          onPress={deleteFeed}
          variant="danger"
          loading={deleting}
          disabled={deleting}
          style={styles.deleteButton}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.input,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.label.fontSize,
    fontWeight: theme.typography.label.fontWeight,
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
  },
  value: {
    fontSize: theme.typography.cardHeadline.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  durationGrid: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  durationItem: {
    flex: 1,
  },
  durationLabel: {
    fontSize: theme.typography.metadata.fontSize,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  durationValue: {
    fontSize: theme.typography.largeStats.fontSize,
    fontWeight: theme.typography.largeStats.fontWeight,
    color: theme.colors.teal,
  },
  deleteButton: {
    marginBottom: theme.spacing.xl,
  },
  errorText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.error,
  },
});
