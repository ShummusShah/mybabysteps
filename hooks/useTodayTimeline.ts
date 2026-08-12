import { useQuery } from '@tanstack/react-query';
import { useBaby } from './useBaby';
import { useStore } from '@/stores/useStore';
import { fetchLogEntries } from './useLogEntries';
import type { LogEntry } from './useLogEntries';

export type { LogEntry as TimelineItem } from './useLogEntries';

export function useTodayTimeline() {
  const { baby } = useBaby();
  const { userPreferences } = useStore();

  const { data: timeline = [], isLoading } = useQuery({
    queryKey: ['today-timeline', baby?.id],
    queryFn: async (): Promise<LogEntry[]> => {
      if (!baby) return [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      return fetchLogEntries(baby.id, userPreferences.milkUnit, today, tomorrow);
    },
    enabled: !!baby,
  });

  return { timeline, isLoading };
}
