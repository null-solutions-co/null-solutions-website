import { Reveal } from "@/components/marketing/Reveal";
import { COMPANY } from "@/lib/company";

/** Latin text split into letters that roll up to a copy of themselves on hover. */
function Roll({ text }: { text: string }) {
  return (
    <span className="ft-roll" aria-label={text} dir="ltr">
      {Array.from(text).map((c, i) => (
        <span key={i} aria-hidden="true" className="ft-ch" style={{ "--i": i } as React.CSSProperties}>
          <span>{c}</span>
          <span>{c}</span>
        </span>
      ))}
    </span>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="size-7">
      <rect className="ab-draw" pathLength={1} x="3" y="3" width="18" height="18" rx="5.5" />
      <circle className="ab-draw" pathLength={1} cx="12" cy="12" r="4.2" style={{ animationDelay: "0.35s" }} />
      <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none" className="ft-dot" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="size-7">
      <rect className="ab-draw" pathLength={1} x="2.8" y="5" width="18.4" height="14" rx="3" />
      <path className="ab-draw" pathLength={1} d="M3.5 6.5 12 13l8.5-6.5" style={{ animationDelay: "0.35s" }} />
    </svg>
  );
}

/**
 * Footer · where to find us: Instagram and email as two big rows. On arrival
 * each row wipes in, its icon draws itself and the handle's letters rise one
 * after another; on hover the letters roll over, the icon tile fills (the
 * Instagram gradient, or white for mail) and the arrow turns.
 */
export function FooterContact({ follow, instagram, email }: { follow: string; instagram: string; email: string }) {
  const rows = [
    {
      href: COMPANY.instagram.href,
      label: instagram,
      text: `@${COMPANY.instagram.handle}`,
      Icon: InstagramIcon,
      tile: "ft-tile-ig",
      external: true,
    },
    { href: `mailto:${COMPANY.email}`, label: email, text: COMPANY.email, Icon: MailIcon, tile: "ft-tile-mail", external: false },
  ];

  return (
    <div className="flex flex-col">
      <p className="mb-6 font-mono text-xs uppercase tracking-[0.24em] text-fg-muted">
        <span className="text-signal-ink">/</span>&nbsp; {follow}
      </p>
      {rows.map((r, i) => (
        <Reveal key={r.href} delay={i * 120}>
          <a
            href={r.href}
            {...(r.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="ft-row group flex items-center gap-5 border-t border-line py-7 md:gap-8 md:py-9"
          >
            <span className={`ft-tile ${r.tile} relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-line text-fg sm:size-14 md:size-16`}>
              <span className="relative">
                <r.Icon />
              </span>
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-fg-muted">{r.label}</span>
              <span className="text-[clamp(1.1rem,3.6vw,3.2rem)] font-medium leading-none tracking-tight">
                <Roll text={r.text} />
              </span>
            </span>
            <span className="hidden size-11 shrink-0 items-center sm:flex justify-center rounded-full border border-line transition-[background-color,color,transform] duration-500 group-hover:rotate-[-45deg] group-hover:bg-white group-hover:text-black rtl:group-hover:rotate-[225deg] md:size-14">
              <span className="rtl:rotate-180">→</span>
            </span>
          </a>
        </Reveal>
      ))}
    </div>
  );
}
