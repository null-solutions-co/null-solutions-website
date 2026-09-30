import { Play, Check, Loader2, Circle, GitBranch, Rocket, Terminal } from "lucide-react";
import { defineDemo, on, type ViewProps } from "./kit";

const STAGES = [
  { k: "Install", d: "18s", log: ["npm ci", "added 1,284 packages in 17.6s"] },
  { k: "Lint", d: "11s", log: ["eslint . --max-warnings 0", "✓ no problems"] },
  { k: "Test", d: "1m 04s", log: ["vitest run", "✓ 212 tests passed"] },
  { k: "Build", d: "47s", log: ["docker build -t api:3.0.1 .", "image size 142 MB"] },
  { k: "Scan", d: "22s", log: ["dependency + image scan", "0 critical · 0 high"] },
  { k: "Deploy", d: "36s", log: ["rolling update → staging", "3/3 replicas healthy"] },
];

type Build = { n: number; branch: string; msg: string; ok: boolean; when: string };
const HISTORY: Build[] = [
  { n: 1482, branch: "main", msg: "Rotate session cookie on privilege change", ok: true, when: "2h ago" },
  { n: 1481, branch: "feat/invoice-pdf", msg: "Render invoice PDFs server-side", ok: true, when: "5h ago" },
  { n: 1480, branch: "main", msg: "Bump Npgsql to 9.0.2", ok: false, when: "yesterday" },
  { n: 1479, branch: "fix/rtl-nav", msg: "Logical properties in the header", ok: true, when: "yesterday" },
];

type S = { run: "idle" | "running" | "done"; stage: number; lines: string[]; builds: Build[] };
type A = { t: "run" } | { t: "tick" };

function View({ s, act }: ViewProps<S, A>) {
  const status = (i: number) => (s.run === "idle" ? "wait" : i < s.stage || s.run === "done" ? "ok" : i === s.stage ? "run" : "wait");

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#0b0d12] px-9 py-7 text-[#e7eaf0]">
      <header className="flex items-center justify-between">
        <div>
          <p className="flex items-center gap-2 text-[13px] text-white/45"><GitBranch className="size-4" /> null-api · main · 9f3c1ab</p>
          <h1 className="mt-1 text-[24px] font-semibold tracking-tight">Ship it to staging</h1>
        </div>
        <button type="button" onClick={on(act, { t: "run" })} disabled={s.run === "running"}
          className="flex items-center gap-2 rounded-xl bg-[#3b82f6] px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-[#2563eb] disabled:opacity-60">
          {s.run === "running" ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
          {s.run === "running" ? "Running…" : s.run === "done" ? "Run again" : "Run pipeline"}
        </button>
      </header>

      <div className="mt-6 flex items-center gap-2">
        {STAGES.map((st, i) => {
          const x = status(i);
          return (
            <div key={st.k} className="flex flex-1 items-center gap-2">
              <div className={`flex flex-1 items-center gap-3 rounded-2xl border px-4 py-3.5 transition ${
                x === "ok" ? "border-emerald-500/30 bg-emerald-500/[0.07]" : x === "run" ? "border-[#3b82f6]/60 bg-[#3b82f6]/[0.12]" : "border-white/[0.07] bg-white/[0.02]"}`}>
                {x === "ok" ? <Check className="size-4 text-emerald-300" /> : x === "run" ? <Loader2 className="size-4 animate-spin text-[#93b8ff]" /> : <Circle className="size-4 text-white/25" />}
                <div>
                  <p className="text-[13.5px] font-medium">{st.k}</p>
                  <p className="font-mono text-[11px] text-white/40">{x === "ok" ? st.d : x === "run" ? "running" : "queued"}</p>
                </div>
              </div>
              {i < STAGES.length - 1 ? <span className={`h-px w-3 ${x === "ok" ? "bg-emerald-400/50" : "bg-white/10"}`} /> : null}
            </div>
          );
        })}
      </div>

      <div className="mt-5 grid min-h-0 flex-1 grid-cols-[1.35fr_1fr] gap-5">
        <section className="flex min-h-0 flex-col rounded-2xl border border-white/[0.07] bg-[#07080b]">
          <p className="flex items-center gap-2 border-b border-white/[0.06] px-5 py-3 text-[13px] text-white/55"><Terminal className="size-4" /> Output</p>
          <div className="flex-1 overflow-hidden px-5 py-4 font-mono text-[12.5px] leading-[1.9]">
            {s.lines.length === 0 ? <p className="text-white/30">Press “Run pipeline” to start.</p> : null}
            {s.lines.slice(-12).map((l, i) => (
              <p key={`${s.lines.length}-${i}`} className={l.startsWith("$") ? "text-[#93b8ff]" : l.startsWith("✓") || l.includes("healthy") ? "text-emerald-300" : "text-white/65"}>{l}</p>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
            <p className="text-[13px] text-white/45">Environments</p>
            <ul className="mt-3 flex flex-col gap-3 text-[13.5px]">
              <li className="flex items-center gap-2.5"><span className="size-2 rounded-full bg-emerald-400" /> production <span className="ml-auto font-mono text-[12px] text-white/45">v2.9.1</span></li>
              <li className="flex items-center gap-2.5"><span className={`size-2 rounded-full ${s.run === "done" ? "bg-emerald-400" : "bg-[#3b82f6]"}`} /> staging <span className="ml-auto font-mono text-[12px] text-white/45">{s.run === "done" ? "v3.0.1" : "v3.0.0"}</span></li>
              <li className="flex items-center gap-2.5"><span className="size-2 rounded-full bg-white/25" /> review-142 <span className="ml-auto font-mono text-[12px] text-white/45">ephemeral</span></li>
            </ul>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02]">
            <p className="flex items-center gap-2 px-5 pt-4 text-[13px] text-white/45"><Rocket className="size-4" /> Recent runs</p>
            <ul className="mt-2">
              {s.builds.slice(0, 5).map((b) => (
                <li key={b.n} className="flex items-center gap-3 border-t border-white/[0.05] px-5 py-2.5 text-[12.5px] first:border-0">
                  <span className={`size-2 rounded-full ${b.ok ? "bg-emerald-400" : "bg-red-400"}`} />
                  <span className="font-mono text-white/45">#{b.n}</span>
                  <span className="min-w-0 flex-1 truncate text-white/80">{b.msg}</span>
                  <span className="text-white/35">{b.when}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

export const demo = defineDemo<S, A>({
  initial: { run: "idle", stage: 0, lines: [], builds: HISTORY },
  reduce(s, a) {
    switch (a.t) {
      case "run":
        return s.run === "running" ? s : { ...s, run: "running", stage: 0, lines: [`$ ${STAGES[0].log[0]}`] };
      case "tick": {
        if (s.run !== "running") return s;
        const st = STAGES[s.stage];
        const lines = [...s.lines, st.log[1]];
        if (s.stage === STAGES.length - 1) {
          const n = s.builds[0].n + 1;
          return {
            ...s,
            run: "done",
            lines: [...lines, "✓ pipeline passed in 3m 18s"],
            builds: [{ n, branch: "main", msg: "Harden password reset limits", ok: true, when: "just now" }, ...s.builds],
          };
        }
        return { ...s, stage: s.stage + 1, lines: [...lines, `$ ${STAGES[s.stage + 1].log[0]}`] };
      }
    }
  },
  View,
  tick: { ms: 900, action: { t: "tick" }, active: (s) => s.run === "running" },
});
