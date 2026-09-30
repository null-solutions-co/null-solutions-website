import {
  Home, Wallet, CreditCard, ArrowLeftRight, Zap, Receipt, PiggyBank, FileText, Bell, Search,
  ArrowUpRight, ArrowDownLeft, Plus, Smartphone, Wifi, Snowflake, CalendarClock,
} from "lucide-react";

const NAV = [
  ["Home", Home], ["Accounts", Wallet], ["Cards", CreditCard], ["Transfers", ArrowLeftRight],
  ["CliQ", Zap], ["Bills", Receipt], ["Savings", PiggyBank], ["Statements", FileText],
] as const;

const TX = [
  { n: "Salary · Aqaba Logistics", c: "Income", d: "25 Sep", a: "+2,400.000", in: true, col: "#0e7c66" },
  { n: "Al Waha Supermarket", c: "Groceries", d: "24 Sep", a: "−42.300", col: "#e0913a" },
  { n: "CliQ to KHALED.S", c: "Transfer", d: "24 Sep", a: "−60.000", col: "#5b6ee1" },
  { n: "Mobile bill", c: "Bills", d: "22 Sep", a: "−18.000", col: "#8a5cd6" },
  { n: "Jabal Coffee", c: "Dining", d: "22 Sep", a: "−3.750", col: "#c2567a" },
  { n: "Electricity bill", c: "Bills", d: "20 Sep", a: "−37.420", col: "#8a5cd6" },
];

const SPEND = [
  { k: "Groceries", v: 312, c: "#e0913a" },
  { k: "Bills", v: 214, c: "#8a5cd6" },
  { k: "Shopping", v: 180, c: "#3a8fd6" },
  { k: "Dining", v: 148, c: "#c2567a" },
  { k: "Transport", v: 96, c: "#2fa38a" },
];

