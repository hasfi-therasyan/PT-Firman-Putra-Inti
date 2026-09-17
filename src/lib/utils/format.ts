/**
 * Format integer rupiah to Indonesian display string.
 * e.g. 50000000 → "Rp 50.000.000"
 */
export function formatRupiah(amount: number): string {
  return `Rp ${Math.abs(amount)
    .toLocaleString("id-ID")
    .replace(/,00$/, "")}${amount < 0 ? " (-)" : ""}`;
}

/**
 * Format date in Indonesian style.
 * e.g. new Date("2026-09-16") → "16 Sep 2026"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
}

/**
 * Format relative time in Indonesian.
 * e.g. "3 jam yang lalu", "kemarin"
 */
export function relativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Baru saja";
  if (diffMin < 60) return `${diffMin} menit yang lalu`;
  if (diffHour < 24) return `${diffHour} jam yang lalu`;
  if (diffDay === 1) return "Kemarin";
  if (diffDay < 7) return `${diffDay} hari yang lalu`;
  return formatDate(d);
}
