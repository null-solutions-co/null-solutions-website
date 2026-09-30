import { ChevronLeft, MapPin, Phone, Check, Clock, Package, User, CalendarDays, Home } from "lucide-react";
import { defineDemo, on, type ViewProps } from "./kit";

type Tab = "today" | "week" | "parts" | "me";

const JOBS = [
  { id: "j1", t: "09:30", who: "Al Bayader Clinic", what: "Network switch swap", addr: "Wadi Al Seer, Bldg 14", steps: ["Back up switch config", "Swap unit, re-patch 24 ports", "Test each floor"] },
  { id: "j2", t: "11:15", who: "Sweifieh Branch", what: "CCTV re-cabling", addr: "Wakalat St, Sweifieh", steps: ["Trace faulty runs", "Re-terminate 6 cameras", "Check recorder"] },
  { id: "j3", t: "13:00", who: "Khalda Office", what: "Wi-Fi survey, 3 floors", addr: "Al Khalidi St 22, Khalda", steps: ["Heat-map floor 1", "Heat-map floors 2–3", "Mark dead zones", "Agree AP positions"] },
  { id: "j4", t: "15:30", who: "Marj Al Hamam Store", what: "UPS replacement", addr: "Main Rd, Marj Al Hamam", steps: ["Shut down safely", "Swap battery pack", "Load test"] },
] as const;

type Job = (typeof JOBS)[number];
type S = { tab: Tab; open: Job["id"] | null; done: Job["id"][]; checks: Record<string, number[]> };
type A = { t: "tab"; v: Tab } | { t: "open"; id: Job["id"] } | { t: "close" } | { t: "check"; i: number } | { t: "complete" };

function Ring({ value, total }: { value: number; total: number }) {
  const r = 24;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 60 60" className="size-16">
      <circle cx="30" cy="30" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="6" />
      <circle cx="30" cy="30" r={r} fill="none" stroke="#7dd3a8" strokeWidth="6" strokeLinecap="round"
        strokeDasharray={`${(c * value) / total} ${c}`} transform="rotate(-90 30 30)" className="transition-all duration-500" />
      <text x="30" y="35" textAnchor="middle" fontSize="15" fontWeight="600" fill="#fff">{value}/{total}</text>
    </svg>
  );
}

