import { Search, Bell, Star, TrendingUp } from "lucide-react";

/** Deterministic price walk so the chart looks the same on server and client. */
function series(n: number, start: number, seed: number) {
  const out: { o: number; c: number; h: number; l: number; v: number }[] = [];
  let p = start;
  for (let i = 0; i < n; i++) {
    const drift = Math.sin(i * 0.37 + seed) * 0.045 + Math.cos(i * 0.11 + seed * 2) * 0.03 + 0.006;
    const o = p;
    const c = +(p + drift).toFixed(3);
    const h = Math.max(o, c) + Math.abs(Math.sin(i * 1.7 + seed)) * 0.03;
    const l = Math.min(o, c) - Math.abs(Math.cos(i * 1.3 + seed)) * 0.03;
    out.push({ o, c, h, l, v: 40 + Math.abs(Math.sin(i * 0.9 + seed)) * 60 });
    p = c;
  }
  return out;
}

const CANDLES = series(64, 4.1, 1.3);

const WATCH = [
  { s: "HJZB", n: "Hijaz Bank", p: "4.82", c: "+1.47", up: true },
  { s: "LVTC", n: "Levant Telecom", p: "2.36", c: "+0.85", up: true },
  { s: "DSMN", n: "Dead Sea Minerals", p: "11.40", c: "−0.61", up: false },
  { s: "AMCE", n: "Amman Cement", p: "0.94", c: "+2.17", up: true },
  { s: "AQPT", n: "Aqaba Ports", p: "3.05", c: "−0.33", up: false },
  { s: "PTRH", n: "Petra Hotels", p: "1.72", c: "+0.58", up: true },
  { s: "MDBF", n: "Madaba Foods", p: "0.61", c: "−1.61", up: false },
];

const NEWS = [
  ["09:42", "Hijaz Bank H1 profit up 12% on lending growth"],
  ["09:15", "Aqaba Ports volumes steady as Red Sea routes normalise"],
  ["08:50", "Levant Telecom expands fibre to 40,000 more homes"],
  ["Yesterday", "Index closes higher for a third straight session"],
];

