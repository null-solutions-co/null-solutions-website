import { TrendingUp, Database, Calendar } from "lucide-react";
import { defineDemo, on, type ViewProps } from "./kit";

type Metric = "revenue" | "orders" | "margin";
type Range = "6m" | "12m";

const DATA: Record<Metric, { label: string; unit: (v: number) => string; total: string; delta: string; values: number[] }> = {
  revenue: { label: "Net revenue", unit: (v) => `${v.toFixed(0)}k JOD`, total: "4.82M JOD", delta: "+11.4%", values: [312, 298, 341, 356, 332, 389, 402, 377, 418, 436, 451, 488] },
  orders: { label: "Orders", unit: (v) => `${v.toFixed(0)}`, total: "61,204", delta: "+7.9%", values: [4210, 4020, 4480, 4610, 4390, 4980, 5120, 4870, 5300, 5410, 5620, 6010] },
  margin: { label: "Gross margin", unit: (v) => `${v.toFixed(1)}%`, total: "38.2%", delta: "+0.9 pt", values: [36.1, 35.8, 36.9, 37.2, 36.4, 37.8, 38.0, 37.4, 38.3, 38.6, 38.9, 39.4] },
};
const MONTHS = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];

const SOURCES = [
  { k: "In store (POS)", v: 42, c: "#8b7cf6" },
  { k: "Web checkout", v: 28, c: "#2dd4bf" },
  { k: "B2B / ERP", v: 19, c: "#f59e0b" },
  { k: "Call centre", v: 11, c: "#6b6b6b" },
];

type S = { metric: Metric; range: Range; point: number | null };
type A = { t: "metric"; v: Metric } | { t: "range"; v: Range } | { t: "point"; i: number };

const W = 640;
const H = 220;

/** Each slice's start, as a running total of the slices before it. */
const SLICES = SOURCES.map((x, i) => ({
  ...x,
  start: SOURCES.slice(0, i).reduce((sum, y) => sum + y.v, 0),
}));

function Donut() {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 140 140" className="size-[132px] shrink-0">
      {SLICES.map((x) => (
        <circle key={x.k} cx="70" cy="70" r={r} fill="none" stroke={x.c} strokeWidth="16"
          strokeDasharray={`${(c * x.v) / 100 - 2} ${c}`} strokeDashoffset={(-c * x.start) / 100} transform="rotate(-90 70 70)" />
      ))}
      <text x="70" y="66" textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.5)">sources</text>
      <text x="70" y="84" textAnchor="middle" fontSize="18" fontWeight="600" fill="#fff">4</text>
    </svg>
  );
}

