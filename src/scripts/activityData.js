export function buildLastNDaysData(sessions, n = 10) {
  const days = Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const labels = days.map((d) =>
    d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })
  );

  const data = days.map((d) => {
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    const minutes = sessions
      .filter((s) => {
        const t = new Date(s.start_time);
        return t >= d && t < next;
      })
      .reduce((sum, s) => sum + s.duration_minutes, 0);
    return Math.max(0, minutes);
  });

  return { labels, data };
}

export function buildMonthlyData(monthlyActivity) {
  const labels = monthlyActivity.map(({ month }) => {
    const [year, m] = month.split('-');
    return new Date(year, m - 1).toLocaleString(undefined, { month: 'short', year: '2-digit' });
  });
  const data = monthlyActivity.map(({ minutes }) => Math.max(0, minutes || 0));
  return { labels, data };
}
