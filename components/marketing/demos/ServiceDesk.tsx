import { Inbox, Clock, Send, Building2, Mail, CheckCircle2 } from "lucide-react";
import { defineDemo, on, type ViewProps } from "./kit";

type Status = "open" | "progress" | "resolved";

const TICKETS = [
  { id: "SD-3312", p: "P1", t: "Card payments failing at checkout", who: "Rania — Olive & Co.", sla: 27 * 60, msg: "Since about 10:40 every Visa payment fails with an error. Mastercard is fine. We're losing sales, please help." },
  { id: "SD-3309", p: "P2", t: "Tax line missing on invoice PDFs", who: "Khaled — Dar Build", sla: 3 * 3600 + 10 * 60, msg: "Invoices generated this morning don't show the 16% sales tax line. The total is right, the breakdown isn't." },
  { id: "SD-3305", p: "P3", t: "Add two people to the finance role", who: "Maha — Nabd Clinics", sla: 28 * 3600, msg: "Please give Samer and Lina access to invoices and reports. Same rights as me." },
  { id: "SD-3301", p: "P4", t: "Monthly dependency updates", who: "Internal", sla: 5 * 86400, msg: "Scheduled patch window for September. No downtime expected." },
] as const;

type Ticket = (typeof TICKETS)[number];
type S = { sel: Ticket["id"]; status: Record<string, Status>; replied: string[]; elapsed: number };
type A = { t: "sel"; id: Ticket["id"] } | { t: "status"; v: Status } | { t: "reply" } | { t: "tick" };

const PRIO: Record<string, string> = { P1: "bg-red-500", P2: "bg-orange-400", P3: "bg-sky-400", P4: "bg-stone-300" };

function left(sec: number) {
  if (sec <= 0) return "overdue";
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const x = sec % 60;
  if (d) return `${d}d ${h}h`;
  if (h) return `${h}h ${String(m).padStart(2, "0")}m`;
  return `${m}m ${String(x).padStart(2, "0")}s`;
}

