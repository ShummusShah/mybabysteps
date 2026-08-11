import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBaby } from '@/hooks/useBaby';
import { useDashboard } from '@/hooks/useDashboard';
import { useAuth } from '@/hooks/useAuth';
import { TrackingCard } from '@/components/tracking/TrackingCard';
import { theme } from '@/constants/theme';
import {
  formatElapsedTime,
  formatBabyAge,
  getGreeting,
  formatDuration,
  isToday,
} from '@/lib/utils/dateUtils';
import { formatMilk } from '@/lib/utils/unitConversion';
import { useStore } from '@/stores/useStore';
import { supabase } from '@/lib/auth/supabase';

export default function HomeScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const { baby } = useBaby();
  const {
    latestFeed,
    todayFeeds,
    currentSleep,
    latestSleep,
    todaySleep,
    latestNappy,
    todayNappies,
    isLoading,
  } = useDashboard();
  const { userPreferences } = useStore();
  const [timeline, setTimeline] = useState<any[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);

  useEffect(() => {
    loadTimeline();
  }, [baby?.id]);

  async function loadTimeline() {
    if (!baby) return;

    setTimelineLoading(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const [feeds, sleeps, nappies] = await Promise.all([
        supabase
          .from('feeding_logs')
          .select('*')
          .eq('baby_id', baby.id)
          .gte('start_time', today.toISOString())
          .lt('start_time', tomorrow.toISOString())
          .order('start_time', { ascending: false }),
        supabase
          .from('sleep_logs')
          .select('*')
          .eq('baby_id', baby.id)
          .gte('start_time', today.toISOString())
          .lt('start_time', tomorrow.toISOString())
          .order('start_time', { ascending: false }),
        supabase
          .from('nappy_logs')
          .select('*')
          .eq('baby_id', baby.id)
          .gte('logged_at', today.toISOString())
          .lt('logged_at', tomorrow.toISOString())
          .order('logged_at', { ascending: false }),
      ]);

      const items: any[] = [];

      (feeds.data || []).forEach((feed) => {
        items.push({
          id: feed.id,
          type: 'feed',
          timestamp: feed.start_time,
          title: feed.feed_type === 'breast' ? 'Breastfeed' : 'Bottle',
          subtitle: feed.feed_type === 'breast' ? `${feed.left_duration_seconds}s + ${feed.right_duration_seconds}s` : `${formatMilk(feed.amount_ml || 0, userPreferences.milkUnit)}`,
          icon: 'bottle-soda',
          rawData: feed,
        });
      });

      (sleeps.data || []).forEach((sleep) => {
        const endTime = sleep.end_time ? new Date(sleep.end_time).getTime() : Date.now();
        const duration = Math.floor((endTime - new Date(sleep.start_time).getTime()) / 1000);
        items.push({
          id: sleep.id,
          type: 'sleep',
          timestamp: sleep.start_time,
          title: 'Sleep',
          subtitle: `${formatDuration(duration)}`,
          icon: 'sleep',
          rawData: sleep,
        });
      });

      (nappies.data || []).forEach((nappy) => {
        const typeLabel = nappy.type === 'both' ? 'Wet + dirty' : nappy.type.charAt(0).toUpperCase() + nappy.type.slice(1);
        items.push({
          id: nappy.id,
          type: 'nappy',
          timestamp: nappy.logged_at,
          title: 'Nappy',
          subtitle: typeLabel,
          icon: 'diapers',
          rawData: nappy,
        });
      });

      items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setTimeline(items.slice(0, 5));
    } finally {
      setTimelineLoading(false);
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.teal} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>
                {getGreeting()}, {profile?.display_name?.split(' ')[0] || 'Parent'} 👋
              </Text>
              {baby && (
                <Text style={styles.babyAge}>
                  {baby.name} is {formatBabyAge(baby.date_of_birth)}
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={() => router.push('/reminders')}>
              <MaterialCommunityIcons name="bell" size={24} color={theme.colors.teal} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tracking Cards */}
        <View style={styles.cardsSection}>
          <TrackingCard
            type="feed"
            title="Feeding"
            primaryMetric={
              latestFeed
                ? `${formatElapsedTime(Date.now() - new Date(latestFeed.start_time).getTime())} ago`
                : 'No feeds yet'
            }
            secondaryMetrics={[
              {
                label: 'Today',
                value: `${todayFeeds.length} feeds`,
              },
            ]}
            icon="bottle-soda"
            onPress={() => latestFeed ? router.push(`/feed/${latestFeed.id}`) : router.push('/feed/add')}
          />

          <TrackingCard
            type="sleep"
            title="Sleep"
            primaryMetric={
              currentSleep
                ? `Sleeping for ${formatDuration(Math.floor((Date.now() - new Date(currentSleep.start_time).getTime()) / 1000))}`
                : latestSleep
                  ? `${formatElapsedTime(Date.now() - new Date(latestSleep.end_time || new Date()).getTime())} ago`
                  : 'No sleeps yet'
            }
            secondaryMetrics={[
              {
                label: 'Today',
                value: formatDuration(todaySleep),
              },
            ]}
            icon="sleep"
            onPress={() => currentSleep ? router.push(`/sleep/${currentSleep.id}`) : latestSleep ? router.push(`/sleep/${latestSleep.id}`) : router.push('/sleep/add')}
            isActive={!!currentSleep}
          />

          <TrackingCard
            type="nappy"
            title="Nappies"
            primaryMetric={
              latestNappy
                ? `${formatElapsedTime(Date.now() - new Date(latestNappy.logged_at).getTime())} ago · ${latestNappy.type === 'both' ? 'Wet + dirty' : latestNappy.type.charAt(0).toUpperCase() + latestNappy.type.slice(1)}`
                : 'No nappies yet'
            }
            secondaryMetrics={[
              {
                label: 'Today',
                value: `${todayNappies}`,
              },
            ]}
            icon="water"
            onPress={() => latestNappy ? router.push(`/nappy/${latestNappy.id}`) : router.push('/nappy/add')}
          />
        </View>

        {/* Timeline */}
        <View style={styles.timelineSection}>
          <View style={styles.timelineHeader}>
            <Text style={styles.timelineTitle}>Today's Timeline</Text>
            <TouchableOpacity onPress={() => router.push('/history')}>
              <Text style={styles.viewAllLink}>View all</Text>
            </TouchableOpacity>
          </View>

          {timelineLoading ? (
            <ActivityIndicator size="small" color={theme.colors.teal} />
          ) : timeline.length === 0 ? (
            <View style={styles.emptyTimeline}>
              <Text style={styles.emptyText}>No logs yet</Text>
              <Text style={styles.emptySubText}>Start tracking your baby's day</Text>
            </View>
          ) : (
            <View style={styles.timelineList}>
              {timeline.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.timelineItem}
                  onPress={() => {
                    if (item.type === 'feed') router.push(`/feed/${item.rawData.id}`);
                    else if (item.type === 'sleep') router.push(`/sleep/${item.rawData.id}`);
                    else if (item.type === 'nappy') router.push(`/nappy/${item.rawData.id}`);
                  }}
                >
                  <Text style={styles.timelineTime}>
                    {new Date(item.timestamp).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    })}
                  </Text>
                  <View style={styles.timelineItemContent}>
                    <Text style={styles.timelineItemTitle}>{item.title}</Text>
                    <Text style={styles.timelineItemSubtitle}>{item.subtitle}</Text>
                  </View>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/quick-log')}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="plus" size={32} color={theme.colors.white} />
      </TouchableOpacity>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: theme.typography.screenTitle.fontSize,
    fontWeight: theme.typography.screenTitle.fontWeight,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  babyAge: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
  },
  cardsSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  timelineSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: 100,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  timelineTitle: {
    fontSize: theme.typography.sectionTitle.fontSize,
    fontWeight: theme.typography.sectionTitle.fontWeight,
    color: theme.colors.text,
  },
  viewAllLink: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.teal,
    fontWeight: '600' as const,
  },
  timelineList: {
    gap: theme.spacing.md,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.input,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  timelineTime: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.text,
    minWidth: 50,
  },
  timelineItemContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  timelineItemTitle: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  timelineItemSubtitle: {
    fontSize: theme.typography.metadata.fontSize,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  emptyTimeline: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyText: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptySubText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
  },
  fab: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.teal,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.large,
  },
});
