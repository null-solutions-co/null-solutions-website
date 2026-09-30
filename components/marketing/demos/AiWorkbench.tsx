import { FileText, Sparkles, Check, AlertTriangle, Send, ChevronDown } from "lucide-react";
import { defineDemo, on, type ViewProps } from "./kit";

/** The contract, clause by clause. `f` links a sentence to the extracted field it feeds. */
const CLAUSES: { h: string; body: { text: string; f?: number }[] }[] = [
  {
    h: "4. Price and payment",
    body: [
      { text: "The Buyer shall pay the Supplier a total of " },
      { text: "JOD 412,000 (four hundred and twelve thousand Jordanian dinars)", f: 1 },
      { text: ", payable in four equal instalments. Each invoice falls due " },
      { text: "forty-five (45) days from the date of receipt", f: 2 },
      { text: ", by bank transfer to the account named in Schedule B." },
    ],
  },
  {
    h: "5. Term and renewal",
    body: [
      { text: "This Agreement begins on 1 March 2026 and " },
      { text: "renews automatically for successive twelve-month periods", f: 3 },
      { text: " unless either party ends it. " },
      { text: "Either party may terminate on ninety (90) days' written notice", f: 5 },
      { text: " before the renewal date." },
    ],
  },
  {
    h: "11. Governing law",
    body: [
      { text: "This Agreement is governed by " },
      { text: "the laws of the Hashemite Kingdom of Jordan", f: 4 },
      { text: ", and the courts of Amman have exclusive jurisdiction." },
    ],
  },
];

const FIELDS = [
  { k: "Counterparty", v: "Zarqa Industrial Co.", c: 98, where: "Preamble" },
  { k: "Contract value", v: "JOD 412,000", c: 97, where: "§4.1" },
  { k: "Payment terms", v: "Net 45 days", c: 94, where: "§4.2" },
  { k: "Renewal", v: "Auto, 12 months", c: 91, where: "§5.1" },
  { k: "Governing law", v: "Jordan, Amman courts", c: 99, where: "§11" },
  { k: "Termination notice", v: "90 days, written", c: 68, where: "§5.2", flag: "Your master agreement says 60 days. Check which one wins before signing." },
];

const QUESTIONS = [
  { q: "When can we get out of this contract?", a: "You can end it with 90 days' written notice before a renewal date (§5.2). The next renewal is 1 March 2027, so notice must arrive by 1 December 2026.", cite: "§5.2" },
  { q: "How much do we pay, and when?", a: "JOD 412,000 in four instalments of JOD 103,000. Each invoice is due 45 days after you receive it, by bank transfer (§4.1–4.2).", cite: "§4" },
  { q: "Anything unusual compared with our template?", a: "One thing: the 90-day termination notice. Your template uses 60. Everything else matches.", cite: "§5.2" },
];

type S = { field: number | null; q: number | null; typed: number; accepted: boolean };
type A = { t: "field"; i: number } | { t: "ask"; i: number } | { t: "type" } | { t: "accept" } | { t: "clear" };

