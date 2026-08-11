import { useQuery } from '@tanstack/react-query';
import { useBaby } from './useBaby';
import { useStore } from '@/stores/useStore';
import { supabase } from '@/lib/auth/supabase';
import { formatDuration } from '@/lib/utils/dateUtils';
import { formatMilk } from '@/lib/utils/unitConversion';

export interface TimelineItem {
  id: string;
  type: 'feed' | 'sleep' | 'nappy';
  timestamp: string;
  title: string;
  subtitle: string;
  rawData: any;
}

export function useTodayTimeline() {
  const { baby } = useBaby();
  const { userPreferences } = useStore();

  const { data: timeline = [], isLoading } = useQuery({
    queryKey: ['today-timeline', baby?.id],
    queryFn: async (): Promise<TimelineItem[]> => {
      if (!baby) return [];

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

      const items: TimelineItem[] = [];

      (feeds.data || []).forEach((feed) => {
        items.push({
          id: feed.id,
          type: 'feed',
          timestamp: feed.start_time,
          title: feed.feed_type === 'breast' ? 'Breastfeed' : 'Bottle',
          subtitle: feed.feed_type === 'breast' ? `${feed.left_duration_seconds}s + ${feed.right_duration_seconds}s` : `${formatMilk(feed.amount_ml || 0, userPreferences.milkUnit)}`,
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
          title: sleep.end_time ? 'Slept' : 'Woke up',
          subtitle: `${formatDuration(duration)}`,
          rawData: sleep,
        });
      });

      (nappies.data || []).forEach((nappy) => {
        const typeLabel = nappy.type === 'both' ? 'Wet + dirty' : nappy.type.charAt(0).toUpperCase() + nappy.type.slice(1);
        items.push({
          id: nappy.id,
          type: 'nappy',
          timestamp: nappy.logged_at,
          title: `${typeLabel} nappy`,
          subtitle: '',
          rawData: nappy,
        });
      });

      items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      return items.slice(0, 5);
    },
    enabled: !!baby,
  });

  return { timeline, isLoading };
}
