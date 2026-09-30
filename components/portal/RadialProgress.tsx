import { cn } from "@/lib/utils";

/**
 * The signature geometry: the circle is the project, the
 * amber arc sweeping to close it is the same gesture as the logo slash —
 * 3px stroke, round cap, starts at -45deg.
 */
export function RadialProgress({
  value,
  label,
  size = 132,
  className,
}: {
  value: number;
  label: string;
  size?: number;
  className?: string;
}) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn("grid place-items-center rounded-full", className)}
      style={{
        width: size,
        height: size,
        background: `conic-gradient(from -45deg, var(--signal) ${v}%, var(--line) 0)`,
      }}
      role="img"
      aria-label={`${v}% ${label}`}
    >
      <div
        className="grid place-items-center rounded-full bg-surface text-center"
        style={{ width: size - 24, height: size - 24 }}
      >
        <span className="u-data text-xl font-semibold">{v}%</span>
        <span className="u-label">{label}</span>
      </div>
    </div>
  );
}
