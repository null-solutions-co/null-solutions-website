import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * The company logo (public/brand/logo.png — the "NULL SOLUTIONS" lock-up).
 * The artwork is black; on a dark surface it is inverted to white via the
 * `[data-theme="dark"] [data-brand-logo]` rule in globals.css.
 */
export function BrandLogo({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/brand/logo.png"
      alt="NULL Solutions"
      width={707}
      height={220}
      priority={priority}
      data-brand-logo=""
      className={cn("h-6 w-auto", className)}
    />
  );
}
