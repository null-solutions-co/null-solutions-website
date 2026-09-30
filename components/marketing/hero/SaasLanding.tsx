import { ArrowRight, Check } from "lucide-react";

const LOGOS = ["NAJM", "orbit", "Dunes&Co", "SAFQA", "levantia", "Qasr"];

/** A payments-API product's marketing site: the kind of landing page a startup ships. */
export function SaasLanding() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#060a14] text-white" style={{ fontFamily: "var(--font-sans)" }}>
      <div className="absolute -left-40 -top-40 size-[640px] rounded-full bg-[radial-gradient(closest-side,rgba(52,110,255,0.35),transparent_70%)]" />
      <div className="absolute -right-32 top-20 size-[520px] rounded-full bg-[radial-gradient(closest-side,rgba(20,210,170,0.22),transparent_70%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(70%_60%_at_40%_30%,#000,transparent)]" />

      <header className="relative flex items-center justify-between px-14 py-6">
        <span className="flex items-center gap-2 text-[19px] font-semibold tracking-tight">
          <span className="flex size-7 items-center justify-center rounded-lg bg-[linear-gradient(135deg,#4f8bff,#14d2aa)]"><span className="h-3 w-3 rounded-sm border-2 border-white" /></span>qanat
        </span>
        <nav className="flex gap-9 text-[14px] text-white/65"><span>Product</span><span>Pricing</span><span>Docs</span><span>Customers</span><span>Company</span></nav>
        <span className="flex items-center gap-5 text-[14px]"><span className="text-white/70">Sign in</span><span className="rounded-full bg-white px-4 py-2 font-medium text-[#060a14]">Start building</span></span>
      </header>

      <section className="relative grid grid-cols-[1.05fr_1fr] gap-10 px-14 pt-10">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-3 py-1 text-[12.5px] text-white/80">
            <span className="rounded-full bg-[#14d2aa] px-1.5 text-[10.5px] font-semibold text-[#060a14]">New</span> CliQ payouts API is live <ArrowRight className="size-3.5" />
          </span>
          <h1 className="mt-6 text-[56px] font-semibold leading-[1.02] tracking-[-0.03em]">Payments infrastructure for the Levant.</h1>
          <p className="mt-5 max-w-[470px] text-[17px] leading-relaxed text-white/60">
            Accept cards, wallets and CliQ, pay out to any Jordanian bank, and reconcile it all from one API.
          </p>
          <div className="mt-8 flex gap-3">
            <span className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[15px] font-medium text-[#060a14]">Start building <ArrowRight className="size-4" /></span>
            <span className="rounded-full border border-white/20 px-6 py-3 text-[15px]">Talk to sales</span>
          </div>
          <ul className="mt-8 flex gap-6 text-[13px] text-white/55">
            {["PCI DSS Level 1", "99.99% uptime", "JOD settlement T+1"].map((x) => <li key={x} className="flex items-center gap-1.5"><Check className="size-4 text-[#14d2aa]" />{x}</li>)}
          </ul>
        </div>

        <div className="relative">
          <div className="rounded-2xl border border-white/10 bg-[#0c1322]/90 p-5 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)] backdrop-blur">
            <div className="flex items-center justify-between text-[12px] text-white/45"><span>POST /v1/payouts</span><span className="rounded bg-[#14d2aa]/15 px-2 py-0.5 text-[#14d2aa]">201 Created</span></div>
            <pre className="mt-3 font-mono text-[12.5px] leading-[1.75] text-white/80">
{`curl https://api.qanat.io/v1/payouts \\
  -u sk_live_•••••••• \\
  -d amount=250.000 \\
  -d currency=JOD \\
  -d rail=cliq \\
  -d alias=RANIA.H`}
            </pre>
          </div>
          <div className="absolute -bottom-24 left-10 right-[-20px] rounded-2xl border border-white/10 bg-[#0f1729] p-4 shadow-2xl">
            <div className="flex items-center justify-between"><p className="text-[13px] font-medium">Volume today</p><p className="text-[12px] text-[#14d2aa]">+18.2%</p></div>
            <p className="mt-1 text-[26px] font-semibold tabular-nums">JOD 184,920</p>
            <svg viewBox="0 0 300 60" className="mt-2 h-14 w-full" preserveAspectRatio="none">
              <path d="M0 50 C 30 44, 50 48, 80 36 S 130 30, 160 24 S 220 26, 250 14 S 290 8, 300 6" fill="none" stroke="#4f8bff" strokeWidth="2.5" />
            </svg>
          </div>
        </div>
      </section>

      <footer className="absolute inset-x-0 bottom-0 border-t border-white/[0.06] px-14 py-6">
        <p className="text-[12px] uppercase tracking-[0.2em] text-white/35">Trusted by teams at</p>
        <div className="mt-3 flex justify-between text-[20px] font-semibold tracking-tight text-white/40">
          {LOGOS.map((l) => <span key={l}>{l}</span>)}
        </div>
      </footer>
    </div>
  );
}
