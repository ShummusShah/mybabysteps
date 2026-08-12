import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/auth/supabase';
import { useBaby } from './useBaby';
import { useStore } from '@/stores/useStore';
import { kgToLb, lbToKg, cmToInches, inchesToCm } from '@/lib/utils/unitConversion';

export type GrowthMetric = 'weight' | 'height' | 'head_circumference';

export interface GrowthPoint {
  date: string;
  value: number;
}

export interface GrowthInsights {
  unit: string;
  latestValue: number | null;
  latestDate: string | null;
  birthValue: number | null;
  change: number | null;
  trend: GrowthPoint[];
  isLoading: boolean;
}

function normalizeWeight(value: number, fromUnit: string | null, toUnit: 'kg' | 'lb'): number {
  const kg = fromUnit === 'lb' ? lbToKg(value) : value;
  return toUnit === 'kg' ? kg : kgToLb(kg);
}

function normalizeLength(value: number, fromUnit: string | null, toUnit: 'cm' | 'inches'): number {
  const cm = fromUnit === 'inches' ? inchesToCm(value) : value;
  return toUnit === 'cm' ? cm : cmToInches(cm);
}

export function useGrowthInsights(metric: GrowthMetric): GrowthInsights {
  const { baby } = useBaby();
  const { userPreferences } = useStore();
  const unit = metric === 'weight' ? userPreferences.weightUnit : metric === 'height' ? userPreferences.heightUnit : 'cm';

  const { data, isLoading } = useQuery({
    queryKey: ['growth-insights', baby?.id, metric, unit],
    queryFn: async () => {
      if (!baby) return { trend: [] as GrowthPoint[] };

      const { data: logs } = await supabase
        .from('growth_logs')
        .select('measured_at, weight, height, head_circumference, weight_unit, height_unit')
        .eq('baby_id', baby.id)
        .not(metric, 'is', null)
        .order('measured_at', { ascending: true });

      const points: GrowthPoint[] = (logs || []).map((log) => {
        const raw = log[metric] as number;
        let value = raw;
        if (metric === 'weight') value = normalizeWeight(raw, log.weight_unit, unit as 'kg' | 'lb');
        else if (metric === 'height') value = normalizeLength(raw, log.height_unit, unit as 'cm' | 'inches');
        return { date: log.measured_at, value: Math.round(value * 100) / 100 };
      });

      return { trend: points };
    },
    enabled: !!baby,
  });

  const points = data?.trend ?? [];
  const latest = points.length > 0 ? points[points.length - 1] : null;
  const first = points.length > 0 ? points[0] : null;

  return {
    unit,
    latestValue: latest?.value ?? null,
    latestDate: latest?.date ?? null,
    birthValue: first?.value ?? null,
    change: latest && first ? Math.round((latest.value - first.value) * 100) / 100 : null,
    trend: points.slice(-7),
    isLoading,
  };
}
