import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Header } from '@/components/ui/Header';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { supabase } from '@/lib/auth/supabase';
import { theme } from '@/constants/theme';
import { formatTime } from '@/lib/utils/dateUtils';

export default function TemperatureDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const { data: temperatureLog } = useQuery({
    queryKey: ['temperature', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('temperature_logs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  async function handleDelete() {
    Alert.alert('Delete Temperature Log', 'Are you sure? This cannot be undone.', [
      { text: 'Cancel', onPress: () => {}, style: 'cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          setLoading(true);
          try {
            const { error } = await supabase
              .from('temperature_logs')
              .delete()
              .eq('id', id);

            if (error) throw error;

            queryClient.invalidateQueries({ queryKey: ['temperature_logs'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });

            Alert.alert('Success', 'Temperature log deleted', [
              {
                text: 'OK',
                onPress: () => router.back(),
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

  if (!temperatureLog) {
    return (
      <ScreenContainer>
        <Header title="Temperature Log" leftAction={() => router.back()} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Loading...</Text>
        </View>
      </ScreenContainer>
    );
  }

  const logTime = new Date(temperatureLog.taken_at);
  const tempFormatted = `${temperatureLog.temperature.toFixed(1)}°${temperatureLog.unit}`;
  const isFever =
    temperatureLog.unit === 'C'
      ? temperatureLog.temperature >= 38
      : temperatureLog.temperature >= 100.4;

  return (
    <ScreenContainer scrollable>
      <Header title="Temperature Log" leftAction={() => router.back()} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, isFever && styles.cardFever]}>
          <View style={styles.header}>
            <MaterialCommunityIcons
              name={isFever ? 'thermometer-alert' : 'thermometer'}
              size={32}
              color={isFever ? theme.colors.error : theme.colors.teal}
            />
            <View style={styles.headerText}>
              <Text style={styles.temperature}>{tempFormatted}</Text>
              {isFever && <Text style={styles.feverWarning}>Fever detected</Text>}
              <Text style={styles.timestamp}>{formatTime(logTime)}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detail}>
            <Text style={styles.label}>Unit</Text>
            <Text style={styles.value}>°{temperatureLog.unit}</Text>
          </View>

          {temperatureLog.notes && (
            <View style={styles.detail}>
              <Text style={styles.label}>Notes</Text>
              <Text style={styles.value}>{temperatureLog.notes}</Text>
            </View>
          )}

          <View style={styles.detail}>
            <Text style={styles.label}>Logged At</Text>
            <Text style={styles.value}>{logTime.toLocaleString()}</Text>
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
  cardFever: {
    backgroundColor: '#fff5f5',
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error,
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
  temperature: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: theme.colors.text,
  },
  feverWarning: {
    fontSize: theme.typography.metadata.fontSize,
    color: theme.colors.error,
    fontWeight: '600' as const,
    marginTop: theme.spacing.xs,
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
