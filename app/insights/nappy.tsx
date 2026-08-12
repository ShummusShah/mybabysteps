import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Header } from '@/components/ui/Header';
import { theme } from '@/constants/theme';
import { safeBack } from '@/lib/utils/navigation';
import { useNappyInsights } from '@/hooks/useNappyInsights';

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours}h ${mins}m`;
}

export default function NappyInsightsScreen() {
  const router = useRouter();
  const {
    averageNappiesPerDay,
    dailyTrend,
    wetCount,
    dirtyCount,
    bothCount,
    longestGapMinutes,
    isLoading,
  } = useNappyInsights();

  const maxCount = Math.max(...dailyTrend.map((d) => d.count), 1);

  return (
    <ScreenContainer scrollable>
      <Header title="Nappy Insights" leftLabel="‹" leftAction={() => safeBack(router, '/(tabs)/insights')} />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.orange} />
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.averageValue}>{averageNappiesPerDay}</Text>
          <Text style={styles.averageLabel}>Average nappies per day</Text>

          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Last 7 days</Text>
            <View style={styles.chartBars}>
              {dailyTrend.map((day, i) => (
                <View
                  key={i}
                  style={[
                    styles.bar,
                    { height: Math.max((day.count / maxCount) * 130, 6) },
                  ]}
                />
              ))}
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Wet</Text>
              <Text style={styles.statValue}>{wetCount}</Text>
              <View style={styles.statBarTrack}>
                <View style={[styles.statBarFill, { width: '60%' }]} />
              </View>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Dirty</Text>
              <Text style={styles.statValue}>{dirtyCount}</Text>
              <View style={styles.statBarTrack}>
                <View style={[styles.statBarFill, { width: '45%' }]} />
              </View>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Both</Text>
              <Text style={styles.statValue}>{bothCount}</Text>
              <View style={styles.statBarTrack}>
                <View style={[styles.statBarFill, { width: '30%' }]} />
              </View>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Longest gap</Text>
              <Text style={styles.statValue}>{formatDuration(longestGapMinutes)}</Text>
              <View style={styles.statBarTrack}>
                <View style={[styles.statBarFill, { width: '65%' }]} />
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  averageValue: {
    fontSize: 40,
    fontWeight: '700' as const,
    color: theme.colors.text,
  },
  averageLabel: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xl,
  },
  chartCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  chartTitle: {
    fontSize: theme.typography.label.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 130,
    paddingHorizontal: theme.spacing.sm,
  },
  bar: {
    width: 24,
    borderRadius: 8,
    backgroundColor: theme.colors.peach,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.input,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
  },
  statLabel: {
    fontSize: theme.typography.metadata.fontSize,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  statValue: {
    fontSize: theme.typography.cardHeadline.fontSize,
    fontWeight: '700' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  statBarTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.peach,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    backgroundColor: theme.colors.orange,
    borderRadius: 2,
  },
});
