import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/auth/supabase';
import { useBaby } from './useBaby';
import { lbToKg } from '@/lib/utils/unitConversion';

export type InsightsRange = 7 | 30 | 'all';

export interface InsightsSummary {
  averageSleepMinutes: number;
  feedsPerDay: number;
  avgBottleMl: number | null;
  nappiesPerDay: number;
  tummyMinutesPerDay: number;
  weightChangeKgPerWeek: number | null;
  sleepInsight: string | null;
  isLoading: boolean;
}

function toKg(weight: number, unit: string | null): number {
  return unit === 'lb' ? lbToKg(weight) : weight;
}

export function useInsightsSummary(range: InsightsRange): InsightsSummary {
  const { baby } = useBaby();

  const { data, isLoading } = useQuery({
    queryKey: ['insights-summary', baby?.id, range],
    queryFn: async () => {
      if (!baby) return null;

      const endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
      const startDate =
        range === 'all'
          ? new Date(baby.date_of_birth)
          : (() => {
              const d = new Date(endDate);
              d.setDate(d.getDate() - (range - 1));
              d.setHours(0, 0, 0, 0);
              return d;
            })();

      const days = Math.max(
        1,
        Math.round((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000))
      );

      const [sleepRes, feedRes, nappyRes, tummyRes, growthRes] = await Promise.all([
        supabase
          .from('sleep_logs')
          .select('start_time, end_time, sleep_type')
          .eq('baby_id', baby.id)
          .gte('start_time', startDate.toISOString())
          .lte('start_time', endDate.toISOString()),
        supabase
          .from('feeding_logs')
          .select('start_time, feed_type, amount_ml')
          .eq('baby_id', baby.id)
          .gte('start_time', startDate.toISOString())
          .lte('start_time', endDate.toISOString()),
        supabase
          .from('nappy_logs')
          .select('logged_at')
          .eq('baby_id', baby.id)
          .gte('logged_at', startDate.toISOString())
          .lte('logged_at', endDate.toISOString()),
        supabase
          .from('tummy_time_logs')
          .select('start_time, end_time')
          .eq('baby_id', baby.id)
          .gte('start_time', startDate.toISOString())
          .lte('start_time', endDate.toISOString()),
        supabase
          .from('growth_logs')
          .select('weight, weight_unit, measured_at')
          .eq('baby_id', baby.id)
          .not('weight', 'is', null)
          .gte('measured_at', startDate.toISOString())
          .lte('measured_at', endDate.toISOString())
          .order('measured_at', { ascending: true }),
      ]);

      const sleepLogs = sleepRes.data || [];
      const feedLogs = feedRes.data || [];
      const nappyLogs = nappyRes.data || [];
      const tummyLogs = tummyRes.data || [];
      const growthLogs = growthRes.data || [];

      // --- Sleep ---
      const sleepMinutesByDate: Record<string, number> = {};
      sleepLogs.forEach((log) => {
        if (!log.end_time) return;
        const start = new Date(log.start_time);
        const minutes = (new Date(log.end_time).getTime() - start.getTime()) / 60000;
        const key = start.toISOString().split('T')[0];
        sleepMinutesByDate[key] = (sleepMinutesByDate[key] || 0) + minutes;
      });
      const totalSleepMinutes = Object.values(sleepMinutesByDate).reduce((s, m) => s + m, 0);
      const averageSleepMinutes = Math.round(totalSleepMinutes / days);

      // --- Feeds ---
      const feedsPerDay = Math.round((feedLogs.length / days) * 10) / 10;
      const bottleFeeds = feedLogs.filter((f) => f.feed_type === 'bottle' && f.amount_ml != null);
      const avgBottleMl =
        bottleFeeds.length > 0
          ? Math.round(bottleFeeds.reduce((s, f) => s + (f.amount_ml || 0), 0) / bottleFeeds.length)
          : null;

      // --- Nappies ---
      const nappiesPerDay = Math.round((nappyLogs.length / days) * 10) / 10;

      // --- Tummy time ---
      const totalTummyMinutes = tummyLogs.reduce((sum, log) => {
        if (!log.end_time) return sum;
        return sum + (new Date(log.end_time).getTime() - new Date(log.start_time).getTime()) / 60000;
      }, 0);
      const tummyMinutesPerDay = Math.round(totalTummyMinutes / days);

      // --- Weight change ---
      let weightChangeKgPerWeek: number | null = null;
      if (growthLogs.length >= 2) {
        const first = growthLogs[0];
        const last = growthLogs[growthLogs.length - 1];
        const firstKg = toKg(first.weight as number, first.weight_unit);
        const lastKg = toKg(last.weight as number, last.weight_unit);
        const spanWeeks = Math.max(
          1 / 7,
          (new Date(last.measured_at).getTime() - new Date(first.measured_at).getTime()) /
            (7 * 24 * 60 * 60 * 1000)
        );
        weightChangeKgPerWeek = Math.round(((lastKg - firstKg) / spanWeeks) * 100) / 100;
      }

      // --- Sleep trend insight: compare first half vs second half of range ---
      let sleepInsight: string | null = null;
      const dateKeys = Object.keys(sleepMinutesByDate).sort();
      if (dateKeys.length >= 4) {
        const mid = Math.floor(days / 2);
        const midDate = new Date(startDate);
        midDate.setDate(midDate.getDate() + mid);
        const midKey = midDate.toISOString().split('T')[0];

        let firstHalfTotal = 0;
        let firstHalfDays = 0;
        let secondHalfTotal = 0;
        let secondHalfDays = 0;

        for (let i = 0; i < days; i++) {
          const d = new Date(startDate);
          d.setDate(d.getDate() + i);
          const key = d.toISOString().split('T')[0];
          const minutes = sleepMinutesByDate[key] || 0;
          if (key < midKey) {
            firstHalfTotal += minutes;
            firstHalfDays++;
          } else {
            secondHalfTotal += minutes;
            secondHalfDays++;
          }
        }

        const firstAvg = firstHalfDays > 0 ? firstHalfTotal / firstHalfDays : 0;
        const secondAvg = secondHalfDays > 0 ? secondHalfTotal / secondHalfDays : 0;

        if (firstAvg > 0) {
          const changePct = ((secondAvg - firstAvg) / firstAvg) * 100;
          if (changePct >= 10) {
            sleepInsight = 'Night sleep is trending longer.';
          } else if (changePct <= -10) {
            sleepInsight = 'Sleep has been trending shorter.';
          }
        }
      }

      return {
        averageSleepMinutes,
        feedsPerDay,
        avgBottleMl,
        nappiesPerDay,
        tummyMinutesPerDay,
        weightChangeKgPerWeek,
        sleepInsight,
      };
    },
    enabled: !!baby,
  });

  return {
    averageSleepMinutes: data?.averageSleepMinutes ?? 0,
    feedsPerDay: data?.feedsPerDay ?? 0,
    avgBottleMl: data?.avgBottleMl ?? null,
    nappiesPerDay: data?.nappiesPerDay ?? 0,
    tummyMinutesPerDay: data?.tummyMinutesPerDay ?? 0,
    weightChangeKgPerWeek: data?.weightChangeKgPerWeek ?? null,
    sleepInsight: data?.sleepInsight ?? null,
    isLoading,
  };
}
