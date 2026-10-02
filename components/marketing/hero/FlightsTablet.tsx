import { Plane, ChevronDown, Luggage, Check, SlidersHorizontal, ArrowRight } from "lucide-react";

const DAYS = [
  ["Mon 11", "131"], ["Tue 12", "118"], ["Wed 13", "124"], ["Thu 14", "142"], ["Fri 15", "176"], ["Sat 16", "159"], ["Sun 17", "138"],
];

const FLIGHTS = [
  { dep: "13:20", arr: "17:30", dur: "3h 10m", stops: "Direct", no: "RM 614", ac: "A320neo", price: "156" },
  { dep: "19:05", arr: "23:10", dur: "3h 05m", stops: "Direct", no: "RM 618", ac: "A321", price: "149" },
  { dep: "22:40", arr: "04:55", dur: "7h 15m", stops: "1 stop · RUH", no: "RM 402", ac: "E195", price: "131", next: true },
];

const FARES = [
  { k: "Light", p: "142", f: ["7 kg cabin bag", "Seat at check-in", "No changes"] },
  { k: "Classic", p: "176", f: ["23 kg checked bag", "Choose your seat", "Change for JOD 35"], best: true },
  { k: "Flex", p: "238", f: ["2 × 23 kg bags", "Extra-legroom seat", "Free changes"] },
];

