import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/auth/supabase';
import { useBaby } from './useBaby';

export interface SleepInsights {
  averageDailyMinutes: number;
  dailyTrend: { label: string; minutes: number }[];
  longestSleepMinutes: number;
  avgBedtimeMinutes: number | null;
  napsPerDay: number;
  avgNapMinutes: number;
  isLoading: boolean;
}

const DAYS = 7;

export function useSleepInsights(): SleepInsights {
  const { baby } = useBaby();

  const { data, isLoading } = useQuery({
    queryKey: ['sleep-insights', baby?.id],
    queryFn: async () => {
      if (!baby) return null;

      const endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - (DAYS - 1));
      startDate.setHours(0, 0, 0, 0);

      const { data: logs } = await supabase
        .from('sleep_logs')
        .select('start_time, end_time, sleep_type')
        .eq('baby_id', baby.id)
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString());

      const completed = (logs || []).filter((log) => !!log.end_time);

      const dailyMinutes: Record<string, number> = {};
      let longestSleepMinutes = 0;
      const bedtimeMinutesList: number[] = [];
      const napDurations: number[] = [];

      completed.forEach((log) => {
        const start = new Date(log.start_time);
        const end = new Date(log.end_time as string);
        const minutes = (end.getTime() - start.getTime()) / 60000;
        const dateKey = start.toISOString().split('T')[0];
        dailyMinutes[dateKey] = (dailyMinutes[dateKey] || 0) + minutes;

        if (minutes > longestSleepMinutes) longestSleepMinutes = minutes;

        if (log.sleep_type === 'night') {
          bedtimeMinutesList.push(start.getHours() * 60 + start.getMinutes());
        } else {
          napDurations.push(minutes);
        }
      });

      const dailyTrend: { label: string; minutes: number }[] = [];
      for (let i = DAYS - 1; i >= 0; i--) {
        const date = new Date(endDate);
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        dailyTrend.push({
          label: `${date.getDate()}`,
          minutes: Math.round(dailyMinutes[dateKey] || 0),
        });
      }

      const totalMinutes = Object.values(dailyMinutes).reduce((sum, m) => sum + m, 0);
      const averageDailyMinutes = Math.round(totalMinutes / DAYS);

      const avgBedtimeMinutes =
        bedtimeMinutesList.length > 0
          ? Math.round(bedtimeMinutesList.reduce((sum, m) => sum + m, 0) / bedtimeMinutesList.length)
          : null;

      const napsPerDay = Math.round((napDurations.length / DAYS) * 10) / 10;
      const avgNapMinutes =
        napDurations.length > 0
          ? Math.round(napDurations.reduce((sum, m) => sum + m, 0) / napDurations.length)
          : 0;

      return {
        averageDailyMinutes,
        dailyTrend,
        longestSleepMinutes: Math.round(longestSleepMinutes),
        avgBedtimeMinutes,
        napsPerDay,
        avgNapMinutes,
      };
    },
    enabled: !!baby,
  });

  return {
    averageDailyMinutes: data?.averageDailyMinutes ?? 0,
    dailyTrend: data?.dailyTrend ?? [],
    longestSleepMinutes: data?.longestSleepMinutes ?? 0,
    avgBedtimeMinutes: data?.avgBedtimeMinutes ?? null,
    napsPerDay: data?.napsPerDay ?? 0,
    avgNapMinutes: data?.avgNapMinutes ?? 0,
    isLoading,
  };
}
