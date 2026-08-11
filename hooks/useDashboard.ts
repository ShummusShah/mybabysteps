import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/auth/supabase';
import { useBaby } from './useBaby';
import { formatElapsedTime, formatDuration, isToday } from '@/lib/utils/dateUtils';

export function useDashboard() {
  const { baby } = useBaby();

  const { data: latestFeed = null, isLoading: feedLoading } = useQuery({
    queryKey: ['latestFeed', baby?.id],
    queryFn: async () => {
      if (!baby) return null;

      const { data, error } = await supabase
        .from('feeding_logs')
        .select('*')
        .eq('baby_id', baby.id)
        .order('start_time', { ascending: false })
        .limit(1)
        .single();

      if (error) return null;
      return data;
    },
    enabled: !!baby,
  });

  const { data: todayFeeds = [], isLoading: feedCountLoading } = useQuery({
    queryKey: ['todayFeeds', baby?.id],
    queryFn: async () => {
      if (!baby) return [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data, error } = await supabase
        .from('feeding_logs')
        .select('*')
        .eq('baby_id', baby.id)
        .gte('start_time', today.toISOString())
        .lt('start_time', tomorrow.toISOString());

      if (error) return [];
      return data || [];
    },
    enabled: !!baby,
  });

  const { data: currentSleep = null } = useQuery({
    queryKey: ['currentSleep', baby?.id],
    queryFn: async () => {
      if (!baby) return null;

      const { data, error } = await supabase
        .from('sleep_logs')
        .select('*')
        .eq('baby_id', baby.id)
        .is('end_time', null)
        .order('start_time', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) return null;
      return data;
    },
    enabled: !!baby,
  });

  const { data: latestSleep = null } = useQuery({
    queryKey: ['latestSleep', baby?.id],
    queryFn: async () => {
      if (!baby) return null;

      const { data, error } = await supabase
        .from('sleep_logs')
        .select('*')
        .eq('baby_id', baby.id)
        .order('end_time', { ascending: false })
        .limit(1)
        .single();

      if (error) return null;
      return data;
    },
    enabled: !!baby,
  });

  const { data: todaySleep = 0, isLoading: sleepLoading } = useQuery({
    queryKey: ['todaySleep', baby?.id],
    queryFn: async () => {
      if (!baby) return 0;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data, error } = await supabase
        .from('sleep_logs')
        .select('*')
        .eq('baby_id', baby.id)
        .gte('start_time', today.toISOString())
        .lt('start_time', tomorrow.toISOString());

      if (error) return 0;

      const totalSeconds = (data || []).reduce((acc, log) => {
        if (log.end_time) {
          const start = new Date(log.start_time).getTime();
          const end = new Date(log.end_time).getTime();
          return acc + Math.floor((end - start) / 1000);
        }
        return acc;
      }, 0);

      return totalSeconds;
    },
    enabled: !!baby,
  });

  const { data: latestNappy = null } = useQuery({
    queryKey: ['latestNappy', baby?.id],
    queryFn: async () => {
      if (!baby) return null;

      const { data, error } = await supabase
        .from('nappy_logs')
        .select('*')
        .eq('baby_id', baby.id)
        .order('logged_at', { ascending: false })
        .limit(1)
        .single();

      if (error) return null;
      return data;
    },
    enabled: !!baby,
  });

  const { data: todayNappies = 0 } = useQuery({
    queryKey: ['todayNappies', baby?.id],
    queryFn: async () => {
      if (!baby) return 0;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data, error } = await supabase
        .from('nappy_logs')
        .select('*')
        .eq('baby_id', baby.id)
        .gte('logged_at', today.toISOString())
        .lt('logged_at', tomorrow.toISOString());

      if (error) return 0;
      return (data || []).length;
    },
    enabled: !!baby,
  });

  return {
    baby,
    latestFeed,
    todayFeeds,
    currentSleep,
    latestSleep,
    todaySleep,
    latestNappy,
    todayNappies,
    isLoading: feedLoading || feedCountLoading || sleepLoading,
  };
}
