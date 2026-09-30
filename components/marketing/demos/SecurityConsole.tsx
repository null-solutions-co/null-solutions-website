import { ShieldCheck, X, Server, Wrench, CheckCircle2, Download, User } from "lucide-react";
import { defineDemo, on, type ViewProps } from "./kit";

type Sev = "critical" | "high" | "medium" | "low";

/** A management view of an assessment: what was found, how bad, who owns the fix. */
const FINDINGS = [
  { id: "NS-014", t: "Sessions outlive logout", sev: "critical", area: "Customer API", owner: "Backend team", due: "3 days", summary: "Signing out doesn't fully end a session on the server side.", fix: "Revoke sessions server-side at logout and shorten session lifetime." },
  { id: "NS-013", t: "Unsafe file previews in tickets", sev: "high", area: "Support portal", owner: "Frontend team", due: "7 days", summary: "Some uploaded file types are previewed in a way that isn't isolated from the agent's session.", fix: "Serve uploads from a separate, isolated domain and restrict previewable types." },
  { id: "NS-011", t: "Invoice storage too open", sev: "high", area: "File storage", owner: "Infrastructure", due: "7 days", summary: "Stored invoices are reachable more widely than they should be.", fix: "Make storage private and hand out short-lived links from the API." },
  { id: "NS-008", t: "Outdated encryption on mail gateway", sev: "medium", area: "Mail gateway", owner: "Infrastructure", due: "30 days", summary: "An older protocol version is still enabled for compatibility.", fix: "Disable legacy protocol versions and weak cipher suites." },
  { id: "NS-006", t: "Password reset can be spammed", sev: "medium", area: "Customer API", owner: "Backend team", due: "30 days", summary: "Reset emails aren't rate-limited per account.", fix: "Add per-account and per-IP limits on reset requests." },
  { id: "NS-004", t: "Error pages say too much", sev: "low", area: "Customer API", owner: "Backend team", due: "Next release", summary: "Error responses include internal detail that users don't need.", fix: "Return generic errors to users; keep detail in server logs." },
] as const;

type Finding = (typeof FINDINGS)[number];

const SEV: Record<Sev, { label: string; dot: string; pill: string; card: string }> = {
  critical: { label: "Critical", dot: "bg-red-500", pill: "bg-red-500/15 text-red-300 ring-red-500/30", card: "text-red-400" },
  high: { label: "High", dot: "bg-orange-500", pill: "bg-orange-500/15 text-orange-300 ring-orange-500/30", card: "text-orange-400" },
  medium: { label: "Medium", dot: "bg-amber-400", pill: "bg-amber-400/15 text-amber-300 ring-amber-400/30", card: "text-amber-300" },
  low: { label: "Low", dot: "bg-sky-400", pill: "bg-sky-400/15 text-sky-300 ring-sky-400/30", card: "text-sky-300" },
};

type S = { filter: Sev | "all"; open: Finding["id"] | null; fixed: Finding["id"][] };
type A = { t: "filter"; v: Sev | "all" } | { t: "open"; id: Finding["id"] } | { t: "close" } | { t: "fix" };

