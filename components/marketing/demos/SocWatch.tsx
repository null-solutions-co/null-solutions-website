import { Radio, Check, ShieldCheck, Laptop, PhoneCall, Activity } from "lucide-react";
import { defineDemo, on, type ViewProps } from "./kit";

type Level = "crit" | "high" | "med" | "low";

const POOL: { m: string; lvl: Level; src: string }[] = [
  { m: "Sign-in from an unusual country for a finance user", lvl: "high", src: "Identity" },
  { m: "Many failed sign-ins on one account in two minutes", lvl: "med", src: "Identity" },
  { m: "Firewall rule changed outside the change window", lvl: "med", src: "Network" },
  { m: "Endpoint protection turned off on a laptop", lvl: "crit", src: "Endpoint" },
  { m: "New admin account created after hours", lvl: "high", src: "Identity" },
  { m: "Unusual volume of outbound traffic from a server", lvl: "med", src: "Network" },
  { m: "Company laptop enrolled from a new location", lvl: "low", src: "Endpoint" },
  { m: "Mailbox forwarding rule added to an external address", lvl: "high", src: "Email" },
];

const STYLE: Record<Level, { label: string; cls: string }> = {
  crit: { label: "CRIT", cls: "bg-red-500/15 text-red-300 ring-red-500/40" },
  high: { label: "HIGH", cls: "bg-orange-500/15 text-orange-300 ring-orange-500/40" },
  med: { label: "MED", cls: "bg-amber-400/15 text-amber-300 ring-amber-400/40" },
  low: { label: "LOW", cls: "bg-sky-400/15 text-sky-300 ring-sky-400/40" },
};

type Alert = { id: number; at: string; i: number };
type S = { feed: Alert[]; next: number; acked: number[]; isolated: boolean; clock: number; rate: number[] };
type A = { t: "tick" } | { t: "ack"; id: number } | { t: "isolate" };

const stamp = (sec: number) => {
  const total = 3 * 3600 + 14 * 60 + sec;
  const h = Math.floor(total / 3600) % 24;
  const m = Math.floor(total / 60) % 60;
  const x = total % 60;
  return [h, m, x].map((n) => String(n).padStart(2, "0")).join(":");
};

function View({ s, act }: ViewProps<S, A>) {
  const open = s.feed.filter((a) => !s.acked.includes(a.id));
  const max = Math.max(...s.rate);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#060708] text-[#e9edf0]">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/[0.06] px-8">
        <div className="flex items-center gap-3">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex size-2.5 rounded-full bg-emerald-400" />
          </span>
          <span className="text-[15px] font-semibold">Watchfloor</span>
          <span className="text-[13px] text-white/40">Night shift · 23:00–07:00</span>
        </div>
        <div className="flex items-center gap-6 text-[13px]">
          <span className="font-mono tabular-nums text-white/60">{stamp(s.clock)}</span>
          <span className="flex items-center gap-2 text-white/55"><Activity className="size-4" /> 4,812 events / min</span>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[1fr_360px] gap-5 p-7">
        <section className="flex min-h-0 flex-col">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-[14px] font-medium"><Radio className="size-4 text-emerald-400" /> Live alerts</p>
            <p className="text-[12px] text-white/40">{open.length} need a look</p>
          </div>
          <div className="mt-3 flex flex-col gap-2">
            {s.feed.map((a, idx) => {
              const x = POOL[a.i];
              const acked = s.acked.includes(a.id);
              return (
                <div key={a.id} className={`flex items-center gap-4 rounded-2xl border px-4 py-3.5 transition ${idx === 0 && !acked ? "ns-feed-in border-white/15 bg-white/[0.05]" : "border-white/[0.06] bg-white/[0.02]"} ${acked ? "opacity-45" : ""}`}>
                  <span className="font-mono text-[12px] tabular-nums text-white/40">{a.at}</span>
                  <span className={`rounded-md px-2 py-0.5 font-mono text-[10.5px] ring-1 ${STYLE[x.lvl].cls}`}>{STYLE[x.lvl].label}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] text-white/90">{x.m}</span>
                    <span className="text-[11.5px] text-white/35">{x.src}</span>
                  </span>
                  <button type="button" onClick={on(act, { t: "ack", id: a.id })} disabled={acked}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] transition ${acked ? "text-emerald-300" : "bg-white/[0.07] text-white/80 hover:bg-white/15"}`}>
                    {acked ? <><Check className="size-3.5" /> Handled</> : "Take it"}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <aside className="flex flex-col gap-4">
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
            <p className="text-[12px] uppercase tracking-wider text-white/40">Time to first look</p>
            <p className="mt-1 text-[34px] font-semibold tabular-nums text-emerald-400">4m 12s</p>
            <p className="text-[12px] text-white/35">Promised in the contract: 15 minutes</p>
            <div className="mt-4 flex h-12 items-end gap-1">
              {s.rate.map((v, i) => (
                <span key={i} className="flex-1 rounded-sm bg-emerald-400/60 transition-all duration-500" style={{ height: `${(v / max) * 100}%` }} />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
            <p className="text-[12px] uppercase tracking-wider text-white/40">On call tonight</p>
            <ul className="mt-3 flex flex-col gap-2.5 text-[13.5px]">
              <li className="flex items-center justify-between"><span>Analyst</span><span className="text-white/50">Rana A.</span></li>
              <li className="flex items-center justify-between"><span>Escalation</span><span className="text-white/50">Yazan K.</span></li>
              <li className="flex items-center justify-between"><span className="flex items-center gap-2"><PhoneCall className="size-3.5" /> Client contact</span><span className="text-emerald-300">Notified</span></li>
            </ul>
          </div>

          <div className={`mt-auto rounded-2xl border p-5 transition ${s.isolated ? "border-emerald-500/40 bg-emerald-500/[0.08]" : "border-red-500/30 bg-red-500/[0.06]"}`}>
            <p className="flex items-center gap-2 text-[13px] font-medium"><Laptop className="size-4" /> FIN-LAPTOP-07</p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/60">
              {s.isolated ? "Cut off from the network. The user can still reach IT support." : "Protection was switched off 6 minutes ago. Recommend isolating while we check."}
            </p>
            <button type="button" onClick={on(act, { t: "isolate" })} disabled={s.isolated}
              className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[13.5px] font-semibold transition ${s.isolated ? "bg-emerald-500 text-white" : "bg-red-500 text-white hover:bg-red-400"}`}>
              {s.isolated ? <><ShieldCheck className="size-4" /> Device isolated</> : "Isolate device"}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

const seed: Alert[] = [3, 0, 2, 6, 1].map((i, k) => ({ id: 100 - k, at: stamp(-k * 140 - 20), i }));

export const demo = defineDemo<S, A>({
  initial: { feed: seed, next: 4, acked: [99], isolated: false, clock: 0, rate: [5, 7, 6, 8, 7, 9, 6, 8, 10, 7, 9, 8] },
  reduce(s, a) {
    switch (a.t) {
      case "tick": {
        const clock = s.clock + 3;
        const alert: Alert = { id: s.feed[0].id + 1, at: stamp(clock), i: s.next % POOL.length };
        return {
          ...s,
          clock,
          next: s.next + 1,
          feed: [alert, ...s.feed].slice(0, 7),
          rate: [...s.rate.slice(1), 5 + ((s.next * 7) % 6)],
        };
      }
      case "ack":
        return s.acked.includes(a.id) ? s : { ...s, acked: [...s.acked, a.id] };
      case "isolate":
        return { ...s, isolated: true };
    }
  },
  View,
  tick: { ms: 3000, action: { t: "tick" } },
});