function View({ s, act }: ViewProps<S, A>) {
  const answer = s.q !== null ? QUESTIONS[s.q] : null;
  const flagged = FIELDS[5];

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#f6f6f8] text-[#16171d]">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-black/[0.07] bg-white px-6">
        <div className="flex items-center gap-3">
          <span className="flex size-8 items-center justify-center rounded-lg bg-[#5b5bd6] text-white"><Sparkles className="size-4" /></span>
          <span className="text-[15px] font-semibold">Clause</span>
          <span className="text-black/20">/</span>
          <span className="flex items-center gap-2 text-[14px] text-black/60"><FileText className="size-4" /> Supply agreement — Zarqa Industrial.pdf</span>
        </div>
        <div className="flex items-center gap-2 text-[13px]">
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">Read in 11 seconds · 14 pages</span>
          <span className="rounded-lg bg-[#16171d] px-3.5 py-1.5 text-white">Export summary</span>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <section className="flex-1 overflow-hidden px-10 py-7">
          <div className="mx-auto h-full max-w-[640px] rounded-xl bg-white px-12 py-10 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_12px_40px_-20px_rgba(0,0,0,0.15)]">
            <p className="text-center text-[11px] font-semibold uppercase tracking-[0.25em] text-black/40">Supply agreement</p>
            <div className="mt-7 flex flex-col gap-6">
              {CLAUSES.map((c) => (
                <div key={c.h}>
                  <p className="text-[15px] font-semibold">{c.h}</p>
                  <p className="mt-2 text-[15px] leading-[1.8] text-black/70">
                    {c.body.map((part, i) =>
                      part.f === undefined ? (
                        <span key={i} className={s.field !== null ? "text-black/35" : ""}>{part.text}</span>
                      ) : (
                        <mark
                          key={i}
                          className={`rounded px-0.5 transition ${
                            s.field === part.f
                              ? "bg-[#5b5bd6] text-white"
                              : part.f === 5
                                ? "bg-amber-100 text-black/80"
                                : s.field !== null
                                  ? "bg-transparent text-black/35"
                                  : "bg-[#5b5bd6]/10 text-black/80"
                          }`}
                        >
                          {part.text}
                        </mark>
                      ),
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="flex w-[420px] shrink-0 flex-col border-l border-black/[0.07] bg-white">
          <div className="flex items-center justify-between px-5 pb-1.5 pt-4">
            <p className="text-[14px] font-semibold">Key terms</p>
            <span className="flex items-center gap-1 text-[12px] text-black/45">All 6 <ChevronDown className="size-3.5" /></span>
          </div>
          <div className="flex flex-col gap-1.5 px-3">
            {FIELDS.map((f, i) => (
              <button
                key={f.k}
                type="button"
                onClick={on(act, { t: "field", i })}
                className={`rounded-xl px-3 py-1.5 text-left transition ${s.field === i ? "bg-[#5b5bd6]/[0.08] ring-1 ring-[#5b5bd6]/40" : "hover:bg-black/[0.03]"}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider text-black/40">{f.k} · {f.where}</span>
                  <span className={`text-[11px] font-medium tabular-nums ${f.c < 80 ? "text-amber-600" : "text-emerald-600"}`}>{f.c}%</span>
                </div>
                <div className="mt-1 flex items-center justify-between gap-3">
                  <span className="text-[14px] font-medium">{f.v}</span>
                  <span className="h-1 w-16 overflow-hidden rounded-full bg-black/[0.06]">
                    <span className={`block h-full ${f.c < 80 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${f.c}%` }} />
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="mx-4 mt-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <p className="flex items-center gap-2 text-[12px] font-semibold text-amber-800"><AlertTriangle className="size-3.5" /> Needs a human</p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-amber-900/80">{flagged.flag}</p>
            <button type="button" onClick={on(act, { t: "accept" })}
              className={`mt-2 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition ${s.accepted ? "bg-emerald-600 text-white" : "bg-white text-amber-900 ring-1 ring-amber-300"}`}>
              {s.accepted ? <><Check className="size-3.5" /> Reviewed by you</> : "Mark as reviewed"}
            </button>
          </div>

          <div className="mt-auto border-t border-black/[0.07] px-4 pb-4 pt-3">
            {answer ? (
              <div className="mb-2 rounded-xl bg-[#f3f3fb] p-3">
                <p className="text-[12px] font-medium text-black/50">{answer.q}</p>
                <p className="mt-1.5 min-h-[56px] text-[13px] leading-relaxed">
                  {answer.a.slice(0, s.typed)}
                  {s.typed < answer.a.length ? <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-[#5b5bd6] align-middle" /> : null}
                </p>
                {s.typed >= answer.a.length ? (
                  <div className="mt-2 flex items-center justify-between">
                    <span className="rounded-md bg-white px-2 py-0.5 font-mono text-[11px] text-[#5b5bd6] ring-1 ring-[#5b5bd6]/30">Source {answer.cite}</span>
                    <button type="button" onClick={on(act, { t: "clear" })} className="text-[12px] text-[#5b5bd6] hover:underline">
                      Ask another
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="mb-2.5 flex flex-col gap-1">
                {QUESTIONS.map((q, i) => (
                  <button key={q.q} type="button" onClick={on(act, { t: "ask", i })}
                    className="rounded-lg border border-black/[0.08] px-3 py-1.5 text-left text-[12.5px] text-black/70 transition hover:border-[#5b5bd6]/50 hover:text-black">
                    {q.q}
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2 rounded-xl border border-black/10 px-3 py-2.5">
              <span className="flex-1 text-[13px] text-black/35">Ask anything about this contract…</span>
              <Send className="size-4 text-[#5b5bd6]" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export const demo = defineDemo<S, A>({
  initial: { field: null, q: null, typed: 0, accepted: false },
  reduce(s, a) {
    switch (a.t) {
      case "field":
        return { ...s, field: s.field === a.i ? null : a.i };
      case "ask":
        return { ...s, q: a.i, typed: 0 };
      case "type": {
        if (s.q === null) return s;
        const len = QUESTIONS[s.q].a.length;
        return s.typed >= len ? s : { ...s, typed: Math.min(len, s.typed + 4) };
      }
      case "accept":
        return { ...s, accepted: !s.accepted };
      case "clear":
        return { ...s, q: null, typed: 0 };
    }
  },
  View,
  tick: { ms: 30, action: { t: "type" }, active: (s) => s.q !== null && s.typed < QUESTIONS[s.q].a.length },
});
