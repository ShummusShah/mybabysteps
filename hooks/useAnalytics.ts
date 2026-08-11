import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/auth/supabase';
import { useBaby } from './useBaby';

export interface DailyMetric {
  date: string;
  value: number;
  label: string;
}

export interface Analytics {
  feedingTrend: DailyMetric[];
  sleepTrend: DailyMetric[];
  nappyTrend: DailyMetric[];
  feedingAverage: number;
  sleepAverage: number;
  nappyAverage: number;
  isLoading: boolean;
}

export function useAnalytics(days: number = 7): Analytics {
  const { baby } = useBaby();

  const { data: feedingData = { trend: [], average: 0 }, isLoading: feedingLoading } = useQuery({
    queryKey: ['analytics-feeding', baby?.id, days],
    queryFn: async () => {
      if (!baby) return { trend: [], average: 0 };

      const endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);

      const { data: logs } = await supabase
        .from('feeding_logs')
        .select('start_time')
        .eq('baby_id', baby.id)
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString());

      const dailyCount: Record<string, number> = {};
      logs?.forEach((log) => {
        const date = new Date(log.start_time).toISOString().split('T')[0];
        dailyCount[date] = (dailyCount[date] || 0) + 1;
      });

      const trend: DailyMetric[] = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(endDate);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayNum = date.getDate();
        trend.push({
          date: dateStr,
          value: dailyCount[dateStr] || 0,
          label: `${dayNum}`,
        });
      }

      const total = Object.values(dailyCount).reduce((sum, count) => sum + count, 0);
      const average = total > 0 ? Math.round(total / days) : 0;

      return { trend, average };
    },
    enabled: !!baby,
  });

  const { data: sleepData = { trend: [], average: 0 }, isLoading: sleepLoading } = useQuery({
    queryKey: ['analytics-sleep', baby?.id, days],
    queryFn: async () => {
      if (!baby) return { trend: [], average: 0 };

      const endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);

      const { data: logs } = await supabase
        .from('sleep_logs')
        .select('start_time, end_time')
        .eq('baby_id', baby.id)
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString());

      const dailyMinutes: Record<string, number> = {};
      logs?.forEach((log) => {
        const startTime = new Date(log.start_time).getTime();
        const endTime = log.end_time ? new Date(log.end_time).getTime() : startTime;
        const minutes = (endTime - startTime) / 60000;
        const date = new Date(log.start_time).toISOString().split('T')[0];
        dailyMinutes[date] = (dailyMinutes[date] || 0) + minutes;
      });

      const trend: DailyMetric[] = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(endDate);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayNum = date.getDate();
        const minutes = dailyMinutes[dateStr] || 0;
        trend.push({
          date: dateStr,
          value: Math.round(minutes / 60),
          label: `${dayNum}`,
        });
      }

      const totalMinutes = Object.values(dailyMinutes).reduce((sum, m) => sum + m, 0);
      const average = totalMinutes > 0 ? Math.round(totalMinutes / days / 60) : 0;

      return { trend, average };
    },
    enabled: !!baby,
  });

  const { data: nappyData = { trend: [], average: 0 }, isLoading: nappyLoading } = useQuery({
    queryKey: ['analytics-nappy', baby?.id, days],
    queryFn: async () => {
      if (!baby) return { trend: [], average: 0 };

      const endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);

      const { data: logs } = await supabase
        .from('nappy_logs')
        .select('logged_at')
        .eq('baby_id', baby.id)
        .gte('logged_at', startDate.toISOString())
        .lte('logged_at', endDate.toISOString());

      const dailyCount: Record<string, number> = {};
      logs?.forEach((log) => {
        const date = new Date(log.logged_at).toISOString().split('T')[0];
        dailyCount[date] = (dailyCount[date] || 0) + 1;
      });

      const trend: DailyMetric[] = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(endDate);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayNum = date.getDate();
        trend.push({
          date: dateStr,
          value: dailyCount[dateStr] || 0,
          label: `${dayNum}`,
        });
      }

      const total = Object.values(dailyCount).reduce((sum, count) => sum + count, 0);
      const average = total > 0 ? Math.round(total / days) : 0;

      return { trend, average };
    },
    enabled: !!baby,
  });

  return {
    feedingTrend: feedingData.trend,
    sleepTrend: sleepData.trend,
    nappyTrend: nappyData.trend,
    feedingAverage: feedingData.average,
    sleepAverage: sleepData.average,
    nappyAverage: nappyData.average,
    isLoading: feedingLoading || sleepLoading || nappyLoading,
  };
}
