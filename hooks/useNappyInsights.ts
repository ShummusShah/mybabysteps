import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/auth/supabase';
import { useBaby } from './useBaby';

export interface NappyInsights {
  averageNappiesPerDay: number;
  dailyTrend: { label: string; count: number }[];
  wetCount: number;
  dirtyCount: number;
  bothCount: number;
  longestGapMinutes: number;
  isLoading: boolean;
}

const DAYS = 7;

export function useNappyInsights(): NappyInsights {
  const { baby } = useBaby();

  const { data, isLoading } = useQuery({
    queryKey: ['nappy-insights', baby?.id],
    queryFn: async () => {
      if (!baby) return null;

      const endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - (DAYS - 1));
      startDate.setHours(0, 0, 0, 0);

      const { data: logs } = await supabase
        .from('nappy_logs')
        .select('logged_at, type')
        .eq('baby_id', baby.id)
        .gte('logged_at', startDate.toISOString())
        .lte('logged_at', endDate.toISOString())
        .order('logged_at', { ascending: true });

      const sorted = logs || [];

      const dailyCount: Record<string, number> = {};
      let wetCount = 0;
      let dirtyCount = 0;
      let bothCount = 0;
      let longestGapMinutes = 0;

      sorted.forEach((log, i) => {
        const dateKey = new Date(log.logged_at).toISOString().split('T')[0];
        dailyCount[dateKey] = (dailyCount[dateKey] || 0) + 1;

        if (log.type === 'wet') wetCount++;
        else if (log.type === 'dirty') dirtyCount++;
        else if (log.type === 'both') bothCount++;

        if (i > 0) {
          const gap =
            (new Date(log.logged_at).getTime() - new Date(sorted[i - 1].logged_at).getTime()) / 60000;
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

      const totalNappies = sorted.length;
      const averageNappiesPerDay = Math.round((totalNappies / DAYS) * 10) / 10;

      return {
        averageNappiesPerDay,
        dailyTrend,
        wetCount,
        dirtyCount,
        bothCount,
        longestGapMinutes: Math.round(longestGapMinutes),
      };
    },
    enabled: !!baby,
  });

  return {
    averageNappiesPerDay: data?.averageNappiesPerDay ?? 0,
    dailyTrend: data?.dailyTrend ?? [],
    wetCount: data?.wetCount ?? 0,
    dirtyCount: data?.dirtyCount ?? 0,
    bothCount: data?.bothCount ?? 0,
    longestGapMinutes: data?.longestGapMinutes ?? 0,
    isLoading,
  };
}
