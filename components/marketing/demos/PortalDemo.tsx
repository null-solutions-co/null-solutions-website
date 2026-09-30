/**
 * NULL's own client portal, as the hero shows it — the one product on the
 * page that is real rather than a concept build. Light ground, the company
 * logo, navy for the one accent. Steps are S0–S9, as the home page calls
 * them. Bilingual because the portal is.
 */

import { BrandLogo } from "@/components/brand/BrandLogo";

const COPY = {
  en: {
    nav: ["Overview", "Project", "Invoices", "Files", "Requests", "Notifications"],
    hello: "Welcome back",
    onTrack: "On track",
    project: "Customer portal rebuild",
    line: "S2 · Software",
    complete: "complete",
    gates: "6 of 10 steps done",
    next: "Now in",
    nextGate: "S6 · Testing",
    eta: "Estimated handover",
    etaDate: "12 Nov 2026",
    gatesTitle: "Your project, step by step",
    gateNames: ["First call", "Discovery", "Scope", "Plan", "Design", "Build", "Testing", "Security", "Launch", "Support"],
    balance: "Outstanding",
    invoice: "INV-2026-031 · due 30 Sep",
    pay: "Bank transfer or CliQ",
    files: "Latest files",
    update: "Latest update",
    updateBody: "Staging build 0.9 is live. Checkout and invoicing are ready for your review.",
    updateTime: "2 hours ago",
  },
  ar: {
    nav: ["نظرة عامة", "المشروع", "الفواتير", "الملفات", "الطلبات", "الإشعارات"],
    hello: "أهلًا بعودتك",
    onTrack: "ضمن الجدول",
    project: "إعادة بناء بوابة العملاء",
    line: "S2 · البرمجيات",
    complete: "مُنجَز",
    gates: "اكتملت 6 من 10 مراحل",
    next: "الآن في",
    nextGate: "S6 · الاختبار",
    eta: "التسليم المتوقّع",
    etaDate: "12 نوفمبر 2026",
    gatesTitle: "مشروعك، خطوة بخطوة",
    gateNames: ["أول لقاء", "فهم المشكلة", "النطاق", "الخطة", "التصميم", "البناء", "الاختبار", "الفحص الأمني", "الإطلاق", "الدعم"],
    balance: "المستحق",
    invoice: "INV-2026-031 · تستحق 30 سبتمبر",
    pay: "حوالة بنكية أو CliQ",
    files: "آخر الملفات",
    update: "آخر تحديث",
    updateBody: "نسخة الاختبار 0.9 صارت متاحة. الدفع والفوترة جاهزان لمراجعتك.",
    updateTime: "قبل ساعتين",
  },
} as const;

const FILES = ["design-system-v2.pdf", "sprint-review-11.pdf", "api-contract-1.4.yaml"];

const NAVY = "#0d1b2a";
const DONE = 5; // S0–S5 done; S6 is current

function Ring({ value }: { value: number }) {
  const r = 58;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 140 140" className="size-[150px]">
      <circle cx="70" cy="70" r={r} fill="none" stroke="#e2e6e2" strokeWidth="9" />
      <circle
        cx="70"
        cy="70"
        r={r}
        fill="none"
        stroke={NAVY}
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray={`${(c * value) / 100} ${c}`}
        transform="rotate(-90 70 70)"
      />
    </svg>
  );
}

