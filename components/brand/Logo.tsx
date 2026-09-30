import { cn } from "@/lib/utils";

type LogoProps = {
  /** Draw the ring, then stroke the slash, once on mount (public hero only). Ignored under prefers-reduced-motion. */
  resolve?: boolean;
  /** Pixel height of the mark. */
  size?: number;
  className?: string;
  title?: string;
};

/**
 * The NULL mark — a circle crossed by a slash that overshoots it on both ends
 * (the empty-set glyph, ∅), matching the company logo. The slash is the value
 * being written.
 */
export function Logo({ resolve = false, size = 28, className, title = "NULL" }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      role="img"
      aria-label={title}
      className={cn("ns-mark", resolve && "ns-mark--resolve", className)}
    >
      <circle
        className="ns-mark__ring"
        cx="22"
        cy="22"
        r="14.5"
        stroke="currentColor"
        strokeWidth="2.6"
      />
      <line
        className="ns-mark__slash"
        x1="3.5"
        y1="40.5"
        x2="40.5"
        y2="3.5"
        stroke="var(--signal-ink)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
