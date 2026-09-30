import { Search, Star, MapPin, ShieldCheck, Video, CalendarDays } from "lucide-react";

const SPECIALTIES = ["All", "Family", "Pediatrics", "Dental", "Dermatology", "Cardiology"];

const DOCTORS = [
  { i: "LK", n: "Dr. Lina Khoury", s: "Pediatrician", r: "4.9", c: "312", b: "Abdoun", next: "Today, 10:30", col: "#2f8f83", on: true },
  { i: "SA", n: "Dr. Sami Aburumman", s: "Family medicine", r: "4.8", c: "204", b: "Sweifieh", next: "Today, 16:00", col: "#6a5acd" },
  { i: "MN", n: "Dr. Maha Nasser", s: "Dermatologist", r: "4.9", c: "187", b: "Khalda", next: "Tomorrow, 09:00", col: "#c2567a" },
];

const DAYS = [["Thu", "26"], ["Fri", "27"], ["Sat", "28"], ["Sun", "29"], ["Mon", "30"]];
const SLOTS = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "16:00"];
const TAKEN = ["09:30", "11:00", "12:00"];

/** A clinic group's booking app on a portrait tablet, one slot away from booked. */
export function ClinicTablet() {
  return (
    <div className="flex h-full w-full flex-col bg-[#f5f8f8] text-[#102322]" style={{ fontFamily: "var(--font-sans)" }}>
      <header className="flex items-center justify-between px-9 pb-4 pt-8">
        <span className="flex items-center gap-2 text-[22px] font-semibold tracking-tight">
          <span className="flex size-9 items-center justify-center rounded-xl bg-[#2f8f83] text-white">+</span> Shifa
        </span>
        <span className="flex size-11 items-center justify-center rounded-full bg-[#102322] text-[14px] font-semibold text-white">OA</span>
      </header>

      <div className="px-9">
        <h1 className="text-[34px] font-semibold leading-tight tracking-tight">Book a visit</h1>
        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white px-5 py-4 text-[16px] text-black/40 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <Search className="size-5" /> Search doctors or specialties
        </div>
        <div className="mt-4 flex gap-2 overflow-hidden">
          {SPECIALTIES.map((s, i) => (
            <span key={s} className={`shrink-0 rounded-full px-4 py-2 text-[14px] ${i === 2 ? "bg-[#102322] text-white" : "bg-white text-black/60"}`}>{s}</span>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 px-9">
        {DOCTORS.map((d) => (
          <article key={d.n} className={`flex items-center gap-4 rounded-3xl bg-white p-4 ${d.on ? "ring-2 ring-[#2f8f83]" : ""}`}>
            <span className="flex size-16 items-center justify-center rounded-2xl text-[20px] font-semibold text-white" style={{ background: d.col }}>{d.i}</span>
            <div className="min-w-0 flex-1">
              <p className="text-[18px] font-semibold">{d.n}</p>
              <p className="text-[14px] text-black/50">{d.s}</p>
              <p className="mt-1 flex items-center gap-3 text-[13px] text-black/55">
                <span className="flex items-center gap-1"><Star className="size-3.5 fill-[#f5a524] text-[#f5a524]" />{d.r} ({d.c})</span>
                <span className="flex items-center gap-1"><MapPin className="size-3.5" />{d.b}</span>
              </p>
            </div>
            <span className="rounded-xl bg-[#e8f3f1] px-3 py-2 text-right text-[12.5px] text-[#2f8f83]">Next<br /><b>{d.next}</b></span>
          </article>
        ))}
      </div>

      <section className="mx-9 mt-6 flex-1 rounded-t-[32px] bg-white px-7 pt-6">
        <div className="flex items-center justify-between">
          <p className="text-[18px] font-semibold">Dr. Lina Khoury · September</p>
          <span className="flex items-center gap-1.5 text-[13px] text-[#2f8f83]"><Video className="size-4" /> Video visit available</span>
        </div>
        <div className="mt-4 grid grid-cols-5 gap-2">
          {DAYS.map(([d, n], i) => (
            <span key={n} className={`flex flex-col items-center rounded-2xl py-3 ${i === 0 ? "bg-[#2f8f83] text-white" : "bg-[#f3f6f6]"}`}>
              <span className={`text-[13px] ${i === 0 ? "text-white/80" : "text-black/45"}`}>{d}</span>
              <span className="text-[20px] font-semibold">{n}</span>
            </span>
          ))}
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2.5">
          {SLOTS.map((s) => {
            const taken = TAKEN.includes(s);
            const on = s === "10:30";
            return (
              <span key={s} className={`rounded-xl py-3 text-center text-[15px] font-medium tabular-nums ${on ? "bg-[#102322] text-white" : taken ? "bg-[#f3f6f6] text-black/25 line-through" : "border border-black/10"}`}>
                {s}
              </span>
            );
          })}
        </div>
        <p className="mt-5 flex items-center gap-2 text-[13px] text-black/55"><ShieldCheck className="size-4 text-[#2f8f83]" /> Most local insurers accepted · pay at the clinic</p>
        <div className="mt-5 flex items-center gap-2 rounded-2xl bg-[#102322] px-6 py-4 text-white">
          <CalendarDays className="size-5" />
          <span className="flex-1 text-[16px] font-semibold">Confirm · Thu 26 Sep, 10:30</span>
          <span className="text-[14px] text-white/70">JOD 25</span>
        </div>
      </section>
    </div>
  );
}
