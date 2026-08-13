import { theme } from '@/constants/theme';

export type QuickLogModuleType =
  | 'feed'
  | 'sleep'
  | 'nappy'
  | 'pump'
  | 'tummy'
  | 'medicine'
  | 'temperature'
  | 'growth'
  | 'milestone'
  | 'photo';

export const moduleIcons: Record<QuickLogModuleType, string> = {
  feed: 'bottle-soda',
  sleep: 'sleep',
  nappy: 'water',
  pump: 'water-pump',
  tummy: 'baby-face',
  medicine: 'pill',
  temperature: 'thermometer',
  growth: 'scale',
  milestone: 'star',
  photo: 'camera',
};

export const moduleLabels: Record<QuickLogModuleType, string> = {
  feed: 'Feeding',
  sleep: 'Sleep',
  nappy: 'Nappies',
  pump: 'Pumping',
  tummy: 'Tummy Time',
  medicine: 'Medicine',
  temperature: 'Temperature',
  growth: 'Growth',
  milestone: 'Milestones',
  photo: 'Photos',
};

export const moduleColors: Record<QuickLogModuleType, { bg: string; accent: string }> = {
  feed: { bg: theme.colors.mint, accent: theme.colors.teal },
  sleep: { bg: theme.colors.lavender, accent: theme.colors.purple },
  nappy: { bg: theme.colors.peach, accent: theme.colors.orange },
  pump: { bg: theme.colors.pink, accent: theme.colors.pinkAccent },
  tummy: { bg: theme.colors.yellow, accent: theme.colors.yellowAccent },
  medicine: { bg: theme.colors.pink, accent: theme.colors.pinkAccent },
  temperature: { bg: theme.colors.mint, accent: theme.colors.teal },
  growth: { bg: theme.colors.lavender, accent: theme.colors.purple },
  milestone: { bg: theme.colors.yellow, accent: theme.colors.yellowAccent },
  photo: { bg: theme.colors.peach, accent: theme.colors.orange },
};
