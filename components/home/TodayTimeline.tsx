import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { theme } from '@/constants/theme';
import type { TimelineItem } from '@/hooks/useTodayTimeline';

interface TodayTimelineProps {
  items: TimelineItem[];
  isLoading?: boolean;
  onItemPress: (item: TimelineItem) => void;
}

export function TodayTimeline({ items, isLoading, onItemPress }: TodayTimelineProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'feed':
        return '#21B6AD';
      case 'sleep':
        return '#8A73D6';
      case 'nappy':
        return '#FF8B5C';
      case 'tummy':
        return theme.colors.yellowAccent;
      case 'medicine':
        return '#EC4899';
      case 'temperature':
        return '#EF4444';
      case 'growth':
        return '#10B981';
      case 'milestone':
        return '#F5A623';
      case 'photo':
        return '#A855F7';
      default:
        return theme.colors.teal;
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

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
            <TouchableOpacity
              key={item.id}
              style={styles.timelineRow}
              onPress={() => onItemPress(item)}
              activeOpacity={0.6}
            >
              <Text style={styles.time}>{formatTime(item.timestamp)}</Text>

              <View style={styles.indicatorOuter}>
                <View
                  style={[styles.indicatorDot, { backgroundColor: getTypeColor(item.type) }]}
                />
              </View>

              <View style={styles.content}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subtitle}>{item.subtitle}</Text>
              </View>
            </TouchableOpacity>
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
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
  },
  time: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500' as const,
    minWidth: 45,
    marginTop: 2,
  },
  indicatorOuter: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E9EDF2',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -6,
    flexShrink: 0,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {
    flex: 1,
    paddingTop: 2,
  },
  title: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '400' as const,
    marginTop: 2,
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