/** A brokerage web terminal: watchlist, candlestick chart, depth, news. */
export function MarketsWeb() {
  const W = 760;
  const H = 330;
  const hi = Math.max(...CANDLES.map((c) => c.h));
  const lo = Math.min(...CANDLES.map((c) => c.l));
  const y = (v: number) => H - ((v - lo) / (hi - lo)) * (H - 10) - 5;
  const step = W / CANDLES.length;
  const last = CANDLES[CANDLES.length - 1];

  return (
    <div className="flex h-full w-full flex-col bg-[#0b0e13] text-[#d9dee7]" style={{ fontFamily: "var(--font-sans)" }}>
      <header className="flex h-14 shrink-0 items-center gap-6 border-b border-white/[0.06] px-6">
        <span className="flex items-center gap-2 text-[17px] font-semibold text-white"><TrendingUp className="size-5 text-[#22c55e]" /> Bourse<span className="text-[#22c55e]">+</span></span>
        <span className="flex w-[280px] items-center gap-2 rounded-lg bg-white/[0.05] px-3 py-2 text-[13px] text-white/40"><Search className="size-4" /> Search symbol or company</span>
        <div className="flex gap-6 text-[12.5px]">
          <span>General Index <b className="text-white">2,512.38</b> <span className="text-[#22c55e]">+0.42%</span></span>
          <span>Top 20 <b className="text-white">1,318.07</b> <span className="text-[#22c55e]">+0.31%</span></span>
          <span>USD/JOD <b className="text-white">0.7090</b></span>
          <span>Brent <b className="text-white">81.40</b> <span className="text-[#ef4444]">−0.80%</span></span>
        </div>
        <span className="ml-auto flex items-center gap-4"><Bell className="size-[18px] text-white/50" /><span className="flex size-8 items-center justify-center rounded-full bg-[#262626] text-[12px] font-semibold text-white">OM</span></span>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[300px_1fr_300px]">
        <aside className="border-r border-white/[0.06] px-4 py-4">
          <p className="flex items-center justify-between text-[13px] font-semibold text-white">Watchlist <span className="text-[12px] font-normal text-white/40">7</span></p>
          <ul className="mt-3 flex flex-col">
            {WATCH.map((w, i) => (
              <li key={w.s} className={`flex items-center gap-3 rounded-lg px-2.5 py-2.5 ${i === 0 ? "bg-white/[0.06]" : ""}`}>
                <Star className={`size-3.5 ${i < 3 ? "fill-[#f5b73b] text-[#f5b73b]" : "text-white/25"}`} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[13.5px] font-semibold text-white">{w.s}</span>
                  <span className="block truncate text-[11.5px] text-white/40">{w.n}</span>
                </span>
                <span className="text-right">
                  <span className="block text-[13.5px] tabular-nums text-white">{w.p}</span>
                  <span className={`text-[11.5px] tabular-nums ${w.up ? "text-[#22c55e]" : "text-[#ef4444]"}`}>{w.c}%</span>
                </span>
              </li>
            ))}
          </ul>
        </aside>

        <section className="flex min-w-0 flex-col px-6 py-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[13px] text-white/45">HJZB · Hijaz Bank · Banking</p>
              <p className="mt-1 text-[32px] font-semibold tabular-nums text-white">JOD {last.c.toFixed(2)} <span className="text-[16px] text-[#22c55e]">+0.07 (+1.47%)</span></p>
            </div>
            <div className="flex rounded-lg bg-white/[0.05] p-1 text-[12px]">
              {["1D", "1W", "1M", "3M", "1Y", "All"].map((t) => (
                <span key={t} className={`rounded-md px-3 py-1 ${t === "3M" ? "bg-white/15 text-white" : "text-white/50"}`}>{t}</span>
              ))}
            </div>
          </div>
          <svg viewBox={`0 0 ${W} ${H + 90}`} className="mt-4 w-full flex-1">
            {[0.25, 0.5, 0.75].map((g) => <line key={g} x1="0" x2={W} y1={H * g} y2={H * g} stroke="rgba(255,255,255,0.05)" />)}
            {CANDLES.map((c, i) => {
              const up = c.c >= c.o;
              const col = up ? "#22c55e" : "#ef4444";
              const cx = i * step + step / 2;
              return (
                <g key={i}>
                  <line x1={cx} x2={cx} y1={y(c.h)} y2={y(c.l)} stroke={col} strokeWidth="1" />
                  <rect x={cx - step * 0.32} y={y(Math.max(c.o, c.c))} width={step * 0.64} height={Math.max(1.5, Math.abs(y(c.o) - y(c.c)))} fill={col} />
                  <rect x={cx - step * 0.32} y={H + 90 - c.v * 0.7} width={step * 0.64} height={c.v * 0.7} fill={col} opacity="0.25" />
                </g>
              );
            })}
            <line x1="0" x2={W} y1={y(last.c)} y2={y(last.c)} stroke="#22c55e" strokeDasharray="4 4" strokeOpacity="0.6" />
          </svg>
          <div className="mt-3 grid grid-cols-4 gap-3 text-[12px]">
            {[["Open", "4.75"], ["Day range", "4.71 – 4.86"], ["Volume", "1.24M"], ["P/E", "11.8"]].map(([k, v]) => (
              <div key={k} className="rounded-lg bg-white/[0.04] px-3 py-2"><p className="text-white/40">{k}</p><p className="mt-0.5 text-[14px] tabular-nums text-white">{v}</p></div>
            ))}
          </div>
        </section>

        <aside className="flex flex-col border-l border-white/[0.06] px-4 py-4">
          <p className="text-[13px] font-semibold text-white">Order book</p>
          <div className="mt-2 flex flex-col gap-1 text-[12px] tabular-nums">
            {[["4.86", 38], ["4.85", 62], ["4.84", 45], ["4.83", 80]].map(([p, d]) => (
              <div key={p as string} className="relative flex justify-between px-2 py-1"><span className="absolute inset-y-0 right-0 bg-[#ef4444]/15" style={{ width: `${d}%` }} /><span className="relative text-[#ef4444]">{p}</span><span className="relative text-white/60">{(d as number) * 120}</span></div>
            ))}
            <p className="py-1.5 text-center text-[14px] font-semibold text-white">4.82</p>
            {[["4.81", 70], ["4.80", 92], ["4.79", 51], ["4.78", 33]].map(([p, d]) => (
              <div key={p as string} className="relative flex justify-between px-2 py-1"><span className="absolute inset-y-0 right-0 bg-[#22c55e]/15" style={{ width: `${d}%` }} /><span className="relative text-[#22c55e]">{p}</span><span className="relative text-white/60">{(d as number) * 140}</span></div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <span className="rounded-lg bg-[#22c55e] py-2.5 text-center text-[13px] font-semibold text-black">Buy</span>
            <span className="rounded-lg bg-[#ef4444] py-2.5 text-center text-[13px] font-semibold text-white">Sell</span>
          </div>
          <p className="mt-5 text-[13px] font-semibold text-white">News</p>
          <ul className="mt-2 flex flex-col gap-3">
            {NEWS.map(([t, h]) => (
              <li key={h} className="text-[12.5px] leading-snug"><span className="block text-[11px] text-white/35">{t}</span><span className="text-white/80">{h}</span></li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
