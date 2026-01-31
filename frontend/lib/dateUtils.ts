import { format, subDays, subMonths, subYears } from 'date-fns';
import type { DateRange } from './types';

/**
 * Get date range from filter selection
 */
export function getDateRangeFromFilter(range: DateRange): {
  startDate: string;
  endDate: string;
} {
  const endDate = new Date();
  let startDate = new Date();

  switch (range) {
    case '7d':
      startDate = subDays(endDate, 7);
      break;
    case '1m':
      startDate = subMonths(endDate, 1);
      break;
    case '3m':
      startDate = subMonths(endDate, 3);
      break;
    case '6m':
      startDate = subMonths(endDate, 6);
      break;
    case '9m':
      startDate = subMonths(endDate, 9);
      break;
    case '1y':
      startDate = subYears(endDate, 1);
      break;
    case 'all':
      return { startDate: '', endDate: '' };
  }

  return {
    startDate: format(startDate, 'yyyy-MM-dd'),
    endDate: format(endDate, 'yyyy-MM-dd'),
  };
}

/**
 * Format date for display
 */
export function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return format(date, 'dd MMM yyyy');
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}
