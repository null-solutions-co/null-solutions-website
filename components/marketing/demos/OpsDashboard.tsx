import { LayoutGrid, Package, Truck, Users, Receipt, BarChart3, Search, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { defineDemo, on, type ViewProps } from "./kit";

type Tab = "overview" | "shipments" | "fleet";
type Range = "7d" | "30d" | "12m";
type Filter = "all" | "transit" | "delayed" | "delivered";

type S = { tab: Tab; range: Range; bar: number | null; filter: Filter };
type A = { t: "tab"; v: Tab } | { t: "range"; v: Range } | { t: "bar"; i: number } | { t: "filter"; v: Filter };

const SERIES: Record<Range, { labels: string[]; values: number[] }> = {
  "7d": { labels: ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"], values: [182, 214, 238, 226, 251, 263, 140] },
  "30d": { labels: ["W1", "W2", "W3", "W4", "W5"], values: [1240, 1318, 1402, 1377, 1489] },
  "12m": { labels: ["O", "N", "D", "J", "F", "M", "A", "M", "J", "J", "A", "S"], values: [4.1, 4.4, 4.9, 4.2, 4.6, 5.1, 5.4, 5.2, 5.8, 6.1, 5.9, 6.4] },
};

const SHIPMENTS = [
  { id: "FL-2291", from: "Amman", to: "Zarqa", unit: "Unit 12", eta: "14:20", state: "transit" },
  { id: "FL-2290", from: "Aqaba", to: "Amman", unit: "Unit 21", eta: "16:05", state: "delayed" },
  { id: "FL-2288", from: "Amman", to: "Irbid", unit: "Unit 07", eta: "Done", state: "delivered" },
  { id: "FL-2287", from: "Amman", to: "Madaba", unit: "Unit 04", eta: "Done", state: "delivered" },
  { id: "FL-2285", from: "Salt", to: "Amman", unit: "Unit 16", eta: "15:40", state: "transit" },
  { id: "FL-2284", from: "Mafraq", to: "Amman", unit: "Unit 09", eta: "17:30", state: "delayed" },
  { id: "FL-2281", from: "Amman", to: "Jerash", unit: "Unit 02", eta: "Done", state: "delivered" },
] as const;

const PILL: Record<string, string> = {
  transit: "bg-sky-400/10 text-sky-300 ring-sky-400/25",
  delayed: "bg-amber-400/10 text-amber-300 ring-amber-400/25",
  delivered: "bg-emerald-400/10 text-emerald-300 ring-emerald-400/25",
};
const LABEL: Record<string, string> = { transit: "In transit", delayed: "Delayed", delivered: "Delivered" };

function Spark({ points, up }: { points: number[]; up: boolean }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const d = points
    .map((v, i) => `${i === 0 ? "M" : "L"}${(i / (points.length - 1)) * 100},${28 - ((v - min) / (max - min || 1)) * 24}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="h-8 w-24">
      <path d={d} fill="none" stroke={up ? "#34d399" : "#fbbf24"} strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function Nav({ s, act }: ViewProps<S, A>) {
  const items = [
    { k: "overview", label: "Overview", Icon: LayoutGrid },
    { k: "shipments", label: "Shipments", Icon: Package },
    { k: "fleet", label: "Fleet", Icon: Truck },
    { k: null, label: "Drivers", Icon: Users },
    { k: null, label: "Invoicing", Icon: Receipt },
    { k: null, label: "Reports", Icon: BarChart3 },
  ] as const;
  return (
    <aside className="flex w-[228px] shrink-0 flex-col border-r border-white/[0.06] bg-[#0e0e0e] px-4 py-6">
      <div className="flex items-center gap-2.5 px-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#4f7cff] to-[#2743c9] text-[13px] font-bold">F</span>
        <span className="text-[15px] font-semibold tracking-tight">Fleetline</span>
      </div>
      <nav className="mt-8 flex flex-col gap-0.5">
        {items.map(({ k, label, Icon }) => (
          <button
            key={label}
            type="button"
            onClick={k ? on(act, { t: "tab", v: k }) : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[14px] transition ${
              k === s.tab ? "bg-white/[0.08] text-white" : "text-white/50 hover:text-white/80"
            }`}
          >
            <Icon className="size-[17px]" /> {label}
          </button>
        ))}
      </nav>
      <div className="mt-auto rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
        <p className="text-[12px] text-white/45">Fleet utilisation</p>
        <p className="mt-1 text-[24px] font-semibold tabular-nums">87.4%</p>
        <div className="mt-3 h-1.5 rounded-full bg-white/10">
          <div className="h-full w-[87%] rounded-full bg-gradient-to-r from-[#4f7cff] to-[#8aa5ff]" />
        </div>
        <p className="mt-2 text-[11px] text-white/35">31 of 36 vehicles on route</p>
      </div>
    </aside>
  );
}