function View({ s, act }: ViewProps<S, A>) {
  const job = JOBS.find((j) => j.id === s.open);
  const next = JOBS.find((j) => !s.done.includes(j.id));

  return (
    <div className="h-full w-full overflow-hidden bg-[#0d0f14]">
      <div className="relative mx-auto flex h-full w-full max-w-[416px] flex-col overflow-hidden bg-[#f4f5f7] text-[#15171c]">
        <div className="flex h-11 shrink-0 items-center justify-between bg-[#15171c] px-6 pt-1 text-[13px] font-semibold text-white">
          <span>9:41</span>
          <span className="flex items-center gap-1.5 text-[11px]">
            <span className="flex h-2.5 items-end gap-[2px]">{[1, 2, 3, 4].map((b) => <span key={b} className="w-[3px] rounded-sm bg-white" style={{ height: `${b * 25}%` }} />)}</span>
            5G
            <span className="ml-1 h-3 w-6 rounded-[3px] border border-white/70 p-[1.5px]"><span className="block h-full w-4/5 rounded-[1px] bg-white" /></span>
          </span>
        </div>

        {s.tab === "today" ? (
          <>
            <header className="shrink-0 bg-[#15171c] px-6 pb-7 pt-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] text-white/50">Tuesday, 14 April</p>
                  <h1 className="mt-1 text-[24px] font-semibold tracking-tight">Morning, Omar</h1>
                  <p className="mt-1 text-[13px] text-white/60">{JOBS.length - s.done.length === 0 ? "All visits done. Nice work." : `Next up: ${next?.who}`}</p>
                </div>
                <Ring value={s.done.length} total={JOBS.length} />
              </div>
            </header>
            <div className="-mt-4 flex-1 overflow-hidden rounded-t-[22px] bg-[#f4f5f7] px-4 pt-4">
              <div className="relative h-[96px] overflow-hidden rounded-2xl bg-[#e3e8ef]">
                <svg viewBox="0 0 380 96" className="absolute inset-0 size-full" preserveAspectRatio="none">
                  <path d="M0 70 L80 60 L140 72 L220 40 L300 52 L380 20" stroke="#fff" strokeWidth="10" fill="none" />
                  <path d="M20 96 L60 0 M170 96 L200 0 M290 96 L330 0" stroke="#fff" strokeWidth="6" />
                  <path d="M40 66 C 110 58, 150 80, 210 46 S 300 50, 340 28" stroke="#3b6cf6" strokeWidth="3.5" fill="none" strokeDasharray="7 6" />
                </svg>
                {[[40, 66], [150, 70], [210, 46], [340, 28]].map(([x, y], i) => (
                  <span key={i} className={`absolute size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white ${s.done.includes(JOBS[i].id) ? "bg-emerald-500" : "bg-[#3b6cf6]"}`} style={{ left: `${(x / 380) * 100}%`, top: `${(y / 96) * 100}%` }} />
                ))}
                <span className="absolute bottom-2 right-3 rounded-full bg-white px-2.5 py-1 text-[11px] font-medium">38 km · 1h 20m driving</span>
              </div>

              <p className="mt-5 px-1 text-[12px] font-semibold uppercase tracking-wider text-black/40">Today&apos;s visits</p>
              <div className="mt-2 flex flex-col gap-2">
                {JOBS.map((j) => {
                  const isDone = s.done.includes(j.id);
                  const isNext = next?.id === j.id;
                  return (
                    <button key={j.id} type="button" onClick={on(act, { t: "open", id: j.id })}
                      className={`flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition ${isNext ? "ring-2 ring-[#3b6cf6]" : ""}`}>
                      <span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${isDone ? "bg-emerald-500 text-white" : "bg-[#eef1f6] text-black/50"}`}>
                        {isDone ? <Check className="size-4" /> : <Clock className="size-4" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`block truncate text-[14px] font-medium ${isDone ? "text-black/40 line-through" : ""}`}>{j.who}</span>
                        <span className="block truncate text-[12px] text-black/45">{j.t} · {j.what}</span>
                      </span>
                      {isNext ? <span className="rounded-full bg-[#3b6cf6] px-2.5 py-1 text-[11px] font-medium text-white">Next</span> : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        ) : s.tab === "week" ? (
          <div className="flex-1 px-5 pt-6">
            <h1 className="text-[22px] font-semibold">This week</h1>
            <div className="mt-4 flex flex-col gap-2">
              {["Sun · 3 visits", "Mon · 5 visits", "Tue · 4 visits", "Wed · 2 visits", "Thu · 6 visits"].map((d, i) => (
                <div key={d} className={`flex items-center justify-between rounded-2xl px-4 py-4 ${i === 2 ? "bg-[#15171c] text-white" : "bg-white"}`}>
                  <span className="text-[14px] font-medium">{d}</span>
                  <CalendarDays className="size-4 opacity-50" />
                </div>
              ))}
            </div>
          </div>
        ) : s.tab === "parts" ? (
          <div className="flex-1 px-5 pt-6">
            <h1 className="text-[22px] font-semibold">Van stock</h1>
            <div className="mt-4 flex flex-col gap-2">
              {[["Cat6 patch, 2m", 42], ["Access point AP-620", 3], ["UPS battery 12V", 1], ["RJ45 connectors", 180], ["PoE injector", 0]].map(([n, q]) => (
                <div key={n as string} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3.5">
                  <span className="flex items-center gap-3 text-[14px]"><Package className="size-4 text-black/40" />{n}</span>
                  <span className={`text-[13px] font-semibold tabular-nums ${q === 0 ? "text-rose-500" : ""}`}>{q === 0 ? "Out" : q}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 px-5 pt-8 text-center">
            <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-[#15171c] text-[26px] font-semibold text-white">OS</span>
            <h1 className="mt-3 text-[20px] font-semibold">Omar Saleh</h1>
            <p className="text-[13px] text-black/45">Field engineer · Amman West</p>
            <div className="mt-6 grid grid-cols-3 gap-2">
              {[["128", "visits"], ["4.9", "rating"], ["96%", "first fix"]].map(([v, k]) => (
                <div key={k} className="rounded-2xl bg-white py-4"><p className="text-[18px] font-semibold">{v}</p><p className="text-[11px] text-black/45">{k}</p></div>
              ))}
            </div>
          </div>
        )}

        <nav className="mt-auto flex shrink-0 border-t border-black/[0.06] bg-white px-2 pb-6 pt-2.5">
          {([["today", "Today", Home], ["week", "Week", CalendarDays], ["parts", "Parts", Package], ["me", "Me", User]] as const).map(([k, label, Icon]) => (
            <button key={k} type="button" onClick={on(act, { t: "tab", v: k })}
              className={`flex flex-1 flex-col items-center gap-1 text-[11px] ${s.tab === k ? "text-[#15171c]" : "text-black/35"}`}>
              <Icon className="size-5" /> {label}
            </button>
          ))}
        </nav>

        {job ? (
          <div className="absolute inset-0 z-10 flex flex-col bg-black/40">
            <div className="ns-sheet mt-auto flex h-[80%] flex-col rounded-t-[26px] bg-white px-5 pb-7 pt-3">
              <span className="mx-auto h-1 w-10 rounded-full bg-black/15" />
              <button type="button" onClick={on(act, { t: "close" })} className="mt-3 flex items-center gap-1 text-[13px] text-black/50">
                <ChevronLeft className="size-4" /> Back
              </button>
              <p className="mt-3 text-[12px] font-medium text-[#3b6cf6]">{job.t} · {s.done.includes(job.id) ? "Completed" : "Scheduled"}</p>
              <h2 className="mt-1 text-[22px] font-semibold leading-tight">{job.who}</h2>
              <p className="text-[14px] text-black/55">{job.what}</p>
              <div className="mt-4 flex gap-2">
                <span className="flex flex-1 items-center gap-2 rounded-xl bg-[#f4f5f7] px-3 py-2.5 text-[12px]"><MapPin className="size-4 text-black/40" />{job.addr}</span>
                <span className="flex items-center rounded-xl bg-[#f4f5f7] px-3"><Phone className="size-4" /></span>
              </div>
              <p className="mt-5 text-[12px] font-semibold uppercase tracking-wider text-black/40">Checklist</p>
              <div className="mt-2 flex flex-col gap-1.5">
                {job.steps.map((step, i) => {
                  const ticked = (s.checks[job.id] ?? []).includes(i) || s.done.includes(job.id);
                  return (
                    <button key={step} type="button" onClick={on(act, { t: "check", i })} className="flex items-center gap-3 rounded-xl px-1 py-2 text-left">
                      <span className={`flex size-6 items-center justify-center rounded-md border-2 transition ${ticked ? "border-emerald-500 bg-emerald-500 text-white" : "border-black/20"}`}>
                        {ticked ? <Check className="size-3.5" /> : null}
                      </span>
                      <span className={`text-[14px] ${ticked ? "text-black/40 line-through" : ""}`}>{step}</span>
                    </button>
                  );
                })}
              </div>
              <button type="button" onClick={on(act, { t: "complete" })} disabled={s.done.includes(job.id)}
                className="mt-auto rounded-2xl bg-[#15171c] py-4 text-[15px] font-semibold text-white transition disabled:bg-emerald-500">
                {s.done.includes(job.id) ? "Visit completed" : "Complete visit"}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export const demo = defineDemo<S, A>({
  initial: { tab: "today", open: null, done: ["j1", "j2"], checks: {} },
  reduce(s, a) {
    switch (a.t) {
      case "tab":
        return { ...s, tab: a.v, open: null };
      case "open":
        return { ...s, open: a.id };
      case "close":
        return { ...s, open: null };
      case "check": {
        if (!s.open) return s;
        const cur = s.checks[s.open] ?? [];
        const nextChecks = cur.includes(a.i) ? cur.filter((x) => x !== a.i) : [...cur, a.i];
        return { ...s, checks: { ...s.checks, [s.open]: nextChecks } };
      }
      case "complete":
        return s.open && !s.done.includes(s.open) ? { ...s, done: [...s.done, s.open] } : s;
    }
  },
  View,
});
