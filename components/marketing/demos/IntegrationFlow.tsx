import { RefreshCw, Pause, Play, Store, Landmark, Boxes, Users, Warehouse } from "lucide-react";
import { defineDemo, on, type ViewProps } from "./kit";

/** Systems around the middleware, placed on a 1280×360 canvas. */
const NODES = [
  { k: "store", label: "Online store", sub: "orders · returns", x: 170, y: 90, Icon: Store },
  { k: "bank", label: "Bank / CliQ", sub: "settlements", x: 170, y: 270, Icon: Landmark },
  { k: "erp", label: "Odoo ERP", sub: "stock · invoices", x: 1110, y: 90, Icon: Boxes },
  { k: "crm", label: "CRM", sub: "customers", x: 1110, y: 270, Icon: Users },
  { k: "wms", label: "Warehouse", sub: "pick · pack", x: 640, y: 320, Icon: Warehouse },
] as const;
const HUB = { x: 640, y: 150 };

const FLOWS = [
  { k: "store", name: "Orders → ERP", cadence: "real time", today: 1204 },
  { k: "erp", name: "Stock → online store", cadence: "every 5 min", today: 288 },
  { k: "bank", name: "Settlements → ledger", cadence: "nightly 02:00", today: 1 },
  { k: "crm", name: "New customers → CRM", cadence: "real time", today: 173 },
  { k: "wms", name: "Picks → warehouse", cadence: "real time", today: 961 },
] as const;

type S = { paused: string[]; failed: number; replaying: boolean; sent: number };
type A = { t: "toggle"; k: string } | { t: "replay" } | { t: "tick" };

function View({ s, act }: ViewProps<S, A>) {
  const healthy = s.failed === 0;
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#070b10] px-9 py-7 text-[#e6edf3]">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight">Integrations</h1>
          <p className="mt-0.5 text-[13px] text-white/45">5 systems · {(99.97 + (healthy ? 0.01 : 0)).toFixed(2)}% delivered over 30 days</p>
        </div>
        <button type="button" onClick={on(act, { t: "replay" })} disabled={healthy || s.replaying}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13.5px] font-medium transition ${healthy ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-400 text-[#070b10] hover:bg-amber-300"}`}>
          <RefreshCw className={`size-4 ${s.replaying ? "animate-spin" : ""}`} />
          {healthy ? "Nothing waiting" : s.replaying ? "Resending…" : `Resend ${s.failed} failed`}
        </button>
      </header>

      <div className="relative mt-4 h-[360px] shrink-0 rounded-2xl border border-white/[0.06] bg-[radial-gradient(60%_80%_at_50%_40%,rgba(34,211,238,0.07),transparent)]">
        <svg viewBox="0 0 1280 360" className="absolute inset-0 size-full">
          {NODES.map((n) => {
            const paused = s.paused.includes(n.k);
            const d = `M${n.x},${n.y} C${(n.x + HUB.x) / 2},${n.y} ${(n.x + HUB.x) / 2},${HUB.y} ${HUB.x},${HUB.y}`;
            return (
              <g key={n.k}>
                <path d={d} fill="none" stroke={paused ? "rgba(255,255,255,0.12)" : "rgba(34,211,238,0.35)"} strokeWidth="2" strokeDasharray={paused ? "6 8" : undefined} />
                {!paused
                  ? [0, 1.2].map((delay) => (
                      <circle key={delay} r="5" fill="#67e8f9">
                        <animateMotion dur="2.4s" begin={`${delay}s`} repeatCount="indefinite" path={d} />
                      </circle>
                    ))
                  : null}
              </g>
            );
          })}
        </svg>

        <div className="absolute -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-cyan-400/40 bg-[#0b1a22] px-6 py-4 text-center shadow-[0_0_60px_-10px_rgba(34,211,238,0.5)]" style={{ left: `${(HUB.x / 1280) * 100}%`, top: `${(HUB.y / 360) * 100}%` }}>
          <p className="font-mono text-[12px] tracking-[0.2em] text-cyan-300">MIDDLEWARE</p>
          <p className="mt-1 text-[12px] text-white/50">maps · retries · keeps a replay log</p>
          <p className="mt-2 text-[20px] font-semibold tabular-nums">{s.sent.toLocaleString("en-US")}</p>
          <p className="text-[11px] text-white/40">messages today</p>
        </div>

        {NODES.map(({ k, label, sub, x, y, Icon }) => {
          const paused = s.paused.includes(k);
          return (
            <div key={k} className={`absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-3 rounded-2xl border bg-[#0d131a] px-4 py-3 transition ${paused ? "border-white/10 opacity-60" : "border-white/15"}`} style={{ left: `${(x / 1280) * 100}%`, top: `${(y / 360) * 100}%` }}>
              <span className="flex size-9 items-center justify-center rounded-xl bg-white/[0.06]"><Icon className="size-4.5 text-white/80" /></span>
              <span>
                <span className="block text-[14px] font-medium">{label}</span>
                <span className="block text-[11.5px] text-white/40">{paused ? "paused" : sub}</span>
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 min-h-0 flex-1 overflow-hidden rounded-2xl border border-white/[0.07]">
        <div className="grid grid-cols-[2fr_1.2fr_1fr_1fr_0.8fr] bg-white/[0.03] px-5 py-2.5 text-[11px] uppercase tracking-wider text-white/40">
          <span>Flow</span><span>Cadence</span><span>Today</span><span>State</span><span />
        </div>
        {FLOWS.map((f, i) => {
          const paused = s.paused.includes(f.k);
          const failing = i === 0 && s.failed > 0;
          return (
            <div key={f.k} className="grid grid-cols-[2fr_1.2fr_1fr_1fr_0.8fr] items-center border-t border-white/[0.05] px-5 py-2.5 text-[13px]">
              <span className="text-white/85">{f.name}</span>
              <span className="text-white/45">{f.cadence}</span>
              <span className="tabular-nums text-white/55">{f.today.toLocaleString("en-US")}</span>
              <span className={paused ? "text-white/40" : failing ? "text-amber-300" : "text-emerald-300"}>{paused ? "Paused" : failing ? `${s.failed} retrying` : "Healthy"}</span>
              <button type="button" onClick={on(act, { t: "toggle", k: f.k })} className="flex items-center justify-end gap-1.5 text-[12px] text-white/55 hover:text-white">
                {paused ? <><Play className="size-3.5" /> Resume</> : <><Pause className="size-3.5" /> Pause</>}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const demo = defineDemo<S, A>({
  initial: { paused: [], failed: 3, replaying: false, sent: 2627 },
  reduce(s, a) {
    switch (a.t) {
      case "toggle":
        return { ...s, paused: s.paused.includes(a.k) ? s.paused.filter((k) => k !== a.k) : [...s.paused, a.k] };
      case "replay":
        return s.failed > 0 ? { ...s, replaying: true } : s;
      case "tick": {
        const live = 5 - s.paused.length;
        const next = { ...s, sent: s.sent + live * 3 };
        if (s.replaying) {
          const failed = Math.max(0, s.failed - 1);
          return { ...next, failed, replaying: failed > 0 };
        }
        return next;
      }
    }
  },
  View,
  tick: { ms: 800, action: { t: "tick" } },
});
