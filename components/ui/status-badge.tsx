import { cn } from "@/lib/utils";

type Tone = "ok" | "warn" | "danger" | "neutral";

const TONES: Record<Tone, string> = {
  ok: "text-ok border-[color-mix(in_srgb,var(--ok)_40%,transparent)]",
  warn: "text-signal-ink border-[color-mix(in_srgb,var(--signal)_55%,transparent)] bg-signal-wash",
  danger: "text-danger border-[color-mix(in_srgb,var(--danger)_40%,transparent)]",
  neutral: "text-fg-muted border-line",
};

export function StatusBadge({
  tone,
  children,
}: {
  tone: Tone;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 font-mono text-xs",
        TONES[tone],
      )}
    >
      <span
        aria-hidden
        className="size-1.5 rounded-full bg-current"
      />
      {children}
    </span>
  );
}

const INVOICE_TONE: Record<string, Tone> = {
  paid: "ok",
  sent: "neutral",
  partially_paid: "warn",
  overdue: "danger",
  void: "neutral",
};
export const invoiceTone = (status: string): Tone => INVOICE_TONE[status] ?? "neutral";