/** An airline booking flow on a tablet: results for Amman → Dubai with fares open. */
export function FlightsTablet() {
  return (
    <div className="flex h-full w-full flex-col bg-[#f3f5f9] text-[#141414]" style={{ fontFamily: "var(--font-sans)" }}>
      <header className="flex h-16 shrink-0 items-center justify-between bg-[#1f1f1f] px-8 text-white">
        <span className="flex items-center gap-2 text-[19px] font-semibold tracking-tight"><Plane className="size-5 -rotate-45 text-[#f5b73b]" /> Rum Air</span>
        <nav className="flex gap-8 text-[14px] text-white/75"><span className="text-white">Book</span><span>Manage</span><span>Check-in</span><span>Flight status</span></nav>
        <span className="flex items-center gap-4 text-[13px] text-white/80"><span>EN · JOD</span><span className="rounded-full bg-white/15 px-4 py-1.5 text-white">Sign in</span></span>
      </header>

      <div className="flex shrink-0 items-center gap-6 border-b border-black/[0.06] bg-white px-8 py-4">
        <div className="flex items-center gap-3">
          <span className="text-[26px] font-semibold tracking-tight">AMM</span>
          <ArrowRight className="size-5 text-black/35" />
          <span className="text-[26px] font-semibold tracking-tight">DXB</span>
        </div>
        <span className="h-8 w-px bg-black/10" />
        <span className="text-[14px] text-black/60">Thu 14 Nov · One way · 1 adult · Economy</span>
        <span className="ml-auto rounded-full border border-[#1f1f1f]/25 px-4 py-2 text-[13px] font-medium text-[#1f1f1f]">Modify search</span>
      </div>

      <div className="flex shrink-0 gap-2 bg-white px-8 pb-4">
        {DAYS.map(([d, p], i) => (
          <span key={d} className={`flex flex-1 flex-col items-center rounded-xl border py-2.5 ${i === 3 ? "border-[#1f1f1f] bg-[#1f1f1f] text-white" : "border-black/[0.08]"}`}>
            <span className={`text-[12px] ${i === 3 ? "text-white/70" : "text-black/50"}`}>{d} Nov</span>
            <span className={`text-[15px] font-semibold tabular-nums ${i === 1 ? "text-[#0a8a5b]" : ""}`}>JOD {p}</span>
          </span>
        ))}
      </div>

      <div className="flex min-h-0 flex-1 gap-6 px-8 pt-5">
        <aside className="flex w-[210px] shrink-0 flex-col gap-5 text-[13.5px]">
          <p className="flex items-center gap-2 font-semibold"><SlidersHorizontal className="size-4" /> Filters</p>
          {[["Stops", ["Direct (3)", "1 stop (1)"], [0]], ["Departure", ["Morning", "Afternoon", "Evening"], [0, 1, 2]]].map(([title, opts, on]) => (
            <div key={title as string}>
              <p className="text-[12px] font-medium uppercase tracking-wider text-black/45">{title as string}</p>
              {(opts as string[]).map((o, i) => (
                <p key={o} className="mt-2 flex items-center gap-2.5">
                  <span className={`flex size-[18px] items-center justify-center rounded-[5px] border ${(on as number[]).includes(i) ? "border-[#1f1f1f] bg-[#1f1f1f] text-white" : "border-black/25"}`}>
                    {(on as number[]).includes(i) ? <Check className="size-3" /> : null}
                  </span>{o}
                </p>
              ))}
            </div>
          ))}
          <div>
            <p className="text-[12px] font-medium uppercase tracking-wider text-black/45">Price</p>
            <div className="mt-3 h-1 rounded-full bg-black/10"><div className="ml-[8%] h-full w-[70%] rounded-full bg-[#1f1f1f]" /></div>
            <p className="mt-2 flex justify-between text-[12px] text-black/50"><span>JOD 131</span><span>JOD 238</span></p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <article className="rounded-2xl border-2 border-[#1f1f1f] bg-white p-5">
            <div className="flex items-center gap-6">
              <div className="text-center"><p className="text-[24px] font-semibold tabular-nums">07:45</p><p className="text-[12px] text-black/50">AMM · T1</p></div>
              <div className="flex flex-1 flex-col items-center">
                <p className="text-[12px] text-black/50">3h 05m</p>
                <div className="relative my-1 h-px w-full bg-black/20"><Plane className="absolute -top-2 left-1/2 size-4 -translate-x-1/2 rotate-45 text-[#1f1f1f]" /></div>
                <p className="text-[12px] font-medium text-[#0a8a5b]">Direct</p>
              </div>
              <div className="text-center"><p className="text-[24px] font-semibold tabular-nums">11:50</p><p className="text-[12px] text-black/50">DXB · T1</p></div>
              <div className="w-[120px] text-right"><p className="text-[12px] text-black/45">RM 612 · A320neo</p><p className="text-[20px] font-semibold">JOD 142</p></div>
              <ChevronDown className="size-5 rotate-180 text-black/40" />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {FARES.map((f) => (
                <div key={f.k} className={`relative rounded-xl border p-3.5 ${f.best ? "border-[#f5b73b] bg-[#fffaf0]" : "border-black/[0.09]"}`}>
                  {f.best ? <span className="absolute -top-2.5 left-3 rounded-full bg-[#f5b73b] px-2 py-0.5 text-[10.5px] font-semibold">Most chosen</span> : null}
                  <p className="text-[14px] font-semibold">{f.k}</p>
                  <ul className="mt-2 flex flex-col gap-1 text-[12px] text-black/60">
                    {f.f.map((x, i) => <li key={x} className="flex items-center gap-1.5">{i === 0 ? <Luggage className="size-3.5" /> : <Check className="size-3.5" />}{x}</li>)}
                  </ul>
                  <p className={`mt-3 rounded-lg py-2 text-center text-[13px] font-semibold ${f.best ? "bg-[#1f1f1f] text-white" : "bg-[#eef1f6] text-[#1f1f1f]"}`}>JOD {f.p}</p>
                </div>
              ))}
            </div>
          </article>

          {FLIGHTS.map((f) => (
            <article key={f.no} className="flex items-center gap-6 rounded-2xl bg-white px-5 py-4">
              <div className="text-center"><p className="text-[20px] font-semibold tabular-nums">{f.dep}</p><p className="text-[11.5px] text-black/50">AMM</p></div>
              <div className="flex flex-1 flex-col items-center">
                <p className="text-[11.5px] text-black/50">{f.dur}</p>
                <div className="my-1 h-px w-full bg-black/15" />
                <p className={`text-[11.5px] font-medium ${f.stops === "Direct" ? "text-[#0a8a5b]" : "text-[#b26b00]"}`}>{f.stops}</p>
              </div>
              <div className="text-center"><p className="text-[20px] font-semibold tabular-nums">{f.arr}{f.next ? <sup className="text-[10px] text-black/45"> +1</sup> : null}</p><p className="text-[11.5px] text-black/50">DXB</p></div>
              <div className="w-[120px] text-right"><p className="text-[11.5px] text-black/45">{f.no} · {f.ac}</p><p className="text-[17px] font-semibold">JOD {f.price}</p></div>
              <ChevronDown className="size-5 text-black/40" />
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
