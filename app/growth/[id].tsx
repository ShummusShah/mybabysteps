import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Header } from '@/components/ui/Header';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { supabase } from '@/lib/auth/supabase';
import { theme } from '@/constants/theme';
import { safeBack } from '@/lib/utils/navigation';

export default function GrowthDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const { data: growthLog } = useQuery({
    queryKey: ['growth', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('growth_logs')
        .select('*, creator:profiles(display_name, email)')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  async function handleDelete() {
    Alert.alert('Delete Growth Log', 'Are you sure? This cannot be undone.', [
      { text: 'Cancel', onPress: () => {}, style: 'cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          setLoading(true);
          try {
            const { error } = await supabase.from('growth_logs').delete().eq('id', id);

            if (error) throw error;

            queryClient.invalidateQueries({ queryKey: ['growth_logs'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            queryClient.invalidateQueries({ queryKey: ['today-timeline'] });
            queryClient.invalidateQueries({ queryKey: ['log-entries'] });
            queryClient.invalidateQueries({ queryKey: ['growth-insights'] });

            Alert.alert('Success', 'Growth log deleted', [
              {
                text: 'OK',
                onPress: () => safeBack(router, '/(tabs)'),
              },
            ]);
          } catch (error) {
            Alert.alert('Error', (error as any)?.message || 'Failed to delete');
          } finally {
            setLoading(false);
          }
        },
        style: 'destructive',
      },
    ]);
  }

  if (!growthLog) {
    return (
      <ScreenContainer>
        <Header title="Growth Log" leftAction={() => safeBack(router, '/(tabs)')} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Loading...</Text>
        </View>
      </ScreenContainer>
    );
  }

  const measuredAt = new Date(growthLog.measured_at);
  const primaryValue =
    growthLog.weight != null
      ? `${growthLog.weight}${growthLog.weight_unit || ''}`
      : growthLog.height != null
        ? `${growthLog.height}${growthLog.height_unit || ''}`
        : growthLog.head_circumference != null
          ? `${growthLog.head_circumference}cm`
          : '--';

  return (
    <ScreenContainer scrollable>
      <Header title="Growth Log" leftAction={() => safeBack(router, '/(tabs)')} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.header}>
            <MaterialCommunityIcons name="scale-bathroom" size={32} color={theme.colors.success} />
            <View style={styles.headerText}>
              <Text style={styles.primaryValue}>{primaryValue}</Text>
              <Text style={styles.timestamp}>{measuredAt.toLocaleString()}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {growthLog.weight != null && (
            <View style={styles.detail}>
              <Text style={styles.label}>Weight</Text>
              <Text style={styles.value}>{growthLog.weight}{growthLog.weight_unit || ''}</Text>
            </View>
          )}

          {growthLog.height != null && (
            <View style={styles.detail}>
              <Text style={styles.label}>Height</Text>
              <Text style={styles.value}>{growthLog.height}{growthLog.height_unit || ''}</Text>
            </View>
          )}

          {growthLog.head_circumference != null && (
            <View style={styles.detail}>
              <Text style={styles.label}>Head Circumference</Text>
              <Text style={styles.value}>{growthLog.head_circumference}cm</Text>
            </View>
          )}

          {growthLog.notes && (
            <View style={styles.detail}>
              <Text style={styles.label}>Notes</Text>
              <Text style={styles.value}>{growthLog.notes}</Text>
            </View>
          )}

          <View style={styles.detail}>
            <Text style={styles.label}>Logged by</Text>
            <Text style={styles.value}>
              {growthLog.creator?.display_name || growthLog.creator?.email || 'Unknown'}
            </Text>
          </View>
        </View>

        <PrimaryButton
          title="Delete Log"
          onPress={handleDelete}
          loading={loading}
          disabled={loading}
          variant="danger"
          style={styles.deleteButton}
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
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.medium,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  headerText: {
    marginLeft: theme.spacing.lg,
    flex: 1,
  },
  primaryValue: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: theme.colors.text,
  },
  timestamp: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
  },
  detail: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.typography.label.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  value: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
  },
  deleteButton: {
    marginBottom: theme.spacing.xl,
  },
});
