import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAnalytics } from '@/hooks/useAnalytics';
import { LineChart } from '@/components/charts/LineChart';
import { BarChart } from '@/components/charts/BarChart';
import { theme } from '@/constants/theme';

export default function InsightsScreen() {
  const [timeRange, setTimeRange] = useState<7 | 14 | 30>(7);
  const { feedingTrend, sleepTrend, nappyTrend, feedingAverage, sleepAverage, nappyAverage, isLoading } = useAnalytics(timeRange);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Insights & Analytics</Text>
          <Text style={styles.subtitle}>Track your baby's patterns</Text>
        </View>

        {/* Time Range Selector */}
        <View style={styles.timeRangeContainer}>
          {([7, 14, 30] as const).map((range) => (
            <TouchableOpacity
              key={range}
              style={[styles.timeRangeButton, timeRange === range && styles.timeRangeButtonActive]}
              onPress={() => setTimeRange(range)}
            >
              <Text
                style={[
                  styles.timeRangeText,
                  timeRange === range && styles.timeRangeTextActive,
                ]}
              >
                {range}d
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
            {/* Feeding Trend */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.iconBadge, { backgroundColor: theme.colors.mint + '20' }]}>
                  <MaterialCommunityIcons name="bottle-soda" size={20} color={theme.colors.mint} />
                </View>
                <View style={styles.sectionInfo}>
                  <Text style={styles.sectionTitle}>Feeding</Text>
                  <Text style={styles.sectionAverage}>
                    Average: {feedingAverage} feeds/day
                  </Text>
                </View>
              </View>
              <BarChart
                data={feedingTrend}
                color={theme.colors.mint}
                height={220}
              />
            </View>

            {/* Sleep Trend */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.iconBadge, { backgroundColor: theme.colors.lavender + '20' }]}>
                  <MaterialCommunityIcons name="sleep" size={20} color={theme.colors.lavender} />
                </View>
                <View style={styles.sectionInfo}>
                  <Text style={styles.sectionTitle}>Sleep Duration</Text>
                  <Text style={styles.sectionAverage}>
                    Average: {sleepAverage} hours/day
                  </Text>
                </View>
              </View>
              <LineChart
                data={sleepTrend}
                color={theme.colors.lavender}
                height={220}
              />
            </View>

            {/* Nappy Trend */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.iconBadge, { backgroundColor: theme.colors.peach + '20' }]}>
                  <MaterialCommunityIcons name="water" size={20} color={theme.colors.peach} />
                </View>
                <View style={styles.sectionInfo}>
                  <Text style={styles.sectionTitle}>Nappy Changes</Text>
                  <Text style={styles.sectionAverage}>
                    Average: {nappyAverage} per day
                  </Text>
                </View>
              </View>
              <BarChart
                data={nappyTrend}
                color={theme.colors.peach}
                height={220}
              />
            </View>

            {/* Summary Stats */}
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Summary</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Avg Feeds</Text>
                  <Text style={styles.statValue}>{feedingAverage}</Text>
                  <Text style={styles.statUnit}>per day</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Avg Sleep</Text>
                  <Text style={styles.statValue}>{sleepAverage}h</Text>
                  <Text style={styles.statUnit}>per day</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Avg Nappies</Text>
                  <Text style={styles.statValue}>{nappyAverage}</Text>
                  <Text style={styles.statUnit}>per day</Text>
                </View>
              </View>
            </View>
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
    paddingHorizontal: theme.spacing.md,
  },
  header: {
    paddingVertical: theme.spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.button,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  timeRangeButtonActive: {
    backgroundColor: theme.colors.teal,
    borderColor: theme.colors.teal,
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: theme.colors.textSecondary,
  },
  timeRangeTextActive: {
    color: theme.colors.white,
  },
  loadingContainer: {
    marginTop: theme.spacing.xl,
    alignItems: 'center',
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  sectionInfo: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: theme.typography.cardHeadline.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  sectionAverage: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  summaryContainer: {
    marginBottom: theme.spacing.xl,
  },
  summaryTitle: {
    fontSize: theme.typography.cardHeadline.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.md,
    alignItems: 'center',
    ...theme.shadows.small,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: theme.colors.text,
  },
  statUnit: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
});
