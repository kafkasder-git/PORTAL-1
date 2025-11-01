/**
 * Premium Color System for Meeting Statuses
 * Centralized color constants for consistent theming across the application
 */

export const MEETING_STATUS_COLORS = {
  scheduled: {
    badge: 'default',
    calendar: 'bg-info-light text-info-dark',
    semantic: 'info'
  },
  ongoing: {
    badge: 'secondary',
    calendar: 'bg-warning-light text-warning-dark',
    semantic: 'warning'
  },
  completed: {
    badge: 'outline',
    calendar: 'bg-success-light text-success-dark',
    semantic: 'success'
  },
  cancelled: {
    badge: 'destructive',
    calendar: 'bg-error-light text-error-dark',
    semantic: 'error'
  }
} as const;

export type MeetingStatus = keyof typeof MEETING_STATUS_COLORS;

/**
 * Get badge variant for meeting status
 */
export function getMeetingStatusBadgeVariant(status: MeetingStatus): string {
  return MEETING_STATUS_COLORS[status].badge;
}

/**
 * Get calendar styling classes for meeting status
 */
export function getMeetingStatusCalendarClasses(status: MeetingStatus): string {
  return MEETING_STATUS_COLORS[status].calendar;
}

/**
 * Get semantic color name for meeting status
 */
export function getMeetingStatusSemanticColor(status: MeetingStatus): string {
  return MEETING_STATUS_COLORS[status].semantic;
}
