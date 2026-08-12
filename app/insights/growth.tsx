import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Header } from '@/components/ui/Header';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { theme } from '@/constants/theme';
import { safeBack } from '@/lib/utils/navigation';
import { getDayLabel } from '@/lib/utils/dateUtils';
import { useGrowthInsights, GrowthMetric } from '@/hooks/useGrowthInsights';

const METRICS: { value: GrowthMetric; label: string }[] = [
  { value: 'weight', label: 'Weight' },
  { value: 'height', label: 'Length' },
  { value: 'head_circumference', label: 'Head' },
];

const CHART_WIDTH = 300;
const CHART_HEIGHT = 130;
const CHART_PADDING = 12;

export default function GrowthInsightsScreen() {
  const router = useRouter();
  const [metric, setMetric] = useState<GrowthMetric>('weight');
  const { unit, latestValue, latestDate, birthValue, change, trend, isLoading } = useGrowthInsights(metric);

  const values = trend.map((p) => p.value);
  const minValue = values.length > 0 ? Math.min(...values) : 0;
  const maxValue = values.length > 0 ? Math.max(...values) : 1;
  const range = maxValue - minValue || 1;

  const points = trend.map((p, i) => {
    const x =
      trend.length > 1
        ? CHART_PADDING + (i / (trend.length - 1)) * (CHART_WIDTH - CHART_PADDING * 2)
        : CHART_WIDTH / 2;
    const y =
      CHART_HEIGHT - CHART_PADDING - ((p.value - minValue) / range) * (CHART_HEIGHT - CHART_PADDING * 2);
    return { x, y };
  });

  const metricLabel = METRICS.find((m) => m.value === metric)?.label ?? '';

  return (
    <ScreenContainer scrollable>
      <Header title="Growth" leftLabel="‹" leftAction={() => safeBack(router, '/(tabs)/insights')} />

      <View style={styles.pillRow}>
        {METRICS.map((m) => (
          <TouchableOpacity
            key={m.value}
            style={[styles.pill, metric === m.value && styles.pillActive]}
            onPress={() => setMetric(m.value)}
          >
            <Text style={[styles.pillText, metric === m.value && styles.pillTextActive]}>{m.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.teal} />
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.averageValue}>
            {latestValue != null ? `${latestValue} ${unit}` : '--'}
          </Text>
          <Text style={styles.averageLabel}>
            {latestDate ? getDayLabel(latestDate) : `No ${metricLabel.toLowerCase()} logged yet`}
          </Text>

          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>{metricLabel} over time</Text>
            {points.length > 0 ? (
              <View style={styles.chartArea}>
                {points.length > 1 &&
                  points.slice(1).map((p, i) => {
                    const prev = points[i];
                    const dx = p.x - prev.x;
                    const dy = p.y - prev.y;
                    const length = Math.sqrt(dx * dx + dy * dy);
                    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
                    return (
                      <View
                        key={i}
                        style={[
                          styles.chartLine,
                          {
                            left: prev.x,
                            top: prev.y,
                            width: length,
                            transform: [{ rotate: `${angle}deg` }],
                          },
                        ]}
                      />
                    );
                  })}
                {points.map((p, i) => (
                  <View key={`dot-${i}`} style={[styles.chartDot, { left: p.x - 5, top: p.y - 5 }]} />
                ))}
              </View>
            ) : (
              <View style={styles.emptyChart}>
                <Text style={styles.emptyChartText}>Log a measurement to see the trend</Text>
              </View>
            )}
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Birth {metricLabel.toLowerCase()}</Text>
              <Text style={styles.statValue}>{birthValue != null ? `${birthValue} ${unit}` : '--'}</Text>
              <View style={styles.statBarTrack}>
                <View style={[styles.statBarFill, { width: '50%' }]} />
              </View>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Change</Text>
              <Text style={styles.statValue}>
                {change != null ? `${change >= 0 ? '+' : ''}${change} ${unit}` : '--'}
              </Text>
              <View style={styles.statBarTrack}>
                <View style={[styles.statBarFill, { width: '50%' }]} />
              </View>
            </View>
          </View>

          <PrimaryButton
            title="Add Measurement"
            onPress={() => router.push('/growth/add')}
            style={styles.addButton}
          />
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  pillRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  pill: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  pillActive: {
    backgroundColor: theme.colors.mint,
    borderColor: theme.colors.mint,
  },
  pillText: {
    fontSize: theme.typography.bodySmall.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.textSecondary,
  },
  pillTextActive: {
    color: theme.colors.teal,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  averageValue: {
    fontSize: 40,
    fontWeight: '700' as const,
    color: theme.colors.text,
    textAlign: 'center',
  },
  averageLabel: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    textAlign: 'center',
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
    alignItems: 'center',
  },
  chartTitle: {
    alignSelf: 'flex-start',
    fontSize: theme.typography.label.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  chartArea: {
    width: CHART_WIDTH,
    height: CHART_HEIGHT,
    position: 'relative',
  },
  chartLine: {
    position: 'absolute',
    height: 2,
    backgroundColor: theme.colors.teal,
    opacity: 0.35,
    transformOrigin: '0 50%',
  },
  chartDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.teal,
  },
  emptyChart: {
    height: CHART_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyChartText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
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
    backgroundColor: theme.colors.background,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    backgroundColor: theme.colors.teal,
    borderRadius: 2,
  },
  addButton: {
    marginBottom: theme.spacing.xl,
  },
});
