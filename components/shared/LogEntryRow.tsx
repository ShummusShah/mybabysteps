import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '@/constants/theme';
import { getLogTypeColor } from '@/lib/utils/logTypeColors';
import type { LogEntry } from '@/hooks/useLogEntries';

interface LogEntryRowProps {
  item: LogEntry;
  onPress: () => void;
}

function formatRowTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function LogEntryRow({ item, onPress }: LogEntryRowProps) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.6}>
      <Text style={styles.time}>{formatRowTime(item.timestamp)}</Text>

      <View style={styles.indicatorOuter}>
        <View style={[styles.indicatorDot, { backgroundColor: getLogTypeColor(item.type) }]} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        {!!item.subtitle && <Text style={styles.subtitle}>{item.subtitle}</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
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
});
