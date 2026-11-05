export type DatedLeg = {
  date?: string;
  time?: string;
  arrDate?: string;
  arrTime?: string;
};

function two(n: number): string {
  return (n < 10 ? "0" : "") + n;
}

export function isFuture(r: DatedLeg | null | undefined): boolean {
  if (!r) return false;
  const end = String(r.arrDate || r.date || "").trim();
  if (!end) return false;
  const day = end.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    const parsed = new Date(end);
    return !isNaN(parsed.getTime()) && parsed.getTime() > Date.now();
  }
  const now = new Date();
  const today = now.getFullYear() + "-" + two(now.getMonth() + 1) + "-" + two(now.getDate());
  if (day > today) return true;
  if (day < today) return false;
  let t = String(r.arrTime || r.time || "23:59").slice(0, 5);
  if (!/^\d{2}:\d{2}$/.test(t)) t = "23:59";
  return t > two(now.getHours()) + ":" + two(now.getMinutes());
}

export function datedPast(r: DatedLeg | null | undefined): boolean {
  return !!(r && (r.arrDate || r.date)) && !isFuture(r);
}