function View({ s, act }: ViewProps<S, A>) {
  const tk = TICKETS.find((x) => x.id === s.sel) ?? TICKETS[0];
  const st = s.status[tk.id] ?? "open";

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#faf8f4] text-[#1c1b19]">
      <aside className="flex w-[380px] shrink-0 flex-col border-r border-black/[0.07] bg-white">
        <div className="flex items-center justify-between px-6 pb-3 pt-6">
          <p className="flex items-center gap-2 text-[16px] font-semibold"><Inbox className="size-4.5" /> Support</p>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11.5px] text-emerald-700">99.2% within SLA</span>
        </div>
        <div className="flex flex-col gap-1 px-3">
          {TICKETS.map((x) => {
            const status = s.status[x.id] ?? "open";
            const remaining = x.sla - s.elapsed;
            return (
              <button key={x.id} type="button" onClick={on(act, { t: "sel", id: x.id })}
                className={`rounded-2xl px-4 py-3.5 text-left transition ${s.sel === x.id ? "bg-[#1c1b19] text-white" : "hover:bg-black/[0.03]"}`}>
                <div className="flex items-center gap-2 text-[11.5px]">
                  <span className={`size-2 rounded-full ${PRIO[x.p]}`} />
                  <span className={s.sel === x.id ? "text-white/60" : "text-black/45"}>{x.id} · {x.p}</span>
                  <span className={`ml-auto font-mono tabular-nums ${status === "resolved" ? "text-emerald-500" : x.p === "P1" ? "text-red-500" : s.sel === x.id ? "text-white/60" : "text-black/45"}`}>
                    {status === "resolved" ? "resolved" : left(remaining)}
                  </span>
                </div>
                <p className="mt-1.5 truncate text-[14px] font-medium">{x.t}</p>
                <p className={`mt-0.5 text-[12px] ${s.sel === x.id ? "text-white/50" : "text-black/45"}`}>{x.who}</p>
              </button>
            );
          })}
        </div>
      </aside>

      <main className="flex flex-1 flex-col">
        <header className="border-b border-black/[0.07] px-8 py-5">
          <p className="text-[12px] text-black/45">{tk.id} · opened 10:52</p>
          <h1 className="mt-1 text-[22px] font-semibold tracking-tight">{tk.t}</h1>
          <div className="mt-3 flex rounded-xl bg-black/[0.04] p-1 text-[13px]" style={{ width: "fit-content" }}>
            {([["open", "Open"], ["progress", "In progress"], ["resolved", "Resolved"]] as const).map(([k, label]) => (
              <button key={k} type="button" onClick={on(act, { t: "status", v: k })}
                className={`rounded-lg px-4 py-1.5 transition ${st === k ? (k === "resolved" ? "bg-emerald-600 text-white" : "bg-white shadow-sm") : "text-black/50"}`}>
                {label}
              </button>
            ))}
          </div>
        </header>

        <div className="flex-1 overflow-hidden px-8 py-6">
          <div className="flex gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#e9e2d6] text-[13px] font-semibold">{tk.who[0]}</span>
            <div className="max-w-[560px] rounded-2xl rounded-tl-md bg-white px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <p className="text-[12px] text-black/45">{tk.who}</p>
              <p className="mt-1 text-[14px] leading-relaxed">{tk.msg}</p>
            </div>
          </div>
          {s.replied.includes(tk.id) ? (
            <div className="ns-feed-in mt-4 flex flex-row-reverse gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#1c1b19] text-[12px] font-semibold text-white">ND</span>
              <div className="max-w-[560px] rounded-2xl rounded-tr-md bg-[#1c1b19] px-4 py-3 text-white">
                <p className="text-[12px] text-white/50">Nour · Support engineer</p>
                <p className="mt-1 text-[14px] leading-relaxed">Thanks, we&apos;re on it. I&apos;ve reproduced it and our engineer is looking now. I&apos;ll update you within 30 minutes, sooner if it&apos;s fixed.</p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="border-t border-black/[0.07] p-5">
          <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3">
            <span className="flex-1 text-[13.5px] text-black/40">{s.replied.includes(tk.id) ? "Reply sent. Add a note…" : "Write a reply, or use the suggested one →"}</span>
            <button type="button" onClick={on(act, { t: "reply" })} disabled={s.replied.includes(tk.id)}
              className="flex items-center gap-2 rounded-xl bg-[#1c1b19] px-4 py-2 text-[13px] font-medium text-white disabled:bg-emerald-600">
              {s.replied.includes(tk.id) ? <><CheckCircle2 className="size-4" /> Sent</> : <><Send className="size-4" /> Send suggested reply</>}
            </button>
          </div>
        </div>
      </main>

      <aside className="flex w-[300px] shrink-0 flex-col gap-4 border-l border-black/[0.07] p-6">
        <div className="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <p className="text-[12px] uppercase tracking-wider text-black/40">Customer</p>
          <p className="mt-2 flex items-center gap-2 text-[14px] font-medium"><Building2 className="size-4 text-black/40" />{tk.who.split("—")[1]?.trim() ?? "Internal"}</p>
          <p className="mt-1.5 flex items-center gap-2 text-[13px] text-black/55"><Mail className="size-4 text-black/35" />Gold plan · since 2025</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <p className="flex items-center gap-2 text-[12px] uppercase tracking-wider text-black/40"><Clock className="size-3.5" /> Service level</p>
          <p className={`mt-2 font-mono text-[26px] font-semibold tabular-nums ${st === "resolved" ? "text-emerald-600" : tk.p === "P1" ? "text-red-600" : ""}`}>
            {st === "resolved" ? "Met" : left(tk.sla - s.elapsed)}
          </p>
          <p className="text-[12px] text-black/45">{st === "resolved" ? "Resolved inside the promised time" : "left to resolve"}</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/[0.06]">
            <div className={`h-full rounded-full ${st === "resolved" ? "bg-emerald-500" : tk.p === "P1" ? "bg-red-500" : "bg-[#1c1b19]"}`}
              style={{ width: st === "resolved" ? "100%" : `${Math.min(100, (s.elapsed / tk.sla) * 100 + 40)}%` }} />
          </div>
        </div>
      </aside>
    </div>
  );
}

export const demo = defineDemo<S, A>({
  initial: { sel: "SD-3312", status: { "SD-3301": "progress" }, replied: [], elapsed: 0 },
  reduce(s, a) {
    switch (a.t) {
      case "sel":
        return { ...s, sel: a.id };
      case "status":
        return { ...s, status: { ...s.status, [s.sel]: a.v } };
      case "reply":
        return s.replied.includes(s.sel) ? s : { ...s, replied: [...s.replied, s.sel], status: { ...s.status, [s.sel]: s.status[s.sel] === "resolved" ? "resolved" : "progress" } };
      case "tick":
        return { ...s, elapsed: s.elapsed + 1 };
    }
  },
  View,
  tick: { ms: 1000, action: { t: "tick" } },
});
