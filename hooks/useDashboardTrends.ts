import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/auth/supabase';
import { useBaby } from './useBaby';

export interface TrendMetrics {
  today: number;
  yesterday: number;
  thisWeek: number;
  lastWeek: number;
  trend: 'up' | 'down' | 'same';
  percentChange: number;
}

export interface DashboardTrends {
  feeds: TrendMetrics;
  sleepMinutes: TrendMetrics;
  nappies: TrendMetrics;
  isLoading: boolean;
}

export function useDashboardTrends(): DashboardTrends {
  const { baby } = useBaby();

  const { data: feeds = { today: 0, yesterday: 0, thisWeek: 0, lastWeek: 0, trend: 'same' as const, percentChange: 0 }, isLoading: feedsLoading } = useQuery({
    queryKey: ['dashboard-trends-feeds', baby?.id],
    queryFn: async () => {
      if (!baby) return { today: 0, yesterday: 0, thisWeek: 0, lastWeek: 0, trend: 'same' as const, percentChange: 0 };

      const now = new Date();
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);

      const twoWeeksAgo = new Date(today);
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      const [todayFeeds, yesterdayFeeds, thisWeekFeeds, lastWeekFeeds] = await Promise.all([
        supabase
          .from('feeding_logs')
          .select('id')
          .eq('baby_id', baby.id)
          .gte('start_time', today.toISOString())
          .lt('start_time', tomorrow.toISOString()),
        supabase
          .from('feeding_logs')
          .select('id')
          .eq('baby_id', baby.id)
          .gte('start_time', yesterday.toISOString())
          .lt('start_time', today.toISOString()),
        supabase
          .from('feeding_logs')
          .select('id')
          .eq('baby_id', baby.id)
          .gte('start_time', weekAgo.toISOString())
          .lt('start_time', tomorrow.toISOString()),
        supabase
          .from('feeding_logs')
          .select('id')
          .eq('baby_id', baby.id)
          .gte('start_time', twoWeeksAgo.toISOString())
          .lt('start_time', weekAgo.toISOString()),
      ]);

      const todayCount = todayFeeds.data?.length || 0;
      const yesterdayCount = yesterdayFeeds.data?.length || 0;
      const thisWeekCount = thisWeekFeeds.data?.length || 0;
      const lastWeekCount = lastWeekFeeds.data?.length || 0;

      const percentChange = lastWeekCount > 0 ? Math.round(((thisWeekCount - lastWeekCount) / lastWeekCount) * 100) : 0;
      const trend = thisWeekCount > lastWeekCount ? 'up' : thisWeekCount < lastWeekCount ? 'down' : 'same';

      return {
        today: todayCount,
        yesterday: yesterdayCount,
        thisWeek: thisWeekCount,
        lastWeek: lastWeekCount,
        trend,
        percentChange,
      };
    },
    enabled: !!baby,
  });

  const { data: sleepMinutes = { today: 0, yesterday: 0, thisWeek: 0, lastWeek: 0, trend: 'same' as const, percentChange: 0 }, isLoading: sleepLoading } = useQuery({
    queryKey: ['dashboard-trends-sleep', baby?.id],
    queryFn: async () => {
      if (!baby) return { today: 0, yesterday: 0, thisWeek: 0, lastWeek: 0, trend: 'same' as const, percentChange: 0 };

      const now = new Date();
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);

      const twoWeeksAgo = new Date(today);
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      const calculateSleepMinutes = (logs: any[]) => {
        return logs.reduce((total, log) => {
          const startTime = new Date(log.start_time).getTime();
          const endTime = log.end_time ? new Date(log.end_time).getTime() : startTime;
          return total + (endTime - startTime) / 60000;
        }, 0);
      };

      const [todayLogs, yesterdayLogs, thisWeekLogs, lastWeekLogs] = await Promise.all([
        supabase
          .from('sleep_logs')
          .select('*')
          .eq('baby_id', baby.id)
          .gte('start_time', today.toISOString())
          .lt('start_time', tomorrow.toISOString()),
        supabase
          .from('sleep_logs')
          .select('*')
          .eq('baby_id', baby.id)
          .gte('start_time', yesterday.toISOString())
          .lt('start_time', today.toISOString()),
        supabase
          .from('sleep_logs')
          .select('*')
          .eq('baby_id', baby.id)
          .gte('start_time', weekAgo.toISOString())
          .lt('start_time', tomorrow.toISOString()),
        supabase
          .from('sleep_logs')
          .select('*')
          .eq('baby_id', baby.id)
          .gte('start_time', twoWeeksAgo.toISOString())
          .lt('start_time', weekAgo.toISOString()),
      ]);

      const todayMinutes = Math.round(calculateSleepMinutes(todayLogs.data || []));
      const yesterdayMinutes = Math.round(calculateSleepMinutes(yesterdayLogs.data || []));
      const thisWeekMinutes = Math.round(calculateSleepMinutes(thisWeekLogs.data || []));
      const lastWeekMinutes = Math.round(calculateSleepMinutes(lastWeekLogs.data || []));

      const percentChange = lastWeekMinutes > 0 ? Math.round(((thisWeekMinutes - lastWeekMinutes) / lastWeekMinutes) * 100) : 0;
      const trend = thisWeekMinutes > lastWeekMinutes ? 'up' : thisWeekMinutes < lastWeekMinutes ? 'down' : 'same';

      return {
        today: todayMinutes,
        yesterday: yesterdayMinutes,
        thisWeek: thisWeekMinutes,
        lastWeek: lastWeekMinutes,
        trend,
        percentChange,
      };
    },
    enabled: !!baby,
  });

  const { data: nappies = { today: 0, yesterday: 0, thisWeek: 0, lastWeek: 0, trend: 'same' as const, percentChange: 0 }, isLoading: nappiesLoading } = useQuery({
    queryKey: ['dashboard-trends-nappies', baby?.id],
    queryFn: async () => {
      if (!baby) return { today: 0, yesterday: 0, thisWeek: 0, lastWeek: 0, trend: 'same' as const, percentChange: 0 };

      const now = new Date();
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);

      const twoWeeksAgo = new Date(today);
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      const [todayNappies, yesterdayNappies, thisWeekNappies, lastWeekNappies] = await Promise.all([
        supabase
          .from('nappy_logs')
          .select('id')
          .eq('baby_id', baby.id)
          .gte('logged_at', today.toISOString())
          .lt('logged_at', tomorrow.toISOString()),
        supabase
          .from('nappy_logs')
          .select('id')
          .eq('baby_id', baby.id)
          .gte('logged_at', yesterday.toISOString())
          .lt('logged_at', today.toISOString()),
        supabase
          .from('nappy_logs')
          .select('id')
          .eq('baby_id', baby.id)
          .gte('logged_at', weekAgo.toISOString())
          .lt('logged_at', tomorrow.toISOString()),
        supabase
          .from('nappy_logs')
          .select('id')
          .eq('baby_id', baby.id)
          .gte('logged_at', twoWeeksAgo.toISOString())
          .lt('logged_at', weekAgo.toISOString()),
      ]);

      const todayCount = todayNappies.data?.length || 0;
      const yesterdayCount = yesterdayNappies.data?.length || 0;
      const thisWeekCount = thisWeekNappies.data?.length || 0;
      const lastWeekCount = lastWeekNappies.data?.length || 0;

      const percentChange = lastWeekCount > 0 ? Math.round(((thisWeekCount - lastWeekCount) / lastWeekCount) * 100) : 0;
      const trend = thisWeekCount > lastWeekCount ? 'up' : thisWeekCount < lastWeekCount ? 'down' : 'same';

      return {
        today: todayCount,
        yesterday: yesterdayCount,
        thisWeek: thisWeekCount,
        lastWeek: lastWeekCount,
        trend,
        percentChange,
      };
    },
    enabled: !!baby,
  });

  return {
    feeds,
    sleepMinutes,
    nappies,
    isLoading: feedsLoading || sleepLoading || nappiesLoading,
  };
}
