import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

/**
 * Global 404 — for requests that don't resolve to a known locale segment.
 * Renders its own <html> because it sits outside app/[locale]/layout.tsx.
 */
export default function GlobalNotFound() {
  return (
    <html lang="en" dir="ltr">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          background: "#0a0a0a",
          color: "#fafafa",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ textAlign: "center", display: "grid", gap: 12, justifyItems: "center" }}>
          <Logo size={56} />
          <p style={{ letterSpacing: "0.16em", fontSize: 12, opacity: 0.7 }}>404</p>
          <p style={{ opacity: 0.7 }}>That page doesn&apos;t exist.</p>
          <Link href="/" style={{ color: "#fafafa", textDecoration: "underline" }}>
            Back to home
          </Link>
        </div>
      </body>
    </html>
  );
}
