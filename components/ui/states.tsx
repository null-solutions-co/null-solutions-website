import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/Logo";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-line/60 motion-reduce:animate-none",
        className,
      )}
    />
  );
}

export function CardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-6">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-4" />
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-line p-10 text-center">
      <Logo size={28} />
      <p className="text-base font-medium">{title}</p>
      {body ? <p className="max-w-sm text-sm text-fg-muted">{body}</p> : null}
      {action}
    </div>
  );
}

export function ErrorState({
  title,
  detail,
  onRetry,
  retryLabel = "Try again",
}: {
  title: string;
  detail?: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  return (
    <div className="flex flex-col items-start gap-2 rounded-lg border border-[color-mix(in_srgb,var(--danger)_40%,transparent)] bg-surface p-6">
      <p className="font-medium text-danger">{title}</p>
      {detail ? <p className="text-sm text-fg-muted">{detail}</p> : null}
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 rounded-md border border-line px-3 py-1.5 font-mono text-sm hover:bg-ground"
        >
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
}
