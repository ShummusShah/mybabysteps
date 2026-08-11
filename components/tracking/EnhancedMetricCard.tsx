import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { TrendMetrics } from '@/hooks/useDashboardTrends';

interface EnhancedMetricCardProps {
  title: string;
  primaryValue: string;
  primaryLabel: string;
  trends: TrendMetrics;
  icon: string;
  color: string;
  onPress?: () => void;
}

export function EnhancedMetricCard({
  title,
  primaryValue,
  primaryLabel,
  trends,
  icon,
  color,
  onPress,
}: EnhancedMetricCardProps) {
  const trendIcon = trends.trend === 'up' ? 'trending-up' : trends.trend === 'down' ? 'trending-down' : 'minus';
  const trendColor = trends.trend === 'up' ? theme.colors.success : trends.trend === 'down' ? '#FF6B6B' : theme.colors.textSecondary;
  const trendLabel = trends.trend === 'up' ? '+' : trends.trend === 'down' ? '' : '=';

  return (
    <TouchableOpacity style={[styles.card, { borderLeftColor: color }]} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <MaterialCommunityIcons name={icon} size={24} color={color} />
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.primaryMetric}>
          <Text style={styles.primaryValue}>{primaryValue}</Text>
          <Text style={styles.primaryLabel}>{primaryLabel}</Text>
        </View>

        <View style={styles.trendContainer}>
          <View style={styles.trendBadge}>
            <MaterialCommunityIcons name={trendIcon} size={16} color={trendColor} />
            <Text style={[styles.trendText, { color: trendColor }]}>
              {trendLabel}{Math.abs(trends.percentChange)}%
            </Text>
          </View>
          <Text style={styles.comparisonText}>vs last week</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Today</Text>
          <Text style={styles.statValue}>{trends.today}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Yest.</Text>
          <Text style={styles.statValue}>{trends.yesterday}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>This wk</Text>
          <Text style={styles.statValue}>{trends.thisWeek}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Last wk</Text>
          <Text style={styles.statValue}>{trends.lastWeek}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderLeftWidth: 4,
    ...theme.shadows.medium,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.cardHeadline.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  primaryMetric: {
    flex: 1,
  },
  primaryValue: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: theme.colors.text,
  },
  primaryLabel: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  trendContainer: {
    alignItems: 'flex-end',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 6,
  },
  trendText: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600' as const,
  },
  comparisonText: {
    fontSize: theme.typography.metadata.fontSize,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: theme.typography.metadata.fontSize,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: theme.typography.cardHeadline.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
});
