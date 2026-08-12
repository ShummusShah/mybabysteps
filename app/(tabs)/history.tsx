import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';
import { getDayLabel } from '@/lib/utils/dateUtils';
import { useLogEntries, LogEntry, LogEntryType } from '@/hooks/useLogEntries';
import { LogEntryRow } from '@/components/shared/LogEntryRow';

type FilterOption = 'all' | 'feed' | 'sleep' | 'nappy';

const FILTERS: { value: FilterOption; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'feed', label: 'Feed' },
  { value: 'sleep', label: 'Sleep' },
  { value: 'nappy', label: 'Nappy' },
];

function groupByDay(logs: LogEntry[]): { label: string; items: LogEntry[] }[] {
  const groups: { label: string; items: LogEntry[] }[] = [];
  const indexByLabel: Record<string, number> = {};

  logs.forEach((item) => {
    const label = getDayLabel(item.timestamp).toUpperCase();
    if (indexByLabel[label] === undefined) {
      indexByLabel[label] = groups.length;
      groups.push({ label, items: [] });
    }
    groups[indexByLabel[label]].items.push(item);
  });

  return groups;
}

export default function HistoryScreen() {
  const router = useRouter();
  const { logs, isLoading } = useLogEntries(7);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterOption>('all');

  const filteredLogs = useMemo(() => {
    const query = search.trim().toLowerCase();
    return logs.filter((item) => {
      if (filter !== 'all' && item.type !== (filter as LogEntryType)) return false;
      if (!query) return true;
      return item.title.toLowerCase().includes(query) || item.subtitle.toLowerCase().includes(query);
    });
  }, [logs, search, filter]);

  const groups = useMemo(() => groupByDay(filteredLogs), [filteredLogs]);

  function handleNavigate(item: LogEntry) {
    if (item.type === 'feed') router.push(`/feed/${item.id}`);
    else if (item.type === 'sleep') router.push(`/sleep/${item.id}`);
    else if (item.type === 'nappy') router.push(`/nappy/${item.id}`);
    else if (item.type === 'tummy') router.push(`/tummy/${item.id}`);
    else if (item.type === 'medicine') router.push(`/medicine/${item.id}`);
    else if (item.type === 'temperature') router.push(`/temperature/${item.id}`);
    else if (item.type === 'milestone') router.push(`/milestones/${item.id}`);
    else if (item.type === 'growth') router.push(`/growth/${item.id}`);
    else if (item.type === 'photo') router.push(`/photos/${item.id}`);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>History</Text>

        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search logs..."
          placeholderTextColor={theme.colors.textSecondary}
        />

        <View style={styles.filterRow}>
          {FILTERS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.filterPill, filter === opt.value && styles.filterPillActive]}
              onPress={() => setFilter(opt.value)}
            >
              <Text style={[styles.filterPillText, filter === opt.value && styles.filterPillTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.colors.teal} />
          </View>
        ) : groups.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="history"
              size={64}
              color={theme.colors.textSecondary}
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyTitle}>No logs found</Text>
            <Text style={styles.emptySubtitle}>
              {search || filter !== 'all' ? 'Try a different search or filter' : "Start tracking your baby's day"}
            </Text>
          </View>
        ) : (
          <View style={styles.content}>
            {groups.map((group) => (
              <View key={group.label}>
                <Text style={styles.dateHeader}>{group.label}</Text>
                <View style={styles.logsList}>
                  {group.items.map((item) => (
                    <LogEntryRow key={item.id} item={item} onPress={() => handleNavigate(item)} />
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.spacer} />
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
  searchInput: {
    backgroundColor: theme.colors.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  filterRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  filterPill: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: 20,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterPillActive: {
    backgroundColor: theme.colors.mint,
    borderColor: theme.colors.mint,
  },
  filterPillText: {
    fontSize: theme.typography.bodySmall.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.textSecondary,
  },
  filterPillTextActive: {
    color: theme.colors.teal,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
    minHeight: 300,
    justifyContent: 'center',
  },
  emptyIcon: {
    marginBottom: theme.spacing.lg,
    opacity: 0.3,
  },
  emptyTitle: {
    fontSize: theme.typography.sectionTitle.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
  },
  content: {
    paddingBottom: theme.spacing.lg,
  },
  dateHeader: {
    fontSize: theme.typography.label.fontSize,
    fontWeight: '700' as const,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  logsList: {
    marginBottom: theme.spacing.lg,
  },
  spacer: {
    height: theme.spacing.xxl,
  },
});