function View({ s, act }: ViewProps<S, A>) {
  const d = DATA[s.metric];
  const vals = s.range === "6m" ? d.values.slice(6) : d.values;
  const labels = s.range === "6m" ? MONTHS.slice(6) : MONTHS;
  const max = Math.max(...vals) * 1.04;
  const min = Math.min(...vals) * 0.9;
  const pts = vals.map((v, i) => [(i / (vals.length - 1)) * W, H - ((v - min) / (max - min)) * H] as const);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${W},${H} L0,${H} Z`;
  const sel = s.point !== null && s.point < pts.length ? s.point : null;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#0c0b14] px-9 py-7 text-[#ecebf5]">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#8b7cf6] to-[#5b4bd6]"><TrendingUp className="size-4.5" /></span>
          <div>
            <h1 className="text-[20px] font-semibold tracking-tight">Revenue intelligence</h1>
            <p className="flex items-center gap-1.5 text-[12px] text-white/45"><Database className="size-3.5" /> Warehouse synced 06:00 · 3.04M rows · 4 sources</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-white/[0.05] p-1">
            {(Object.keys(DATA) as Metric[]).map((m) => (
              <button key={m} type="button" onClick={on(act, { t: "metric", v: m })}
                className={`rounded-lg px-3.5 py-1.5 text-[13px] transition ${s.metric === m ? "bg-white text-[#0c0b14]" : "text-white/55 hover:text-white"}`}>
                {DATA[m].label}
              </button>
            ))}
          </div>
          <button type="button" onClick={on(act, { t: "range", v: s.range === "12m" ? "6m" : "12m" })}
            className="flex items-center gap-2 rounded-xl border border-white/10 px-3.5 py-2 text-[13px] text-white/70">
            <Calendar className="size-4" /> Last {s.range === "12m" ? "12" : "6"} months
          </button>
        </div>
      </header>

      <div className="mt-6 grid min-h-0 flex-1 grid-cols-[1fr_360px] gap-5">
        <section className="flex flex-col rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.04] to-transparent p-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[13px] text-white/50">{d.label}, {s.range === "12m" ? "trailing 12 months" : "last 6 months"}</p>
              <p className="mt-1 text-[40px] font-semibold tabular-nums tracking-tight">{d.total}</p>
            </div>
            <span className="mb-2 rounded-full bg-emerald-400/10 px-3 py-1 text-[13px] text-emerald-300">{d.delta} year on year</span>
          </div>

          <div className="relative mt-5 flex-1">
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible">
              <defs>
                <linearGradient id="ab-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#8b7cf6" stopOpacity="0.45" />
                  <stop offset="1" stopColor="#8b7cf6" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0.25, 0.5, 0.75].map((g) => (
                <line key={g} x1="0" x2={W} y1={H * g} y2={H * g} stroke="rgba(255,255,255,0.06)" vectorEffect="non-scaling-stroke" />
              ))}
              <path d={area} fill="url(#ab-fill)" />
              <path d={line} fill="none" stroke="#a79bff" strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
              {sel !== null ? (
                <line x1={pts[sel][0]} x2={pts[sel][0]} y1="0" y2={H} stroke="rgba(255,255,255,0.25)" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
              ) : null}
            </svg>
            {pts.map(([x, y], i) => (
              <button key={`${s.metric}-${s.range}-${i}`} type="button" onClick={on(act, { t: "point", i })}
                className="group absolute size-7 -translate-x-1/2 -translate-y-1/2" style={{ left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%` }}>
                <span className={`mx-auto block rounded-full border-2 border-[#0c0b14] transition ${sel === i ? "size-4 bg-white" : "size-2.5 bg-[#a79bff] group-hover:size-3.5"}`} />
              </button>
            ))}
            {sel !== null ? (
              <div className="pointer-events-none absolute -translate-x-1/2 -translate-y-[130%] whitespace-nowrap rounded-xl bg-white px-3.5 py-2 text-[#0c0b14] shadow-xl"
                style={{ left: `${Math.min(Math.max((pts[sel][0] / W) * 100, 8), 92)}%`, top: `${(pts[sel][1] / H) * 100}%` }}>
                <p className="text-[11px] text-black/50">{labels[sel]} 2026</p>
                <p className="text-[15px] font-semibold tabular-nums">{d.unit(vals[sel])}</p>
              </div>
            ) : null}
          </div>
          <div className="mt-3 flex justify-between text-[11px] text-white/35">
            {labels.map((m) => <span key={m}>{m}</span>)}
          </div>
        </section>

        <aside className="flex flex-col gap-5">
          <section className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
            <p className="text-[14px] font-medium">Where it comes from</p>
            <div className="mt-4 flex items-center gap-5">
              <Donut />
              <ul className="flex flex-1 flex-col gap-2.5 text-[12.5px]">
                {SOURCES.map((x) => (
                  <li key={x.k} className="flex items-center gap-2">
                    <span className="size-2.5 rounded-sm" style={{ background: x.c }} />
                    <span className="whitespace-nowrap text-white/70">{x.k}</span>
                    <span className="ml-auto tabular-nums text-white/45">{x.v}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
          <section className="flex-1 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
            <p className="text-[14px] font-medium">Best sellers this month</p>
            <ul className="mt-3 flex flex-col">
              {[["Olive oil, 3L tin", "18.2k"], ["Za'atar blend, 500g", "11.9k"], ["Medjool dates, 1kg", "9.4k"], ["Kunafa tray, family", "7.1k"]].map(([n, v], i) => (
                <li key={n} className="flex items-center gap-3 border-b border-white/[0.05] py-2.5 text-[13px] last:border-0">
                  <span className="w-4 text-white/30">{i + 1}</span>
                  <span className="flex-1 text-white/80">{n}</span>
                  <span className="tabular-nums text-white/55">{v} JOD</span>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}

export const demo = defineDemo<S, A>({
  initial: { metric: "revenue", range: "12m", point: 10 },
  reduce(s, a) {
    switch (a.t) {
      case "metric":
        return { ...s, metric: a.v };
      case "range":
        return { ...s, range: a.v, point: null };
      case "point":
        return { ...s, point: s.point === a.i ? null : a.i };
    }
  },
  View,
});
