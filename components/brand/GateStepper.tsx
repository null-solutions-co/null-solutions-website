import { cn } from "@/lib/utils";

type Status = "done" | "in_progress" | "not_started" | "blocked";

export type GateNode = { id: string; status: Status };

/**
 * The G0–G9 delivery stepper. Horizontal from md up, vertical below.
 * Used on the marketing site as method proof and in the portal as live status.
 */
export function GateStepper({
  gates,
  className,
}: {
  gates: GateNode[];
  className?: string;
}) {
  return (
    <ol
      className={cn(
        "flex flex-col gap-4 md:flex-row md:gap-0",
        className,
      )}
      aria-label="Delivery gates G0 to G9"
    >
      {gates.map((g, i) => {
        const filled = g.status === "done";
        const current = g.status === "in_progress";
        return (
          <li
            key={g.id}
            className="relative flex items-center gap-3 md:flex-1 md:flex-col md:gap-2 md:text-center"
          >
            {/* connector (skip before the first) */}
            {i > 0 && (
              <span
                aria-hidden
                className={cn(
                  "absolute hidden h-px w-full md:block",
                  "md:top-[7px] md:-start-1/2",
                  filled || current ? "bg-fg" : "bg-line",
                )}
              />
            )}
            <span
              aria-hidden
              className={cn(
                "z-10 size-3.5 shrink-0 rounded-full border-2 bg-ground",
                filled && "border-fg bg-fg",
                current && "border-signal shadow-[0_0_0_4px_var(--signal-wash)]",
                !filled && !current && "border-line",
              )}
            />
            <span
              className={cn(
                "u-data text-xs",
                filled || current ? "text-fg" : "text-fg-muted",
              )}
            >
              {g.id}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
