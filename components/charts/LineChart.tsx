import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';
import { DailyMetric } from '@/hooks/useAnalytics';

interface LineChartProps {
  data: DailyMetric[];
  height?: number;
  color?: string;
  title?: string;
}

export function LineChart({ data, height = 200, color = theme.colors.teal, title }: LineChartProps) {
  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.emptyText}>No data available</Text>
      </View>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const chartHeight = height - 100;

  return (
    <View style={[styles.container, { height }]}>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={[styles.chartContainer, { height: chartHeight }]}>
        {data.map((d, i) => {
          const barHeight = (d.value / maxValue) * chartHeight;
          return (
            <View key={i} style={styles.barWrapper}>
              <View style={styles.valueLabel}>
                <Text style={styles.valueText}>{d.value}</Text>
              </View>
              <View
                style={[
                  styles.bar,
                  {
                    height: barHeight,
                    backgroundColor: color,
                  },
                ]}
              />
              <Text style={styles.label}>{d.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.md,
    ...theme.shadows.small,
  },
  title: {
    fontSize: theme.typography.cardHeadline.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingBottom: theme.spacing.md,
    gap: 8,
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  valueLabel: {
    minHeight: 20,
    justifyContent: 'center',
  },
  valueText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 4,
  },
  label: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.lg,
  },
});
