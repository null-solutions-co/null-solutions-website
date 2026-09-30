import { Typewriter } from "@/components/ui/typewriter";

/** Fixed star field (no randomness, so server and client render the same). */
const STARS = Array.from({ length: 70 }, (_, i) => {
  const a = Math.sin(i * 12.9898) * 43758.5453;
  const b = Math.sin(i * 78.233) * 12345.6789;
  const x = (a - Math.floor(a)) * 100;
  const y = (b - Math.floor(b)) * 100;
  return { x, y, r: i % 7 === 0 ? 1.6 : i % 3 === 0 ? 1.1 : 0.7, d: (i % 9) * 0.45 };
});

/**
 * The picture side of the client sign-in: deep space, a slow ∅ planet, and an
 * astronaut drifting in front of it, waving, tethered to the ring. Drawn in SVG
 * and moved with CSS only (globals.css `.astro-*`), so it's light on any
 * machine. A typewriter line sits at the bottom. Decorative: the form carries
 * the meaning. Reduced motion: everything holds still.
 */
export function SpaceScene({ quote, author }: { quote: string; author: string }) {
  return (
    <div className="relative h-full min-h-72 overflow-hidden bg-[#050505] text-[#fafafa]">
      {/* stars */}
      <svg aria-hidden="true" className="absolute inset-0 size-full" preserveAspectRatio="none">
        {STARS.map((s, i) => (
          <circle
            key={i}
            cx={`${s.x}%`}
            cy={`${s.y}%`}
            r={s.r}
            fill="#ffffff"
            className="astro-star"
            style={{ animationDelay: `${s.d}s` }}
          />
        ))}
      </svg>
      <span aria-hidden="true" className="astro-shoot absolute left-[10%] top-[18%] h-px w-24 bg-gradient-to-r from-transparent to-white" />

      {/* the ∅ planet and the astronaut */}
      <svg aria-hidden="true" viewBox="0 0 400 400" className="absolute left-1/2 top-[47%] w-[min(58%,250px)] -translate-x-1/2 -translate-y-1/2 md:top-[46%] md:w-[min(88%,560px)]" style={{ direction: "ltr" }}>
        <defs>
          <radialGradient id="astro-glow">
            <stop offset="0%" stopColor="#0d1b2a" stopOpacity="1" />
            <stop offset="100%" stopColor="#0d1b2a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="200" cy="200" r="190" fill="url(#astro-glow)" />
        <g className="astro-planet">
          <circle cx="200" cy="200" r="150" fill="none" stroke="#ffffff" strokeOpacity="0.16" strokeWidth="2" />
          <circle cx="200" cy="200" r="176" fill="none" stroke="#ffffff" strokeOpacity="0.08" strokeWidth="1" strokeDasharray="2 8" />
          <line x1="64" y1="336" x2="336" y2="64" stroke="#ffffff" strokeOpacity="0.16" strokeWidth="2" strokeLinecap="round" />
        </g>

        <g className="astro-float">
          {/* tether back to the ring */}
          <path className="astro-tether" d="M262 262 C 300 300, 320 318, 330 345" fill="none" stroke="#ffffff" strokeOpacity="0.45" strokeWidth="2" strokeDasharray="5 5" />

          <g transform="translate(90 70)">
            {/* backpack */}
            <rect x="62" y="96" width="96" height="86" rx="18" fill="#cfcfcf" />
            {/* legs and boots */}
            <path d="M92 172 L82 214" stroke="#f2f2f2" strokeWidth="26" strokeLinecap="round" />
            <path d="M130 172 L144 210" stroke="#f2f2f2" strokeWidth="26" strokeLinecap="round" />
            <path d="M81 218 L78 228" stroke="#bdbdbd" strokeWidth="27" strokeLinecap="round" />
            <path d="M145 214 L149 224" stroke="#bdbdbd" strokeWidth="27" strokeLinecap="round" />
            {/* body */}
            <rect x="70" y="102" width="82" height="82" rx="26" fill="#fafafa" />
            <path d="M74 168 H148" stroke="#dcdcdc" strokeWidth="4" />
            <rect x="93" y="124" width="36" height="24" rx="6" fill="#0d1b2a" />
            <circle className="astro-blink" cx="102" cy="136" r="3" fill="#ffffff" />
            <rect x="110" y="132" width="13" height="3" rx="1.5" fill="#8fa3ba" />
            <rect x="110" y="138" width="9" height="3" rx="1.5" fill="#8fa3ba" />
            {/* right arm, holding the tether */}
            <path d="M148 116 Q172 134 168 162" fill="none" stroke="#f2f2f2" strokeWidth="22" strokeLinecap="round" />
            <circle cx="169" cy="166" r="12" fill="#bdbdbd" />
            {/* left arm, waving */}
            <g className="astro-wave">
              <path d="M74 116 Q46 100 40 68" fill="none" stroke="#f2f2f2" strokeWidth="22" strokeLinecap="round" />
              <circle cx="39" cy="62" r="12" fill="#bdbdbd" />
            </g>
            {/* helmet */}
            <rect x="58" y="62" width="12" height="24" rx="5" fill="#cfcfcf" />
            <rect x="152" y="62" width="12" height="24" rx="5" fill="#cfcfcf" />
            <circle cx="111" cy="74" r="46" fill="#fafafa" stroke="#dcdcdc" strokeWidth="3" />
            <rect x="79" y="52" width="64" height="44" rx="22" fill="#0d1b2a" />
            <path d="M89 63 Q97 56 110 56" fill="none" stroke="#ffffff" strokeOpacity="0.75" strokeWidth="4" strokeLinecap="round" />
            <circle cx="133" cy="84" r="3" fill="#ffffff" fillOpacity="0.5" />
            <line x1="140" y1="36" x2="150" y2="18" stroke="#dcdcdc" strokeWidth="3" strokeLinecap="round" />
            <circle className="astro-blink" cx="151" cy="16" r="4.5" fill="#ffffff" />
          </g>
        </g>
      </svg>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t md:h-40 from-[#050505] to-transparent" />
      <blockquote className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-1 px-8 pb-5 text-center md:gap-2 md:pb-8">
        <p className="min-h-[1.75rem] text-base font-medium md:text-lg">
          “<Typewriter text={quote} speed={60} />”
        </p>
        <cite className="text-sm not-italic text-[#9a9a9a]">— {author}</cite>
      </blockquote>
    </div>
  );
}