function View({ s, act }: ViewProps<S, A>) {
  const open = FINDINGS.find((f) => f.id === s.open);
  const live = FINDINGS.filter((f) => !s.fixed.includes(f.id));
  const rows = FINDINGS.filter((f) => s.filter === "all" || f.sev === s.filter);
  const count = (v: Sev) => live.filter((f) => f.sev === v).length;
  const progress = Math.round(((s.fixed.length + 17) / (FINDINGS.length + 17)) * 100);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#0a0a0d] text-[#ecedf2]">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/[0.07] px-8">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-red-500/15 text-red-300"><ShieldCheck className="size-5" /></span>
          <div>
            <p className="text-[15px] font-semibold">Security review · Customer platform</p>
            <p className="text-[12px] text-white/45">Assessment NS-2026-014 · retest booked for 12 May</p>
          </div>
        </div>
        <span className="flex items-center gap-2 rounded-lg border border-white/10 px-3.5 py-2 text-[13px] text-white/70"><Download className="size-4" /> Board summary (PDF)</span>
      </header>

      <div className="grid shrink-0 grid-cols-5 gap-3 px-8 pt-6">
        {(["critical", "high", "medium", "low"] as const).map((v) => (
          <button key={v} type="button" onClick={on(act, { t: "filter", v: s.filter === v ? "all" : v })}
            className={`rounded-2xl border p-4 text-left transition ${s.filter === v ? "border-white/40 bg-white/[0.06]" : "border-white/[0.07] bg-white/[0.02] hover:border-white/20"}`}>
            <p className="flex items-center gap-2 text-[12px] uppercase tracking-wider text-white/45"><span className={`size-2 rounded-full ${SEV[v].dot}`} />{SEV[v].label}</p>
            <p className={`mt-2 text-[32px] font-semibold tabular-nums ${SEV[v].card}`}>{count(v)}</p>
          </button>
        ))}
        <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.06] p-4">
          <p className="text-[12px] uppercase tracking-wider text-emerald-300/80">Fixed so far</p>
          <p className="mt-2 text-[32px] font-semibold tabular-nums text-emerald-300">{progress}%</p>
          <div className="mt-1 h-1 rounded-full bg-white/10"><div className="h-full rounded-full bg-emerald-400 transition-all duration-500" style={{ width: `${progress}%` }} /></div>
        </div>
      </div>

      <div className="mt-5 min-h-0 flex-1 px-8 pb-7">
        <div className="h-full overflow-hidden rounded-2xl border border-white/[0.07]">
          <div className="grid grid-cols-[0.8fr_3fr_1fr_1.4fr_1.2fr] bg-white/[0.03] px-5 py-2.5 text-[11px] uppercase tracking-wider text-white/40">
            <span>ID</span><span>Finding</span><span>Severity</span><span>Area</span><span>Status</span>
          </div>
          {rows.map((f) => {
            const done = s.fixed.includes(f.id);
            return (
              <button key={f.id} type="button" onClick={on(act, { t: "open", id: f.id })}
                className={`grid w-full grid-cols-[0.8fr_3fr_1fr_1.4fr_1.2fr] items-center border-t border-white/[0.05] px-5 py-3.5 text-left text-[13.5px] transition hover:bg-white/[0.03] ${s.open === f.id ? "bg-white/[0.05]" : ""}`}>
                <span className="font-mono text-[12px] text-white/50">{f.id}</span>
                <span className={done ? "text-white/40 line-through" : "text-white/90"}>{f.t}</span>
                <span><span className={`rounded-full px-2.5 py-1 text-[11px] ring-1 ${SEV[f.sev].pill}`}>{SEV[f.sev].label}</span></span>
                <span className="text-white/55">{f.area}</span>
                <span className={`text-[12.5px] ${done ? "text-emerald-300" : "text-white/50"}`}>{done ? "Fixed · awaiting retest" : `Due in ${f.due}`}</span>
              </button>
            );
          })}
        </div>
      </div>

      {open ? (
        <aside className="ns-drawer absolute inset-y-0 right-0 flex w-[440px] flex-col border-l border-white/10 bg-[#111116] p-7 shadow-2xl">
          <div className="flex items-start justify-between">
            <span className={`rounded-full px-2.5 py-1 text-[11px] ring-1 ${SEV[open.sev].pill}`}>{SEV[open.sev].label} · {open.id}</span>
            <button type="button" onClick={on(act, { t: "close" })} className="text-white/40 hover:text-white" aria-label="Close"><X className="size-5" /></button>
          </div>
          <h2 className="mt-4 text-[22px] font-semibold leading-snug">{open.t}</h2>
          <div className="mt-4 flex flex-col gap-2 text-[13px] text-white/60">
            <span className="flex items-center gap-2"><Server className="size-4" /> {open.area}</span>
            <span className="flex items-center gap-2"><User className="size-4" /> {open.owner} · due in {open.due}</span>
          </div>
          <p className="mt-6 text-[12px] uppercase tracking-wider text-white/40">What we found</p>
          <p className="mt-2 text-[14px] leading-relaxed text-white/80">{open.summary}</p>
          <p className="mt-6 flex items-center gap-2 text-[12px] uppercase tracking-wider text-white/40"><Wrench className="size-3.5" /> Recommended fix</p>
          <p className="mt-2 text-[14px] leading-relaxed text-white/80">{open.fix}</p>
          <button type="button" onClick={on(act, { t: "fix" })} disabled={s.fixed.includes(open.id)}
            className="mt-auto flex items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-[14px] font-semibold text-[#0a0a0d] transition disabled:bg-emerald-500 disabled:text-white">
            {s.fixed.includes(open.id) ? <><CheckCircle2 className="size-4" /> Marked fixed, queued for retest</> : "Mark as fixed"}
          </button>
        </aside>
      ) : null}
    </div>
  );
}

export const demo = defineDemo<S, A>({
  initial: { filter: "all", open: null, fixed: [] },
  reduce(s, a) {
    switch (a.t) {
      case "filter":
        return { ...s, filter: a.v };
      case "open":
        return { ...s, open: a.id };
      case "close":
        return { ...s, open: null };
      case "fix":
        return s.open && !s.fixed.includes(s.open) ? { ...s, fixed: [...s.fixed, s.open] } : s;
    }
  },
  View,
});
