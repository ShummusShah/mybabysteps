import { useQuery } from '@tanstack/react-query';
import { useBaby } from './useBaby';
import { useStore } from '@/stores/useStore';
import { supabase } from '@/lib/auth/supabase';
import { formatDuration } from '@/lib/utils/dateUtils';
import { formatMilk } from '@/lib/utils/unitConversion';

export type LogEntryType =
  | 'feed'
  | 'sleep'
  | 'nappy'
  | 'tummy'
  | 'medicine'
  | 'temperature'
  | 'growth'
  | 'milestone'
  | 'photo';

export interface LogEntry {
  id: string;
  type: LogEntryType;
  timestamp: string;
  title: string;
  subtitle: string;
  rawData: any;
}

export async function fetchLogEntries(
  babyId: string,
  milkUnit: 'ml' | 'fl_oz',
  startDate: Date,
  endDate: Date
): Promise<LogEntry[]> {
  const [feeds, sleeps, nappies, tummyTimes, medicines, temperatures, growths, milestones, photos] =
    await Promise.all([
      supabase
        .from('feeding_logs')
        .select('*')
        .eq('baby_id', babyId)
        .gte('start_time', startDate.toISOString())
        .lt('start_time', endDate.toISOString())
        .order('start_time', { ascending: false }),
      supabase
        .from('sleep_logs')
        .select('*')
        .eq('baby_id', babyId)
        .gte('start_time', startDate.toISOString())
        .lt('start_time', endDate.toISOString())
        .order('start_time', { ascending: false }),
      supabase
        .from('nappy_logs')
        .select('*')
        .eq('baby_id', babyId)
        .gte('logged_at', startDate.toISOString())
        .lt('logged_at', endDate.toISOString())
        .order('logged_at', { ascending: false }),
      supabase
        .from('tummy_time_logs')
        .select('*')
        .eq('baby_id', babyId)
        .gte('start_time', startDate.toISOString())
        .lt('start_time', endDate.toISOString())
        .order('start_time', { ascending: false }),
      supabase
        .from('medicine_logs')
        .select('*')
        .eq('baby_id', babyId)
        .gte('given_at', startDate.toISOString())
        .lt('given_at', endDate.toISOString())
        .order('given_at', { ascending: false }),
      supabase
        .from('temperature_logs')
        .select('*')
        .eq('baby_id', babyId)
        .gte('taken_at', startDate.toISOString())
        .lt('taken_at', endDate.toISOString())
        .order('taken_at', { ascending: false }),
      supabase
        .from('growth_logs')
        .select('*')
        .eq('baby_id', babyId)
        .gte('measured_at', startDate.toISOString())
        .lt('measured_at', endDate.toISOString())
        .order('measured_at', { ascending: false }),
      supabase
        .from('milestones')
        .select('*')
        .eq('baby_id', babyId)
        .gte('achieved_at', startDate.toISOString())
        .lt('achieved_at', endDate.toISOString())
        .order('achieved_at', { ascending: false }),
      supabase
        .from('photos')
        .select('*')
        .eq('baby_id', babyId)
        .gte('logged_at', startDate.toISOString())
        .lt('logged_at', endDate.toISOString())
        .order('logged_at', { ascending: false }),
    ]);

  const items: LogEntry[] = [];

  (feeds.data || []).forEach((feed) => {
    items.push({
      id: feed.id,
      type: 'feed',
      timestamp: feed.start_time,
      title: feed.feed_type === 'breast' ? 'Breastfeed' : 'Bottle',
      subtitle:
        feed.feed_type === 'breast'
          ? `Left ${Math.round((feed.left_duration_seconds || 0) / 60)}m · Right ${Math.round((feed.right_duration_seconds || 0) / 60)}m`
          : `${feed.milk_type ? feed.milk_type.charAt(0).toUpperCase() + feed.milk_type.slice(1) + ' · ' : ''}${formatMilk(feed.amount_ml || 0, milkUnit)}`,
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
      subtitle: `Sleep · ${formatDuration(duration)}`,
      rawData: sleep,
    });
  });

  (nappies.data || []).forEach((nappy) => {
    const typeLabel =
      nappy.type === 'both' ? 'Wet + dirty' : nappy.type.charAt(0).toUpperCase() + nappy.type.slice(1);
    items.push({
      id: nappy.id,
      type: 'nappy',
      timestamp: nappy.logged_at,
      title: `${typeLabel} nappy`,
      subtitle: '',
      rawData: nappy,
    });
  });

  (tummyTimes.data || []).forEach((tummy) => {
    const endTime = tummy.end_time ? new Date(tummy.end_time).getTime() : Date.now();
    const duration = Math.floor((endTime - new Date(tummy.start_time).getTime()) / 1000);
    items.push({
      id: tummy.id,
      type: 'tummy',
      timestamp: tummy.start_time,
      title: 'Tummy Time',
      subtitle: tummy.end_time ? formatDuration(duration) : 'In progress',
      rawData: tummy,
    });
  });

  (medicines.data || []).forEach((medicine) => {
    items.push({
      id: medicine.id,
      type: 'medicine',
      timestamp: medicine.given_at,
      title: medicine.medicine_name,
      subtitle: medicine.dosage || '',
      rawData: medicine,
    });
  });

  (temperatures.data || []).forEach((temperature) => {
    items.push({
      id: temperature.id,
      type: 'temperature',
      timestamp: temperature.taken_at,
      title: 'Temperature',
      subtitle: `${temperature.temperature.toFixed(1)}°${temperature.unit}`,
      rawData: temperature,
    });
  });

  (growths.data || []).forEach((growth) => {
    const parts: string[] = [];
    if (growth.weight != null) parts.push(`${growth.weight}${growth.weight_unit || ''}`);
    if (growth.height != null) parts.push(`${growth.height}${growth.height_unit || ''}`);
    if (growth.head_circumference != null) parts.push(`Head ${growth.head_circumference}cm`);
    items.push({
      id: growth.id,
      type: 'growth',
      timestamp: growth.measured_at,
      title: 'Growth',
      subtitle: parts.join(' · '),
      rawData: growth,
    });
  });

  (milestones.data || []).forEach((milestone) => {
    items.push({
      id: milestone.id,
      type: 'milestone',
      timestamp: milestone.achieved_at,
      title: milestone.title,
      subtitle: 'Milestone',
      rawData: milestone,
    });
  });

  (photos.data || []).forEach((photo) => {
    items.push({
      id: photo.id,
      type: 'photo',
      timestamp: photo.logged_at,
      title: 'Photo',
      subtitle: photo.caption || '',
      rawData: photo,
    });
  });

  items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return items;
}

export function useLogEntries(days: number) {
  const { baby } = useBaby();
  const { userPreferences } = useStore();

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['log-entries', baby?.id, days],
    queryFn: async (): Promise<LogEntry[]> => {
      if (!baby) return [];

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);

      return fetchLogEntries(baby.id, userPreferences.milkUnit, startDate, endDate);
    },
    enabled: !!baby,
  });

  return { logs, isLoading };
}
