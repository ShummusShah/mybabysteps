import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBaby } from '@/hooks/useBaby';
import { useDashboard } from '@/hooks/useDashboard';
import { useAuth } from '@/hooks/useAuth';
import { useTodayTimeline } from '@/hooks/useTodayTimeline';
import { HomeHeader } from '@/components/home/HomeHeader';
import { TrackingStatusCard } from '@/components/home/TrackingStatusCard';
import { QuickLogRow } from '@/components/home/QuickLogRow';
import { TodayTimeline } from '@/components/home/TodayTimeline';
import { theme } from '@/constants/theme';
import { formatElapsedTime, formatBabyAge, formatDuration } from '@/lib/utils/dateUtils';

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
  const { timeline, isLoading: timelineLoading } = useTodayTimeline();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.teal} />
        </View>
      </SafeAreaView>
    );
  }

  const feedSubtitle = latestFeed
    ? `Last feed ${formatElapsedTime(now - new Date(latestFeed.start_time).getTime())}`
    : 'No feeds yet';

  const sleepSubtitle = currentSleep
    ? `Sleeping for ${formatDuration(Math.floor((now - new Date(currentSleep.start_time).getTime()) / 1000))}`
    : latestSleep
      ? `Last sleep ${formatElapsedTime(now - new Date(latestSleep.end_time || new Date()).getTime())}`
      : 'No sleeps yet';

  const nappySubtitle = latestNappy
    ? `Last ${formatElapsedTime(now - new Date(latestNappy.logged_at).getTime())} · ${latestNappy.type === 'both' ? 'Wet + dirty' : latestNappy.type.charAt(0).toUpperCase() + latestNappy.type.slice(1)}`
    : 'No nappies yet';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        <HomeHeader
          parentName={profile?.display_name?.split(' ')[0] || 'Parent'}
          babyName={baby?.name || 'Baby'}
          babyAge={baby ? formatBabyAge(baby.date_of_birth) : ''}
        />

        <View style={styles.cardsSection}>
          <TrackingStatusCard
            type="feeding"
            title="Feeding"
            subtitle={feedSubtitle}
            todayText={`Today · ${todayFeeds.length} feeds`}
            icon="bottle-soda"
            backgroundColor="#DDF7F3"
            accentColor="#21B6AD"
            onPress={() => latestFeed ? router.push(`/feed/${latestFeed.id}`) : router.push('/feed/add')}
          />

          <TrackingStatusCard
            type="sleep"
            title="Sleep"
            subtitle={sleepSubtitle}
            todayText={`Today · ${formatDuration(todaySleep)}`}
            icon="sleep"
            backgroundColor="#EEE8FF"
            accentColor="#8A73D6"
            onPress={() => currentSleep ? router.push(`/sleep/${currentSleep.id}`) : latestSleep ? router.push(`/sleep/${latestSleep.id}`) : router.push('/sleep/add')}
          />

          <TrackingStatusCard
            type="nappy"
            title="Nappies"
            subtitle={nappySubtitle}
            todayText={`Today · ${todayNappies}`}
            icon="water"
            backgroundColor="#FFF0E8"
            accentColor="#FF8B5C"
            onPress={() => latestNappy ? router.push(`/nappy/${latestNappy.id}`) : router.push('/nappy/add')}
          />
        </View>

        <QuickLogRow
          onFeed={() => router.push('/feed/add')}
          onSleep={() => router.push('/sleep/add')}
          onNappy={() => router.push('/nappy/add')}
          onMore={() => router.push('/quick-log')}
        />

        <TodayTimeline
          items={timeline}
          isLoading={timelineLoading}
          onItemPress={(item) => {
            if (item.type === 'feed') router.push(`/feed/${item.rawData.id}`);
            else if (item.type === 'sleep') router.push(`/sleep/${item.rawData.id}`);
            else if (item.type === 'nappy') router.push(`/nappy/${item.rawData.id}`);
            else if (item.type === 'tummy') router.push(`/tummy/${item.rawData.id}`);
            else if (item.type === 'medicine') router.push(`/medicine/${item.rawData.id}`);
            else if (item.type === 'temperature') router.push(`/temperature/${item.rawData.id}`);
            else if (item.type === 'milestone') router.push(`/milestones/${item.rawData.id}`);
            // growth and photo have no detail screen yet
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFB',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
});
