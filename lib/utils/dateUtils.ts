import { format, differenceInDays, differenceInSeconds, parseISO, formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export function getBabyAge(dateOfBirth: string) {
  const dob = parseISO(dateOfBirth);
  const today = new Date();
  const days = differenceInDays(today, dob);

  if (days < 7) {
    return { days, weeks: 0, months: 0, displayText: `${days} day${days === 1 ? '' : 's'} old` };
  }

  const weeks = Math.floor(days / 7);
  const remainingDays = days % 7;

  if (weeks < 4) {
    return {
      days,
      weeks,
      months: 0,
      displayText: `${weeks} week${weeks === 1 ? '' : 's'}, ${remainingDays} day${remainingDays === 1 ? '' : 's'} old`,
    };
  }

  const months = Math.floor(days / 30.44);
  const monthDays = Math.floor(days % 30.44);

  return {
    days,
    weeks: Math.floor(monthDays / 7),
    months,
    displayText: `${months} month${months === 1 ? '' : 's'}, ${Math.floor(monthDays / 7)} week${Math.floor(monthDays / 7) === 1 ? '' : 's'} old`,
  };
}

export function formatBabyAge(dateOfBirth: string): string {
  return getBabyAge(dateOfBirth).displayText;
}

export function formatElapsedTime(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return `${seconds}s ago`;
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  if (hours < 24) {
    return `${hours}h ${minutes % 60}m ago`;
  }

  if (days < 7) {
    return `${days}d ago`;
  }

  return formatDistanceToNow(new Date(Date.now() - milliseconds), { addSuffix: true });
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes < 60) {
    if (remainingSeconds === 0) {
      return `${minutes}m`;
    }
    return `${minutes}m ${remainingSeconds}s`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${hours}h ${remainingMinutes}m`;
}

export function formatStopwatch(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(secs)}`;
  }
  return `${pad(minutes)}:${pad(secs)}`;
}

export function formatDurationShort(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes < 60) {
    return `${minutes}m ${remainingSeconds}s`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${hours}h ${remainingMinutes}m`;
}

export function formatTime(date: Date | string, format24h: boolean = true): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, format24h ? 'HH:mm' : 'h:mm a');
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy');
}

export function formatDateTime(date: Date | string, format24h: boolean = true): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, format24h ? 'd MMM, HH:mm' : 'd MMM, h:mm a');
}

export function isToday(date: Date | string): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date;
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

export function isYesterday(date: Date | string): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear()
  );
}

export function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) {
    return 'Good morning';
  } else if (hour < 17) {
    return 'Good afternoon';
  } else {
    return 'Good evening';
  }
}

export function getDayLabel(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;

  if (isToday(d)) {
    return 'Today';
  }

  if (isYesterday(d)) {
    return 'Yesterday';
  }

  return format(d, 'EEEE');
}

export function groupByDate(items: any[], dateField: string = 'timestamp'): Record<string, any[]> {
  const grouped: Record<string, any[]> = {};

  items.forEach((item) => {
    const date = format(parseISO(item[dateField]), 'yyyy-MM-dd');
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(item);
  });

  return grouped;
}
