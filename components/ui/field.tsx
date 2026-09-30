import { cn } from "@/lib/utils";

export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="u-label">
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      {children}
      {hint && !error ? (
        <p className="text-xs text-fg-muted">{hint}</p>
      ) : null}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const controlBase =
  "min-h-11 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-fg placeholder:text-fg-muted focus-visible:border-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus)] aria-[invalid=true]:border-danger disabled:opacity-40";

export function Input(props: React.ComponentProps<"input">) {
  return <input {...props} className={cn(controlBase, props.className)} />;
}

export function Textarea(props: React.ComponentProps<"textarea">) {
  return (
    <textarea
      {...props}
      className={cn(controlBase, "min-h-28 resize-y", props.className)}
    />
  );
}

export function Select(props: React.ComponentProps<"select">) {
  return <select {...props} className={cn(controlBase, "pe-8", props.className)} />;
}
