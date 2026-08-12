import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { theme } from '@/constants/theme';
import { LogEntryRow } from '@/components/shared/LogEntryRow';
import type { TimelineItem } from '@/hooks/useTodayTimeline';

interface TodayTimelineProps {
  items: TimelineItem[];
  isLoading?: boolean;
  onItemPress: (item: TimelineItem) => void;
}

export function TodayTimeline({ items, isLoading, onItemPress }: TodayTimelineProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Today&apos;s timeline</Text>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.teal} />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No logs yet</Text>
          <Text style={styles.emptySubText}>Start tracking your baby&apos;s day</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {items.map((item) => (
            <LogEntryRow key={item.id} item={item} onPress={() => onItemPress(item)} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 100,
  },
  heading: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: theme.colors.text,
    marginBottom: 16,
  },
  list: {
    gap: 12,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: theme.colors.text,
    marginBottom: 4,
  },
  emptySubText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
});
