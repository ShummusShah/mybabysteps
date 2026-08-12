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
import { formatTime, formatDuration, formatElapsedTime } from '@/lib/utils/dateUtils';
import { useQueryClient } from '@tanstack/react-query';

export default function SleepDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [log, setLog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadSleep();
  }, [id]);

  async function loadSleep() {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('sleep_logs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setLog(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load sleep details');
      safeBack(router, '/(tabs)');
    } finally {
      setLoading(false);
    }
  }

  async function deleteSleep() {
    Alert.alert('Delete Sleep?', 'This cannot be undone.', [
      { text: 'Cancel', onPress: () => {}, style: 'cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          setDeleting(true);
          try {
            const { error } = await supabase
              .from('sleep_logs')
              .delete()
              .eq('id', id);

            if (error) throw error;

            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            queryClient.invalidateQueries({ queryKey: ['sleep'] });
            queryClient.invalidateQueries({ queryKey: ['today-timeline'] });
            queryClient.invalidateQueries({ queryKey: ['log-entries'] });

            Alert.alert('Deleted', 'Sleep log removed', [
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
        <Header title="Sleep Details" leftAction={() => safeBack(router, '/(tabs)')} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.teal} />
        </View>
      </ScreenContainer>
    );
  }

  if (!log) {
    return (
      <ScreenContainer>
        <Header title="Sleep Details" leftAction={() => safeBack(router, '/(tabs)')} />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Sleep log not found</Text>
        </View>
      </ScreenContainer>
    );
  }

  const startTime = new Date(log.start_time);
  const endTime = log.end_time ? new Date(log.end_time) : null;
  const durationMs = endTime ? endTime.getTime() - startTime.getTime() : 0;
  const durationSeconds = Math.floor(durationMs / 1000);

  return (
    <ScreenContainer scrollable>
      <Header title="Sleep Details" leftAction={() => safeBack(router, '/(tabs)')} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Sleep Type */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name={log.sleep_type === 'night' ? 'weather-night' : 'weather-partly-cloudy'}
              size={20}
              color={theme.colors.teal}
            />
            <Text style={styles.sectionTitle}>Sleep Type</Text>
          </View>
          <Text style={styles.value}>
            {log.sleep_type === 'night' ? '🌙 Night Sleep' : '🌤️ Nap'}
          </Text>
        </View>

        {/* Start Time */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="clock-start"
              size={20}
              color={theme.colors.teal}
            />
            <Text style={styles.sectionTitle}>Started</Text>
          </View>
          <Text style={styles.value}>{formatTime(startTime)}</Text>
        </View>

        {/* End Time */}
        {endTime && (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons
                  name="clock-end"
                  size={20}
                  color={theme.colors.teal}
                />
                <Text style={styles.sectionTitle}>Ended</Text>
              </View>
              <Text style={styles.value}>{formatTime(endTime)}</Text>
            </View>

            {/* Duration */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons
                  name="timer-sand"
                  size={20}
                  color={theme.colors.teal}
                />
                <Text style={styles.sectionTitle}>Duration</Text>
              </View>
              <Text style={styles.largeValue}>
                {formatDuration(durationSeconds)}
              </Text>
            </View>
          </>
        )}

        {/* Ongoing */}
        {!endTime && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons
                name="timer"
                size={20}
                color={theme.colors.peach}
              />
              <Text style={styles.sectionTitle}>Status</Text>
            </View>
            <Text style={styles.value}>Currently sleeping...</Text>
          </View>
        )}

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
          title={deleting ? 'Deleting...' : 'Delete Sleep Log'}
          onPress={deleteSleep}
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
  largeValue: {
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
