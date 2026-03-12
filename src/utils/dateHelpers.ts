/**
 * Date Formatting Utilities
 * DRY refactoring for consistent date handling across the app
 */

/**
 * Format ISO date string to human-readable format
 *
 * @param isoDate - ISO 8601 date string (e.g., "2025-10-23T14:30:00")
 * @param format - Output format ('short' | 'long' | 'relative')
 * @returns Formatted date string
 *
 * Examples:
 * - short: "Oct 23, 2025"
 * - long: "October 23, 2025 at 2:30 PM"
 * - relative: "2 days ago"
 */
export function formatDate(
  isoDate: string | null | undefined,
  format: 'short' | 'long' | 'relative' = 'short'
): string {
  if (!isoDate) return 'Never';

  const date = new Date(isoDate);

  // Check if valid date
  if (isNaN(date.getTime())) return 'Invalid date';

  switch (format) {
    case 'short':
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

    case 'long':
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

    case 'relative':
      return formatRelativeDate(date);

    default:
      return date.toLocaleDateString();
  }
}

/**
 * Format date as relative time (e.g., "2 days ago", "3 hours ago")
 */
export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSeconds < 60) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
  if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
}

/**
 * Calculate days since a date
 *
 * Used for audit staleness calculations
 */
export function daysSince(isoDate: string | null | undefined): number | null {
  if (!isoDate) return null;

  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return null;

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Check if a date is within N days from now
 *
 * Used for "due soon" calculations
 */
export function isWithinDays(isoDate: string | null | undefined, days: number): boolean {
  const daysSinceDate = daysSince(isoDate);
  return daysSinceDate !== null && daysSinceDate <= days;
}

/**
 * Format duration in seconds to human-readable string
 *
 * Examples: "2.5s", "1m 30s", "1h 5m"
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(1)}s`;

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

/**
 * Get today's date as ISO string (YYYY-MM-DD)
 */
export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Check if two dates are on the same day
 */
export function isSameDay(date1: string | Date, date2: string | Date): boolean {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;

  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}
