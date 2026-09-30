import { ChevronLeft, Zap, ChevronsRight, Delete } from "lucide-react";

/** A wallet app mid-transfer: sending JOD 25 over CliQ to an alias. */
export function WalletPhone() {
  return (
    <div className="flex h-full w-full flex-col bg-[#15112b] text-white" style={{ fontFamily: "var(--font-sans)" }}>
      <div className="flex h-12 shrink-0 items-end justify-between px-7 pb-1 text-[14px] font-semibold"><span>9:41</span><span className="text-[11px]">5G ▮▮▮</span></div>

      <header className="flex items-center justify-between px-5 pt-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-white/10"><ChevronLeft className="size-5" /></span>
        <span className="flex items-center gap-1.5 text-[16px] font-semibold"><Zap className="size-4 text-[#b7a4ff]" /> Send with CliQ</span>
        <span className="size-10" />
      </header>

      <div className="mx-5 mt-6 flex items-center gap-3 rounded-2xl bg-white/[0.07] p-3.5">
        <span className="flex size-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#ff9a6b,#e5486d)] text-[15px] font-semibold">RH</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold">Rania Haddad</span>
          <span className="block text-[12.5px] text-white/55">Alias RANIA.H · Hijaz Bank</span>
        </span>
        <span className="rounded-full bg-white/10 px-3 py-1 text-[12px]">Change</span>
      </div>

      <div className="mt-8 flex flex-col items-center">
        <p className="text-[13px] text-white/50">Amount</p>
        <p className="mt-1 text-[52px] font-semibold tracking-tight tabular-nums">
          <span className="align-top text-[22px] text-white/60">JOD </span>25<span className="text-white/45">.000</span>
          <span className="ml-0.5 inline-block h-11 w-[3px] animate-pulse bg-[#b7a4ff] align-middle" />
        </p>
        <p className="mt-1 text-[12.5px] text-white/50">Available JOD 312.480 · No fee · Arrives instantly</p>
        <div className="mt-5 flex gap-2">
          {["10", "25", "50", "100"].map((v) => (
            <span key={v} className={`rounded-full px-4 py-1.5 text-[13px] ${v === "25" ? "bg-[#b7a4ff] text-[#15112b]" : "bg-white/10"}`}>{v}</span>
          ))}
        </div>
        <p className="mt-5 w-[330px] rounded-xl bg-white/[0.06] px-4 py-3 text-[13px] text-white/70">Note: Dinner at Sufra</p>
      </div>

      <div className="mt-auto grid grid-cols-3 gap-y-1 px-8 pb-2 text-center text-[24px] font-medium">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "del"].map((k) => (
          <span key={k} className="flex h-12 items-center justify-center">{k === "del" ? <Delete className="size-6 text-white/70" /> : k}</span>
        ))}
      </div>

      <div className="mx-5 mb-8 mt-2 flex h-14 items-center rounded-full bg-[#b7a4ff] p-1.5 text-[#15112b]">
        <span className="flex size-11 items-center justify-center rounded-full bg-[#15112b] text-white"><ChevronsRight className="size-5" /></span>
        <span className="flex-1 pr-11 text-center text-[15px] font-semibold">Slide to send JOD 25</span>
      </div>
    </div>
  );
}
