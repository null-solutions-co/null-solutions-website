import { ChevronLeft, Phone, MessageCircle, Share2, Star, ShieldCheck } from "lucide-react";

/** A small top-down car for the map. */
function Car({ x, y, r, c = "#1c1c1f" }: { x: number; y: number; r: number; c?: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r})`}>
      <rect x="-6" y="-11" width="12" height="22" rx="4" fill={c} />
      <rect x="-4.5" y="-6" width="9" height="5" rx="1.5" fill="#9fb4c9" />
      <rect x="-4.5" y="4" width="9" height="3.5" rx="1.2" fill="#9fb4c9" />
    </g>
  );
}

/** A ride-hailing app mid-booking over a map of west Amman. */
export function RidePhone() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#eef0f2] text-[#111]" style={{ fontFamily: "var(--font-sans)" }}>
      <svg viewBox="0 0 390 600" className="absolute left-0 top-0 h-[600px] w-[390px]" aria-hidden="true">
        <rect width="390" height="600" fill="#eceef1" />
        {/* parks and blocks */}
        <path d="M250 60 q60 -10 110 30 v90 q-60 20 -120 -10 Z" fill="#d4e8cf" />
        <path d="M20 420 q50 -30 110 0 v80 h-110 Z" fill="#d4e8cf" />
        {Array.from({ length: 34 }, (_, i) => {
          const x = (i * 97) % 380;
          const y = ((i * 53) % 560) + 10;
          return <rect key={i} x={x} y={y} width={22 + (i % 3) * 8} height={16 + (i % 4) * 6} rx="3" fill="#e2e5e9" />;
        })}
        {/* major roads */}
        <g stroke="#ffffff" strokeLinecap="round" fill="none">
          <path d="M-10 140 C 120 150, 200 110, 400 130" strokeWidth="16" />
          <path d="M-10 330 C 110 320, 250 360, 400 340" strokeWidth="18" />
          <path d="M90 -10 C 110 150, 70 330, 120 610" strokeWidth="14" />
          <path d="M300 -10 C 280 180, 330 420, 290 610" strokeWidth="14" />
          <path d="M-10 520 L 400 470" strokeWidth="10" />
          <path d="M160 -10 L 200 610" strokeWidth="7" />
        </g>
        <g stroke="#d7dbe0" strokeWidth="1" fill="none">
          <path d="M-10 140 C 120 150, 200 110, 400 130" />
          <path d="M-10 330 C 110 320, 250 360, 400 340" />
        </g>
        {/* 7th circle */}
        <circle cx="198" cy="336" r="26" fill="none" stroke="#ffffff" strokeWidth="12" />
        <circle cx="198" cy="336" r="15" fill="#d4e8cf" />
        {/* labels */}
        <g fontSize="9" fontWeight="600" fill="#8a929c" letterSpacing="1.2">
          <text x="24" y="100">SWEIFIEH</text>
          <text x="230" y="220">UM UTHAINA</text>
          <text x="30" y="270">ABDOUN</text>
          <text x="236" y="470">SHMEISANI</text>
        </g>
        <text x="228" y="318" fontSize="8.5" fill="#6d747d">7th Circle</text>
        {/* route */}
        <path d="M70 200 C 100 250, 150 300, 190 312 S 260 300, 300 250 S 330 150, 318 88" fill="none" stroke="#1a73e8" strokeOpacity="0.25" strokeWidth="11" strokeLinecap="round" />
        <path d="M70 200 C 100 250, 150 300, 190 312 S 260 300, 300 250 S 330 150, 318 88" fill="none" stroke="#1a73e8" strokeWidth="5" strokeLinecap="round" />
        <Car x={118} y={262} r={-40} />
        <Car x={220} y={150} r={80} c="#6b7280" />
        <Car x={140} y={420} r={10} c="#6b7280" />
        {/* pickup + drop-off */}
        <circle cx="70" cy="200" r="11" fill="#111" /><circle cx="70" cy="200" r="4.5" fill="#fff" />
        <rect x="308" y="78" width="20" height="20" rx="4" fill="#111" /><rect x="314.5" y="84.5" width="7" height="7" fill="#fff" />
        <g>
          <rect x="222" y="54" width="112" height="24" rx="12" fill="#111" />
          <text x="278" y="70" textAnchor="middle" fontSize="10" fontWeight="600" fill="#fff">Abdali Blvd · 14 min</text>
        </g>
      </svg>

      <div className="absolute inset-x-0 top-0 flex h-12 items-end justify-between px-7 pb-1 text-[14px] font-semibold">
        <span>9:41</span><span className="text-[11px]">5G ▮▮▮</span>
      </div>
      <div className="absolute left-4 top-16 flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-white shadow-md"><ChevronLeft className="size-5" /></span>
      </div>

      <section className="absolute inset-x-0 bottom-0 h-[330px] rounded-t-[26px] bg-white px-5 pt-2.5 shadow-[0_-10px_30px_rgba(0,0,0,0.12)]">
        <span className="mx-auto block h-1 w-10 rounded-full bg-black/15" />
        <div className="mt-3 flex items-baseline justify-between">
          <p className="text-[20px] font-semibold">Arriving in 3 min</p>
          <p className="text-[13px] text-black/45">Pickup 9:44</p>
        </div>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-black/[0.07]"><div className="h-full w-2/3 rounded-full bg-[#1a73e8]" /></div>

        <div className="mt-4 flex items-center gap-3">
          <span className="relative flex size-12 items-center justify-center rounded-full bg-[#2b3440] text-[15px] font-semibold text-white">
            KS<span className="absolute -bottom-1 -right-1 flex items-center gap-0.5 rounded-full bg-white px-1 text-[9px] font-semibold text-black shadow"><Star className="size-2.5 fill-black" />4.9</span>
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold">Khaled</p>
            <p className="text-[12.5px] text-black/50">White Hyundai Elantra</p>
          </div>
          <span className="rounded-lg border-2 border-black/80 px-2 py-0.5 font-mono text-[13px] font-semibold tracking-wider">12-34567</span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {[["Call", Phone], ["Message", MessageCircle], ["Share trip", Share2]].map(([l, I]) => {
            const Icon = I as typeof Phone;
            return (
              <span key={l as string} className="flex flex-col items-center gap-1 rounded-2xl bg-[#f2f3f5] py-2.5 text-[11.5px] font-medium">
                <Icon className="size-4" />{l as string}
              </span>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-black/[0.06] pt-3.5 text-[13px]">
          <span className="flex items-center gap-2"><ShieldCheck className="size-4 text-[#1a73e8]" /> Comfort · Cash</span>
          <span className="text-[16px] font-semibold tabular-nums">JOD 3.20</span>
        </div>
      </section>
    </div>
  );
}
