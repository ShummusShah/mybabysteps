import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';
import { useInsightsSummary, InsightsRange } from '@/hooks/useInsightsSummary';

const RANGE_OPTIONS: { value: InsightsRange; label: string }[] = [
  { value: 7, label: '7 Days' },
  { value: 30, label: '30 Days' },
  { value: 'all', label: 'All time' },
];

function formatHoursMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours}h ${mins}m`;
}

export default function InsightsScreen() {
  const router = useRouter();
  const [range, setRange] = useState<InsightsRange>(7);
  const {
    averageSleepMinutes,
    feedsPerDay,
    avgBottleMl,
    nappiesPerDay,
    tummyMinutesPerDay,
    weightChangeKgPerWeek,
    sleepInsight,
    isLoading,
  } = useInsightsSummary(range);

  const periodLabel = range === 7 ? 'This week' : range === 30 ? 'This month' : 'Overall';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Insights</Text>

        <View style={styles.rangeRow}>
          {RANGE_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={String(opt.value)}
              style={[styles.rangePill, range === opt.value && styles.rangePillActive]}
              onPress={() => setRange(opt.value)}
            >
              <Text style={[styles.rangePillText, range === opt.value && styles.rangePillTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.teal} />
          </View>
        ) : (
          <>
            <View style={styles.grid}>
              <TouchableOpacity
                style={styles.tile}
                onPress={() => router.push('/insights/sleep')}
                activeOpacity={0.7}
              >
                <Text style={styles.tileLabel}>Average sleep</Text>
                <Text style={styles.tileValue}>{formatHoursMinutes(averageSleepMinutes)}</Text>
                <View style={styles.tileBarTrack}>
                  <View style={[styles.tileBarFill, { width: '70%', backgroundColor: theme.colors.purple }]} />
                </View>
              </TouchableOpacity>

              <View style={styles.tile}>
                <Text style={styles.tileLabel}>Feeds / day</Text>
                <Text style={styles.tileValue}>{feedsPerDay}</Text>
                <View style={styles.tileBarTrack}>
                  <View style={[styles.tileBarFill, { width: '65%', backgroundColor: theme.colors.teal }]} />
                </View>
              </View>

              <View style={styles.tile}>
                <Text style={styles.tileLabel}>Avg bottle</Text>
                <Text style={styles.tileValue}>{avgBottleMl != null ? `${avgBottleMl} ml` : '--'}</Text>
                <View style={styles.tileBarTrack}>
                  <View style={[styles.tileBarFill, { width: '55%', backgroundColor: theme.colors.teal }]} />
                </View>
              </View>

              <View style={styles.tile}>
                <Text style={styles.tileLabel}>Nappies / day</Text>
                <Text style={styles.tileValue}>{nappiesPerDay}</Text>
                <View style={styles.tileBarTrack}>
                  <View style={[styles.tileBarFill, { width: '60%', backgroundColor: theme.colors.orange }]} />
                </View>
              </View>

              <View style={styles.tile}>
                <Text style={styles.tileLabel}>Tummy time</Text>
                <Text style={styles.tileValue}>{tummyMinutesPerDay}m</Text>
                <View style={styles.tileBarTrack}>
                  <View style={[styles.tileBarFill, { width: '40%', backgroundColor: theme.colors.yellowAccent }]} />
                </View>
              </View>

              <View style={styles.tile}>
                <Text style={styles.tileLabel}>Weight change</Text>
                <Text style={styles.tileValue}>
                  {weightChangeKgPerWeek != null
                    ? `${weightChangeKgPerWeek >= 0 ? '+' : ''}${weightChangeKgPerWeek}kg/wk`
                    : '--'}
                </Text>
                <View style={styles.tileBarTrack}>
                  <View style={[styles.tileBarFill, { width: '50%', backgroundColor: theme.colors.success }]} />
                </View>
              </View>
            </View>

            {sleepInsight && (
              <View style={styles.insightBanner}>
                <Text style={styles.insightPeriod}>{periodLabel}</Text>
                <Text style={styles.insightText}>{sleepInsight}</Text>
                <Text style={styles.insightSubtext}>Based on your logged data only.</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.screenTitle.fontSize,
    fontWeight: theme.typography.screenTitle.fontWeight,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  rangeRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  rangePill: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  rangePillActive: {
    backgroundColor: theme.colors.mint,
    borderColor: theme.colors.mint,
  },
  rangePillText: {
    fontSize: theme.typography.bodySmall.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.textSecondary,
  },
  rangePillTextActive: {
    color: theme.colors.teal,
  },
  loadingContainer: {
    marginTop: theme.spacing.xl,
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  tile: {
    width: '47%',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.input,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
  },
  tileLabel: {
    fontSize: theme.typography.metadata.fontSize,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  tileValue: {
    fontSize: theme.typography.cardHeadline.fontSize,
    fontWeight: '700' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  tileBarTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.background,
    overflow: 'hidden',
  },
  tileBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  insightBanner: {
    backgroundColor: theme.colors.mint,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xxl,
  },
  insightPeriod: {
    fontSize: theme.typography.metadata.fontSize,
    fontWeight: '700' as const,
    color: theme.colors.teal,
    marginBottom: theme.spacing.sm,
  },
  insightText: {
    fontSize: theme.typography.cardHeadline.fontSize,
    fontWeight: '700' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  insightSubtext: {
    fontSize: theme.typography.bodySmall.fontSize,
    color: theme.colors.textSecondary,
  },
});
