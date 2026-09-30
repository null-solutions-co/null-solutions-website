import { cn } from "@/lib/utils";

/**
 * The NULL mark as a lock: the ring draws in on load, and the slash follows
 * `progress` (0–1) — on the client sign-in, how much of the access code is in.
 * `state` adds the finishing touches: a small click when complete, a shake on
 * a wrong code.
 */
export function KeyMark({
  progress,
  state = "idle",
  className,
}: {
  progress: number;
  state?: "idle" | "complete" | "error";
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      data-state={state}
      className={cn("key-mark", className)}
    >
      <circle className="key-mark__ring" cx="50" cy="50" r="33" pathLength={1} />
      <line
        className="key-mark__slash"
        x1="12"
        y1="88"
        x2="88"
        y2="12"
        pathLength={1}
        style={{ strokeDashoffset: 1 - Math.min(Math.max(progress, 0), 1) }}
      />
    </svg>
  );
}