function Table({ s, act, rows }: ViewProps<S, A> & { rows: number }) {
  const list = SHIPMENTS.filter((x) => s.filter === "all" || x.state === s.filter).slice(0, rows);
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02]">
      <div className="flex items-center justify-between px-5 py-3.5">
        <p className="text-[14px] font-medium">Live shipments</p>
        <div className="flex gap-1.5">
          {(["all", "transit", "delayed", "delivered"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={on(act, { t: "filter", v: f })}
              className={`rounded-full px-3 py-1 text-[12px] transition ${s.filter === f ? "bg-white text-[#101010]" : "text-white/50 hover:text-white"}`}
            >
              {f === "all" ? "All" : LABEL[f]}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-[1fr_2fr_1fr_0.8fr_1.1fr] border-y border-white/[0.06] bg-white/[0.02] px-5 py-2 text-[11px] uppercase tracking-wider text-white/35">
        <span>Ref</span><span>Route</span><span>Vehicle</span><span>ETA</span><span>Status</span>
      </div>
      {list.map((r) => (
        <div key={r.id} className="grid grid-cols-[1fr_2fr_1fr_0.8fr_1.1fr] items-center border-b border-white/[0.04] px-5 py-3 text-[13px] last:border-0">
          <span className="font-mono text-white/60">{r.id}</span>
          <span className="text-white/85">{r.from} <span className="text-white/30">→</span> {r.to}</span>
          <span className="text-white/55">{r.unit}</span>
          <span className="tabular-nums text-white/55">{r.eta}</span>
          <span><span className={`rounded-full px-2.5 py-1 text-[11px] ring-1 ${PILL[r.state]}`}>{LABEL[r.state]}</span></span>
        </div>
      ))}
    </div>
  );
}

function View({ s, act }: ViewProps<S, A>) {
  const series = SERIES[s.range];
  const max = Math.max(...series.values);
  const unit = s.range === "12m" ? "k" : "";

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#101010] text-[#e8ecf5]">
      <Nav s={s} act={act} />
      <main className="flex flex-1 flex-col overflow-hidden px-8 py-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-[24px] font-semibold tracking-tight">
              {s.tab === "overview" ? "Good afternoon, Layla" : s.tab === "shipments" ? "Shipments" : "Fleet"}
            </h1>
            <p className="mt-0.5 text-[13px] text-white/45">Live · synced 40 seconds ago</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex w-[220px] items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[13px] text-white/35">
              <Search className="size-4" /> Search shipments
            </div>
            <div className="flex rounded-lg border border-white/[0.08] p-0.5">
              {(["7d", "30d", "12m"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={on(act, { t: "range", v: r })}
                  className={`rounded-md px-3 py-1.5 text-[12px] transition ${s.range === r ? "bg-[#4f7cff] text-white" : "text-white/50 hover:text-white"}`}
                >
                  {r}
                </button>
              ))}
            </div>
            <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-rose-400 text-[13px] font-semibold text-[#101010]">LH</span>
          </div>
        </header>

        {s.tab === "overview" ? (
          <>
            <div className="mt-6 grid grid-cols-4 gap-4">
              {[
                { k: "Active shipments", v: "1,284", d: "+6.2%", up: true, pts: [4, 6, 5, 7, 8, 7, 9] },
                { k: "On-time rate", v: "96.1%", d: "+1.4%", up: true, pts: [5, 5, 6, 6, 7, 7, 8] },
                { k: "Cost per km", v: "0.41 JOD", d: "−3.0%", up: true, pts: [8, 7, 7, 6, 6, 5, 5] },
                { k: "Open exceptions", v: "12", d: "+2", up: false, pts: [3, 4, 3, 5, 4, 6, 6] },
              ].map((t) => (
                <div key={t.k} className="rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.04] to-transparent p-4">
                  <p className="text-[12px] text-white/50">{t.k}</p>
                  <div className="mt-2 flex items-end justify-between">
                    <p className="text-[26px] font-semibold tabular-nums tracking-tight">{t.v}</p>
                    <Spark points={t.pts} up={t.up} />
                  </div>
                  <p className={`mt-1 flex items-center gap-1 text-[12px] ${t.up ? "text-emerald-300" : "text-amber-300"}`}>
                    {t.up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />} {t.d} vs last period
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-[1.55fr_1fr] gap-4">
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
                <div className="flex items-baseline justify-between">
                  <p className="text-[14px] font-medium">Deliveries completed</p>
                  <p className="text-[12px] text-white/40">
                    {s.bar !== null ? `${series.labels[s.bar]} · ${series.values[s.bar]}${unit}` : "Tap a bar"}
                  </p>
                </div>
                <div className="mt-4 flex h-[150px] items-end gap-2">
                  {series.values.map((v, i) => (
                    <button
                      key={`${s.range}-${i}`}
                      type="button"
                      onClick={on(act, { t: "bar", i })}
                      className="group flex h-full flex-1 flex-col items-center justify-end gap-2"
                    >
                      <span
                        className={`w-full rounded-md transition-all duration-500 ${
                          s.bar === i ? "bg-[#8aa5ff]" : i === series.values.length - 1 ? "bg-[#4f7cff]" : "bg-white/[0.12] group-hover:bg-white/25"
                        }`}
                        style={{ height: `${(v / max) * 100}%` }}
                      />
                      <span className="text-[11px] text-white/35">{series.labels[i]}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
                <p className="text-[14px] font-medium">On time, by corridor</p>
                <div className="mt-4 flex flex-col gap-3.5">
                  {[
                    { k: "Amman ↔ Zarqa", v: 98 },
                    { k: "Amman ↔ Irbid", v: 96 },
                    { k: "Aqaba ↔ Amman", v: 88 },
                    { k: "Northern loop", v: 93 },
                  ].map((r) => (
                    <div key={r.k}>
                      <div className="flex justify-between text-[12.5px]">
                        <span className="text-white/70">{r.k}</span>
                        <span className="tabular-nums text-white/50">{r.v}%</span>
                      </div>
                      <div className="mt-1.5 h-1.5 rounded-full bg-white/[0.07]">
                        <div className={`h-full rounded-full ${r.v < 90 ? "bg-amber-400/80" : "bg-emerald-400/80"}`} style={{ width: `${r.v}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 min-h-0 flex-1">
              <Table s={s} act={act} rows={3} />
            </div>
          </>
        ) : s.tab === "shipments" ? (
          <div className="mt-6">
            <Table s={s} act={act} rows={7} />
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-4 gap-4">
            {Array.from({ length: 8 }, (_, i) => {
              const state = i === 2 ? "Maintenance" : i === 5 ? "Idle" : "On route";
              return (
                <div key={i} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between">
                    <Truck className="size-5 text-white/60" />
                    <span className={`text-[11px] ${state === "On route" ? "text-emerald-300" : state === "Idle" ? "text-white/40" : "text-amber-300"}`}>{state}</span>
                  </div>
                  <p className="mt-4 text-[16px] font-medium">Unit {String(i * 3 + 2).padStart(2, "0")}</p>
                  <p className="text-[12px] text-white/40">Isuzu NPR · {12 + i * 7}k km</p>
                  <div className="mt-3 h-1 rounded-full bg-white/[0.07]">
                    <div className="h-full rounded-full bg-[#4f7cff]" style={{ width: `${40 + ((i * 17) % 55)}%` }} />
                  </div>
                  <p className="mt-1.5 text-[11px] text-white/35">Fuel {40 + ((i * 17) % 55)}%</p>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export const demo = defineDemo<S, A>({
  initial: { tab: "overview", range: "7d", bar: null, filter: "all" },
  reduce(s, a) {
    switch (a.t) {
      case "tab":
        return { ...s, tab: a.v };
      case "range":
        return { ...s, range: a.v, bar: null };
      case "bar":
        return { ...s, bar: s.bar === a.i ? null : a.i };
      case "filter":
        return { ...s, filter: a.v };
    }
  },
  View,
});
