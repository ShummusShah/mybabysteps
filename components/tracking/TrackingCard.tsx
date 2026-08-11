import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme, trackingCardStyles } from '@/constants/theme';

interface TrackingCardProps {
  type: 'feed' | 'sleep' | 'nappy' | 'pump' | 'tummy' | 'medicine' | 'temperature' | 'growth' | 'milestone';
  title: string;
  primaryMetric?: string;
  secondaryMetrics?: Array<{ label: string; value: string }>;
  icon: string;
  onPress: () => void;
  isActive?: boolean;
  style?: ViewStyle;
}

export function TrackingCard({
  type,
  title,
  primaryMetric,
  secondaryMetrics,
  icon,
  onPress,
  isActive = false,
  style,
}: TrackingCardProps) {
  const styles_type = trackingCardStyles[type];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.card,
        { backgroundColor: styles_type.backgroundColor },
        isActive && styles.active,
        style,
      ]}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.iconContainer,
            { borderColor: styles_type.textColor },
          ]}
        >
          <MaterialCommunityIcons name={icon as any} size={24} color={styles_type.textColor} />
        </View>
        <Text style={[styles.title, { color: styles_type.textColor }]}>{title}</Text>
      </View>

      {primaryMetric && (
        <Text style={[styles.primaryMetric, { color: styles_type.textColor }]}>
          {primaryMetric}
        </Text>
      )}

      {secondaryMetrics && (
        <View style={styles.metricsContainer}>
          {secondaryMetrics.map((metric, index) => (
            <View key={index} style={styles.metricRow}>
              <Text style={[styles.metricLabel, { color: styles_type.textColor }]}>
                {metric.label}
              </Text>
              <Text style={[styles.metricValue, { color: styles_type.textColor }]}>
                {metric.value}
              </Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.card,
    ...theme.shadows.medium,
    marginBottom: theme.spacing.md,
  },
  active: {
    borderWidth: 2,
    borderColor: theme.colors.teal,
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
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.cardHeadline.fontSize,
    fontWeight: theme.typography.cardHeadline.fontWeight,
  },
  primaryMetric: {
    fontSize: theme.typography.largeStats.fontSize,
    fontWeight: theme.typography.largeStats.fontWeight,
    marginBottom: theme.spacing.md,
  },
  metricsContainer: {
    gap: theme.spacing.sm,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '500' as const,
  },
  metricValue: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600' as const,
  },
});
