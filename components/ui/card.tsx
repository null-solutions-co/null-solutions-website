import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-lg border border-line bg-surface p-6",
        className,
      )}
      {...props}
    />
  );
}
