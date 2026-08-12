import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/auth/supabase';
import { useBaby } from './useBaby';

export interface FeedInsights {
  averageFeedsPerDay: number;
  dailyTrend: { label: string; count: number }[];
  avgBottleMl: number | null;
  longestGapMinutes: number;
  breastCount: number;
  bottleCount: number;
  isLoading: boolean;
}

const DAYS = 7;

export function useFeedInsights(): FeedInsights {
  const { baby } = useBaby();

  const { data, isLoading } = useQuery({
    queryKey: ['feed-insights', baby?.id],
    queryFn: async () => {
      if (!baby) return null;

      const endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - (DAYS - 1));
      startDate.setHours(0, 0, 0, 0);

      const { data: logs } = await supabase
        .from('feeding_logs')
        .select('start_time, feed_type, amount_ml')
        .eq('baby_id', baby.id)
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString())
        .order('start_time', { ascending: true });

      const sorted = logs || [];

      const dailyCount: Record<string, number> = {};
      let breastCount = 0;
      let bottleCount = 0;
      const bottleAmounts: number[] = [];
      let longestGapMinutes = 0;

      sorted.forEach((log, i) => {
        const dateKey = new Date(log.start_time).toISOString().split('T')[0];
        dailyCount[dateKey] = (dailyCount[dateKey] || 0) + 1;

        if (log.feed_type === 'breast') breastCount++;
        if (log.feed_type === 'bottle') {
          bottleCount++;
          if (log.amount_ml != null) bottleAmounts.push(log.amount_ml);
        }

        if (i > 0) {
          const gap =
            (new Date(log.start_time).getTime() - new Date(sorted[i - 1].start_time).getTime()) / 60000;
          if (gap > longestGapMinutes) longestGapMinutes = gap;
        }
      });

      const dailyTrend: { label: string; count: number }[] = [];
      for (let i = DAYS - 1; i >= 0; i--) {
        const date = new Date(endDate);
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        dailyTrend.push({
          label: `${date.getDate()}`,
          count: dailyCount[dateKey] || 0,
        });
      }

      const totalFeeds = sorted.length;
      const averageFeedsPerDay = Math.round((totalFeeds / DAYS) * 10) / 10;

      const avgBottleMl =
        bottleAmounts.length > 0
          ? Math.round(bottleAmounts.reduce((sum, m) => sum + m, 0) / bottleAmounts.length)
          : null;

      return {
        averageFeedsPerDay,
        dailyTrend,
        avgBottleMl,
        longestGapMinutes: Math.round(longestGapMinutes),
        breastCount,
        bottleCount,
      };
    },
    enabled: !!baby,
  });

  return {
    averageFeedsPerDay: data?.averageFeedsPerDay ?? 0,
    dailyTrend: data?.dailyTrend ?? [],
    avgBottleMl: data?.avgBottleMl ?? null,
    longestGapMinutes: data?.longestGapMinutes ?? 0,
    breastCount: data?.breastCount ?? 0,
    bottleCount: data?.bottleCount ?? 0,
    isLoading,
  };
}
