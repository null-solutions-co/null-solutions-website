import type { Money } from "@/lib/api/schemas";

const TZ = "Asia/Amman";

export function formatMoney(m: Money, locale: string): string {
  const n = Number(m.amount);
  const value = new Intl.NumberFormat(locale === "ar" ? "ar-JO" : "en-JO", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(Number.isFinite(n) ? n : 0);
  return locale === "ar" ? `${value} د.أ` : `JOD ${value}`;
}

export function formatDate(iso: string | null, locale: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-JO" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: TZ,
  }).format(d);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
