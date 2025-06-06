export function weekRange(week: string): { start: Date; end: Date } {
  const [y, w] = week.split('-W');
  const year = parseInt(y, 10);
  const weekNo = parseInt(w, 10);
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const day = jan4.getUTCDay() || 7;
  const monday = new Date(jan4.getTime() - (day - 1) * 86400000);
  const start = new Date(monday.getTime() + (weekNo - 1) * 7 * 86400000);
  const end = new Date(start.getTime() + 6 * 86400000);
  return { start, end };
}

export function weekString(date: Date): string {
  const jan4 = new Date(Date.UTC(date.getUTCFullYear(), 0, 4))
  const day = jan4.getUTCDay() || 7
  const monday = new Date(jan4.getTime() - (day - 1) * 86400000)
  const diff = date.getTime() - monday.getTime()
  const week = Math.floor(diff / (7 * 86400000)) + 1
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}
