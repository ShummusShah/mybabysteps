import { theme } from '@/constants/theme';
import type { LogEntryType } from '@/hooks/useLogEntries';

export function getLogTypeColor(type: LogEntryType | string): string {
  switch (type) {
    case 'feed':
      return '#21B6AD';
    case 'sleep':
      return '#8A73D6';
    case 'nappy':
      return '#FF8B5C';
    case 'tummy':
      return theme.colors.yellowAccent;
    case 'medicine':
      return '#EC4899';
    case 'temperature':
      return '#EF4444';
    case 'growth':
      return '#10B981';
    case 'milestone':
      return '#F5A623';
    case 'photo':
      return '#A855F7';
    default:
      return theme.colors.teal;
  }
}
