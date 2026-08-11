import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBaby } from '@/hooks/useBaby';
import { supabase } from '@/lib/auth/supabase';
import { theme } from '@/constants/theme';
import {
  formatTime,
  formatDuration,
  formatElapsedTime,
  groupByDate,
} from '@/lib/utils/dateUtils';
import { formatMilk } from '@/lib/utils/unitConversion';
import { useStore } from '@/stores/useStore';
import { useQuery } from '@tanstack/react-query';

interface LogEntry {
  id: string;
  type: 'feed' | 'sleep' | 'nappy' | 'medicine' | 'temperature';
  timestamp: string;
  title: string;
  subtitle: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  data: any;
}

export default function HistoryScreen() {
  const router = useRouter();
  const { baby } = useBaby();
  const { userPreferences } = useStore();

  const { data: logs, isLoading } = useQuery({
    queryKey: ['history', baby?.id],
    queryFn: async () => {
      if (!baby) return [];

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const [feeds, sleeps, nappies, medicines, temperatures] = await Promise.all([
        supabase
          .from('feeding_logs')
          .select('*')
          .eq('baby_id', baby.id)
          .gte('start_time', sevenDaysAgo.toISOString())
          .order('start_time', { ascending: false }),
        supabase
          .from('sleep_logs')
          .select('*')
          .eq('baby_id', baby.id)
          .gte('start_time', sevenDaysAgo.toISOString())
          .order('start_time', { ascending: false }),
        supabase
          .from('nappy_logs')
          .select('*')
          .eq('baby_id', baby.id)
          .gte('logged_at', sevenDaysAgo.toISOString())
          .order('logged_at', { ascending: false }),
        supabase
          .from('medicine_logs')
          .select('*')
          .eq('baby_id', baby.id)
          .gte('given_at', sevenDaysAgo.toISOString())
          .order('given_at', { ascending: false }),
        supabase
          .from('temperature_logs')
          .select('*')
          .eq('baby_id', baby.id)
          .gte('taken_at', sevenDaysAgo.toISOString())
          .order('taken_at', { ascending: false }),
      ]);

      const items: LogEntry[] = [];

      (feeds.data || []).forEach((feed) => {
        items.push({
          id: feed.id,
          type: 'feed',
          timestamp: feed.start_time,
          title: feed.feed_type === 'breast' ? 'Breastfeed' : 'Bottle',
          subtitle:
            feed.feed_type === 'breast'
              ? `${feed.left_duration_seconds}s + ${feed.right_duration_seconds}s`
              : `${formatMilk(feed.amount_ml || 0, userPreferences.milkUnit)}`,
          icon: 'bottle-soda',
          data: feed,
        });
      });

      (sleeps.data || []).forEach((sleep) => {
        const endTime = sleep.end_time ? new Date(sleep.end_time).getTime() : Date.now();
        const duration = Math.floor((endTime - new Date(sleep.start_time).getTime()) / 1000);
        items.push({
          id: sleep.id,
          type: 'sleep',
          timestamp: sleep.start_time,
          title: sleep.sleep_type === 'night' ? '🌙 Night Sleep' : '🌤️ Nap',
          subtitle: `${formatDuration(duration)}`,
          icon: 'sleep',
          data: sleep,
        });
      });

      (nappies.data || []).forEach((nappy) => {
        const typeLabel =
          nappy.type === 'both'
            ? 'Wet + dirty'
            : nappy.type.charAt(0).toUpperCase() + nappy.type.slice(1);
        items.push({
          id: nappy.id,
          type: 'nappy',
          timestamp: nappy.logged_at,
          title: 'Nappy',
          subtitle: typeLabel,
          icon: 'water',
          data: nappy,
        });
      });

      (medicines.data || []).forEach((medicine) => {
        items.push({
          id: medicine.id,
          type: 'medicine',
          timestamp: medicine.given_at,
          title: 'Medicine',
          subtitle: medicine.medicine_name,
          icon: 'pill',
          data: medicine,
        });
      });

      (temperatures.data || []).forEach((temperature) => {
        const displayTemp = `${temperature.temperature.toFixed(1)}°${temperature.unit}`;
        const isFever =
          temperature.unit === 'C'
            ? temperature.temperature >= 38
            : temperature.temperature >= 100.4;
        items.push({
          id: temperature.id,
          type: 'temperature',
          timestamp: temperature.taken_at,
          title: 'Temperature',
          subtitle: displayTemp,
          icon: isFever ? 'thermometer-alert' : 'thermometer',
          data: temperature,
        });
      });

      return items.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    },
    enabled: !!baby,
  });

  const groupedLogs = logs ? groupByDate(logs, 'timestamp') : {};

  const handleNavigate = (item: LogEntry) => {
    if (item.type === 'feed') router.push(`/feed/${item.id}`);
    else if (item.type === 'sleep') router.push(`/sleep/${item.id}`);
    else if (item.type === 'nappy') router.push(`/nappy/${item.id}`);
    else if (item.type === 'medicine') router.push(`/medicine/${item.id}`);
    else if (item.type === 'temperature') router.push(`/temperature/${item.id}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>History</Text>
          <Text style={styles.subtitle}>Last 7 days of tracking</Text>
        </View>

        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.colors.teal} />
          </View>
        ) : logs && logs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="history"
              size={64}
              color={theme.colors.textSecondary}
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyTitle}>No logs yet</Text>
            <Text style={styles.emptySubtitle}>Start tracking your baby's day</Text>
          </View>
        ) : (
          <View style={styles.content}>
            {Object.entries(groupedLogs).map(([dateLabel, dateItems]: [string, any]) => (
              <View key={dateLabel}>
                {/* Date Header */}
                <Text style={styles.dateHeader}>{dateLabel}</Text>

                {/* Logs for this date */}
                <View style={styles.logsList}>
                  {dateItems.map((item: LogEntry) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.logItem}
                      onPress={() => handleNavigate(item)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.logIcon}>
                        <MaterialCommunityIcons
                          name={item.icon}
                          size={20}
                          color={theme.colors.teal}
                        />
                      </View>

                      <View style={styles.logContent}>
                        <Text style={styles.logTitle}>{item.title}</Text>
                        <Text style={styles.logSubtitle}>{item.subtitle}</Text>
                      </View>

                      <View style={styles.logMeta}>
                        <Text style={styles.logTime}>
                          {new Date(item.timestamp).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                          })}
                        </Text>
                        <MaterialCommunityIcons
                          name="chevron-right"
                          size={20}
                          color={theme.colors.textSecondary}
                        />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.screenTitle.fontSize,
    fontWeight: theme.typography.screenTitle.fontWeight,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
    minHeight: 400,
    justifyContent: 'center',
  },
  emptyIcon: {
    marginBottom: theme.spacing.lg,
    opacity: 0.3,
  },
  emptyTitle: {
    fontSize: theme.typography.sectionTitle.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
  },
  dateHeader: {
    fontSize: theme.typography.label.fontSize,
    fontWeight: '700' as const,
    color: theme.colors.text,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  logsList: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.input,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  logIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: theme.colors.mint,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  logContent: {
    flex: 1,
  },
  logTitle: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  logSubtitle: {
    fontSize: theme.typography.metadata.fontSize,
    color: theme.colors.textSecondary,
  },
  logMeta: {
    alignItems: 'flex-end',
    gap: theme.spacing.sm,
  },
  logTime: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '500' as const,
    color: theme.colors.text,
  },
  spacer: {
    height: theme.spacing.xl,
  },
});