export function PortalDemo({ locale }: { locale: string }) {
  const t = COPY[locale === "ar" ? "ar" : "en"];
  const rtl = locale === "ar";

  return (
    <div
      dir={rtl ? "rtl" : "ltr"}
      className="flex h-full w-full overflow-hidden bg-[#f5f7f5] text-[#0b0e14]"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      <aside className="flex w-[232px] shrink-0 flex-col border-e border-[#e2e6e2] bg-white px-5 py-6">
        <div className="flex items-center" dir="ltr">
          <BrandLogo className="h-9 w-auto" />
        </div>
        <nav className="mt-9 flex flex-col gap-1 text-[15px]">
          {t.nav.map((item, i) => (
            <span
              key={item}
              className={
                i === 0
                  ? "flex items-center justify-between rounded-md bg-[#0b0e14] px-3.5 py-2.5 text-white"
                  : "flex items-center justify-between rounded-md px-3.5 py-2.5 text-[#586173]"
              }
            >
              {item}
              {i === 5 ? (
                <span className="rounded-full px-2 py-0.5 font-mono text-[11px] text-white" style={{ background: NAVY }}>
                  2
                </span>
              ) : null}
            </span>
          ))}
        </nav>
      </aside>

      <main className="flex-1 px-9 py-8">
        <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-[#586173]">{t.hello}</p>
        <div className="mt-2 flex items-end justify-between">
          <div>
            <h1 className="text-[30px] font-semibold tracking-[-0.01em]">{t.project}</h1>
            <p className="mt-1 font-mono text-[13px] text-[#586173]">{t.line}</p>
          </div>
          <span className="rounded-full border border-[#e2e6e2] bg-white px-4 py-2 font-mono text-[12px] text-[#15734a]">
            ● {t.onTrack}
          </span>
        </div>

        <div className="mt-7 grid grid-cols-[1.25fr_1fr] gap-5">
          <section className="flex items-center gap-7 rounded-lg border border-[#e2e6e2] bg-white p-6">
            <div className="relative">
              <Ring value={64} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-[34px] font-semibold tracking-tight">64%</span>
                <span className="text-[12px] text-[#586173]">{t.complete}</span>
              </div>
            </div>
            <dl className="flex flex-col gap-4">
              <div>
                <dt className="text-[12px] text-[#586173]">{t.gates}</dt>
                <dd className="mt-0.5 text-[15px] font-medium">
                  {t.next} <span className="font-mono">{t.nextGate}</span>
                </dd>
              </div>
              <div>
                <dt className="text-[12px] text-[#586173]">{t.eta}</dt>
                <dd className="mt-0.5 font-mono text-[15px]">{t.etaDate}</dd>
              </div>
            </dl>
          </section>

          <section className="flex flex-col justify-between rounded-lg border border-[#e2e6e2] bg-white p-6">
            <p className="text-[12px] text-[#586173]">{t.balance}</p>
            <p className="font-mono text-[34px] font-semibold tracking-tight">JOD 4,800</p>
            <div>
              <p className="font-mono text-[13px]">{t.invoice}</p>
              <p className="text-[12px] text-[#586173]">{t.pay}</p>
            </div>
          </section>
        </div>

        <section className="mt-5 rounded-lg border border-[#e2e6e2] bg-white p-6">
          <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[#586173]">{t.gatesTitle}</p>
          <div className="mt-5 flex items-start">
            {t.gateNames.map((name, i) => (
              <div key={name} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full items-center">
                  <span className={`h-[3px] flex-1 ${i === 0 ? "opacity-0" : i <= DONE + 1 ? "bg-[#0b0e14]" : "bg-[#e2e6e2]"}`} />
                  <span
                    className="flex size-7 shrink-0 items-center justify-center rounded-full border-2 font-mono text-[10px]"
                    style={
                      i <= DONE
                        ? { background: "#0b0e14", borderColor: "#0b0e14", color: "#fff" }
                        : i === DONE + 1
                          ? { background: "#fff", borderColor: NAVY, color: "#0b0e14", boxShadow: `0 0 0 4px ${NAVY}22` }
                          : { background: "#fff", borderColor: "#e2e6e2", color: "#586173" }
                    }
                  >
                    S{i}
                  </span>
                  <span className={`h-[3px] flex-1 ${i === 9 ? "opacity-0" : i <= DONE ? "bg-[#0b0e14]" : "bg-[#e2e6e2]"}`} />
                </div>
                <span className={`text-[12px] ${i === DONE + 1 ? "font-medium text-[#0b0e14]" : "text-[#586173]"}`}>{name}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-5 grid grid-cols-[1fr_1.25fr] gap-5">
          <section className="rounded-lg border border-[#e2e6e2] bg-white p-6">
            <p className="text-[12px] text-[#586173]">{t.files}</p>
            <ul className="mt-3 flex flex-col gap-2.5" dir="ltr">
              {FILES.map((f) => (
                <li key={f} className="flex items-center gap-3 font-mono text-[13px]">
                  <span className="size-2 rounded-sm bg-[#0b0e14]" />
                  {f}
                </li>
              ))}
            </ul>
          </section>
          <section className="rounded-lg border border-[#e2e6e2] bg-white p-6">
            <div className="flex items-center justify-between">
              <p className="text-[12px] text-[#586173]">{t.update}</p>
              <p className="font-mono text-[12px] text-[#586173]">{t.updateTime}</p>
            </div>
            <p className="mt-3 text-[15px] leading-relaxed">{t.updateBody}</p>
          </section>
        </div>
      </main>
    </div>
  );
}