/** Online banking, the way a Jordanian retail bank's web app actually reads. */
export function BankWeb() {
  const total = SPEND.reduce((s, x) => s + x.v, 0);
  return (
    <div className="flex h-full w-full bg-[#f4f6f5] text-[#101816]" style={{ fontFamily: "var(--font-sans)" }}>
      <aside className="flex w-[248px] shrink-0 flex-col border-r border-black/[0.06] bg-white px-5 py-6">
        <div className="flex items-center gap-2.5 px-2">
          <svg viewBox="0 0 32 32" className="size-8" aria-hidden="true">
            <rect width="32" height="32" rx="9" fill="#0e7c66" />
            <path d="M9 20.5c0-2.6 2-4.6 4.5-4.6.3-2.4 2.3-4.2 4.8-4.2 2.4 0 4.4 1.7 4.8 4 2 .3 3.4 2 3.4 4 0 .3 0 .5-.1.8H9.1c-.1 0-.1 0-.1 0Z" fill="#fff" />
          </svg>
          <span className="text-[20px] font-semibold tracking-tight">sahab</span>
        </div>
        <nav className="mt-9 flex flex-col gap-1">
          {NAV.map(([label, Icon], i) => (
            <span key={label} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14.5px] ${i === 0 ? "bg-[#0e7c66]/10 font-medium text-[#0e7c66]" : "text-black/55"}`}>
              <Icon className="size-[18px]" /> {label}
            </span>
          ))}
        </nav>
        <div className="mt-auto rounded-2xl bg-[#0e7c66] p-4 text-white">
          <p className="text-[13px] font-medium">Get the app</p>
          <p className="mt-1 text-[12px] text-white/75">Approve payments with Face ID.</p>
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-2.5 py-1.5 text-[12px]"><Smartphone className="size-3.5" /> Scan QR</span>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col px-9 py-6">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-[13px] text-black/45">Thursday, 26 September</p>
            <h1 className="mt-0.5 text-[26px] font-semibold tracking-tight">Good morning, Rania</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex w-[300px] items-center gap-2 rounded-xl border border-black/[0.08] bg-white px-3.5 py-2.5 text-[13.5px] text-black/40">
              <Search className="size-4" /> Search transactions, payees…
            </span>
            <span className="relative flex size-10 items-center justify-center rounded-xl border border-black/[0.08] bg-white">
              <Bell className="size-[18px] text-black/60" /><span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-[#e5484d]" />
            </span>
            <span className="flex size-10 items-center justify-center rounded-full bg-[#1c2b28] text-[13px] font-semibold text-white">RH</span>
          </div>
        </header>

        <div className="mt-6 grid min-h-0 flex-1 grid-cols-[1fr_340px] gap-6">
          <div className="flex min-h-0 flex-col gap-6">
            <section className="rounded-3xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[13px] text-black/50">Total balance</p>
                  <p className="mt-1 text-[38px] font-semibold tracking-tight tabular-nums">JOD 18,420<span className="text-black/35">.550</span></p>
                  <p className="mt-1 flex items-center gap-1 text-[13px] text-[#0e7c66]"><ArrowUpRight className="size-4" /> JOD 1,240.000 in this month</p>
                </div>
                <div className="flex gap-2">
                  {[["Transfer", ArrowLeftRight], ["CliQ", Zap], ["Pay bill", Receipt], ["Top up", Plus]].map(([l, I]) => {
                    const Icon = I as typeof Zap;
                    return (
                      <span key={l as string} className="flex w-[76px] flex-col items-center gap-1.5 rounded-2xl bg-[#f4f6f5] py-3 text-[12px] text-black/70">
                        <span className="flex size-9 items-center justify-center rounded-full bg-[#0e7c66] text-white"><Icon className="size-4" /></span>{l as string}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-black/[0.07] p-4">
                  <p className="text-[12px] text-black/45">Current account ·· 2210</p>
                  <p className="mt-1 text-[18px] font-semibold tabular-nums">JOD 6,120.550</p>
                </div>
                <div className="rounded-2xl border border-black/[0.07] p-4">
                  <p className="text-[12px] text-black/45">Savings account ·· 8841</p>
                  <p className="mt-1 text-[18px] font-semibold tabular-nums">JOD 12,300.000</p>
                </div>
              </div>
            </section>

            <section className="flex min-h-0 flex-1 flex-col rounded-3xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between">
                <p className="text-[16px] font-semibold">Recent activity</p>
                <span className="text-[13px] font-medium text-[#0e7c66]">See all</span>
              </div>
              <ul className="mt-3 flex flex-col">
                {TX.map((t) => (
                  <li key={t.n} className="flex items-center gap-4 border-b border-black/[0.05] py-3 last:border-0">
                    <span className="flex size-10 items-center justify-center rounded-full text-[14px] font-semibold text-white" style={{ background: t.col }}>
                      {t.in ? <ArrowDownLeft className="size-4" /> : t.n[0]}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14.5px] font-medium">{t.n}</span>
                      <span className="text-[12.5px] text-black/45">{t.c} · {t.d}</span>
                    </span>
                    <span className={`text-[14.5px] font-semibold tabular-nums ${t.in ? "text-[#0e7c66]" : ""}`}>{t.a}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="flex flex-col gap-6">
            <section className="relative h-[200px] overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#0e7c66_0%,#0a4a40_55%,#07231f_100%)] p-6 text-white shadow-[0_20px_40px_-20px_rgba(14,124,102,0.6)]">
              <div className="absolute -right-10 -top-16 size-48 rounded-full bg-white/10" />
              <div className="flex items-center justify-between">
                <span className="text-[16px] font-semibold tracking-tight">sahab</span>
                <Wifi className="size-5 rotate-90 text-white/80" />
              </div>
              <span className="mt-6 block h-8 w-11 rounded-md bg-[linear-gradient(135deg,#f1d58a,#b8903e)]" />
              <p className="mt-4 font-mono text-[17px] tracking-[0.16em]">•••• •••• •••• 4821</p>
              <div className="mt-2 flex justify-between text-[11px] uppercase tracking-wider text-white/70"><span>Rania Haddad</span><span>Debit · 09/29</span></div>
            </section>

            <section className="rounded-3xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <p className="text-[14px] font-semibold">Card controls</p>
              {[["Online payments", true, CreditCard], ["Contactless", true, Wifi], ["Freeze card", false, Snowflake]].map(([l, on, I]) => {
                const Icon = I as typeof Wifi;
                return (
                  <div key={l as string} className="mt-3 flex items-center gap-3 text-[13.5px]">
                    <Icon className="size-4 text-black/45" /><span className="flex-1">{l as string}</span>
                    <span className={`flex h-6 w-10 items-center rounded-full p-0.5 ${on ? "justify-end bg-[#0e7c66]" : "bg-black/15"}`}><span className="size-5 rounded-full bg-white shadow" /></span>
                  </div>
                );
              })}
            </section>

            <section className="rounded-3xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <div className="flex items-baseline justify-between">
                <p className="text-[14px] font-semibold">Spending in September</p>
                <p className="text-[13px] tabular-nums text-black/50">JOD {total}</p>
              </div>
              <div className="mt-3 flex h-2.5 overflow-hidden rounded-full">
                {SPEND.map((x) => <span key={x.k} style={{ width: `${(x.v / total) * 100}%`, background: x.c }} />)}
              </div>
              <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[12.5px]">
                {SPEND.map((x) => (
                  <li key={x.k} className="flex items-center gap-2"><span className="size-2 rounded-full" style={{ background: x.c }} /><span className="flex-1 text-black/60">{x.k}</span><span className="tabular-nums">{x.v}</span></li>
                ))}
              </ul>
            </section>

            <section className="flex items-center gap-3 rounded-3xl bg-[#fff7ea] p-4 text-[13px]">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-[#f5a524]/20 text-[#b26b00]"><CalendarClock className="size-5" /></span>
              <span className="flex-1"><span className="block font-medium">Rent due in 4 days</span><span className="text-black/50">Standing order · JOD 450.000</span></span>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
