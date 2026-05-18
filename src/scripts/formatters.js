export const formatHours = (hours) => `${(hours || 0).toFixed(1)}h`;

export const formatMinutes = (minutes) => `${minutes || 0}m`;

export const formatDateTime = (iso) =>
  new Date(iso).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

export function formatRelativeDay(iso) {
  if (!iso) return 'Never';

  const date = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const day = new Date(date);
  day.setHours(0, 0, 0, 0);

  const dayDiff = Math.round((today - day) / 86400000);
  if (dayDiff === 0) return 'Today';
  if (dayDiff === 1) return 'Yesterday';

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  });
}
