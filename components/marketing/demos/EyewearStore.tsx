import { Search, ShoppingBag, User, Truck, Ruler, RotateCcw, Star } from "lucide-react";
import { defineDemo, on, type ViewProps } from "./kit";

type Shape = "square" | "round" | "cat";
type Cat = "all" | "optical" | "sun";

const PRODUCTS = [
  { id: "ravine", name: "Ravine", cat: "optical", shape: "square", material: "Matte titanium", size: "49□20 145", price: 145, colors: [["Onyx", "#1d1d21"], ["Bronze", "#8a6a45"], ["Slate", "#66737f"]] },
  { id: "petra", name: "Petra", cat: "optical", shape: "round", material: "Hand-polished acetate", size: "47□21 145", price: 120, colors: [["Amber", "#8b4a2b"], ["Onyx", "#1d1d21"], ["Honey", "#c8a27a"]] },
  { id: "wadi", name: "Wadi", cat: "sun", shape: "square", material: "Steel, polarised", size: "52□19 145", price: 165, colors: [["Gunmetal", "#3b3b40"], ["Gold", "#b08d57"], ["Olive", "#2d4a3e"]] },
  { id: "dana", name: "Dana", cat: "optical", shape: "cat", material: "Acetate, crystal rose", size: "50□18 140", price: 130, colors: [["Rose", "#c98f8b"], ["Onyx", "#1d1d21"], ["Tortoise", "#7a5237"]] },
  { id: "rum", name: "Rum", cat: "sun", shape: "round", material: "Titanium, gradient lens", size: "51□20 145", price: 180, colors: [["Gold", "#b08d57"], ["Onyx", "#1d1d21"], ["Silver", "#9aa0a7"]] },
  { id: "ajloun", name: "Ajloun", cat: "optical", shape: "square", material: "Recycled acetate", size: "48□20 145", price: 110, colors: [["Moss", "#4a5a3c"], ["Onyx", "#1d1d21"], ["Amber", "#8b4a2b"]] },
] as const;

type Product = (typeof PRODUCTS)[number];
const LENSES = ["Single vision", "Blue-light", "Non-prescription"];

type S = { product: Product["id"]; color: number; lens: number; cat: Cat; bag: number; flash: number };
type A =
  | { t: "select"; id: Product["id"] }
  | { t: "color"; i: number }
  | { t: "lens"; i: number }
  | { t: "cat"; c: Cat }
  | { t: "add" };

const find = (id: string) => PRODUCTS.find((p) => p.id === id) ?? PRODUCTS[0];

/** A drawn frame — crisp at any zoom, recolours with the swatch. */
export function Frame({ shape, color, sun = false, className = "" }: { shape: Shape; color: string; sun?: boolean; className?: string }) {
  const lens = (x: number) =>
    shape === "round" ? (
      <circle cx={x} cy={48} r={31} />
    ) : shape === "cat" ? (
      <path d={`M${x - 42} 34 Q${x - 44} 20 ${x - 26} 20 L${x + 30} 18 Q${x + 46} 18 ${x + 42} 36 Q${x + 36} 74 ${x} 76 Q${x - 38} 76 ${x - 42} 34 Z`} />
    ) : (
      <rect x={x - 44} y={20} width={88} height={56} rx={22} />
    );
  const id = `lens-${shape}-${sun ? "s" : "o"}`;
  return (
    <svg viewBox="0 0 240 96" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={sun ? "#2b2d33" : "#eef2f7"} stopOpacity={sun ? 0.9 : 0.55} />
          <stop offset="1" stopColor={sun ? "#55505a" : "#cfd9e6"} stopOpacity={sun ? 0.85 : 0.35} />
        </linearGradient>
      </defs>
      <g fill={`url(#${id})`}>
        {lens(62)}
        {lens(178)}
      </g>
      <g fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="3" strokeLinecap="round">
        <path d="M34 36 q6 -9 18 -11" />
        <path d="M150 36 q6 -9 18 -11" />
      </g>
      <g fill="none" stroke={color} strokeWidth="6" strokeLinejoin="round">
        {lens(62)}
        {lens(178)}
        <path d="M104 40 q16 -12 32 0" strokeLinecap="round" />
        <path d="M18 36 L4 30" strokeLinecap="round" />
        <path d="M222 36 L236 30" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function View({ s, act }: ViewProps<S, A>) {
  const p = find(s.product);
  const [colorName, colorHex] = p.colors[s.color] ?? p.colors[0];
  const shelf = PRODUCTS.filter((x) => s.cat === "all" || x.cat === s.cat).slice(0, 5);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#f7f4ee] text-[#17161a]">
      <div className="flex h-8 shrink-0 items-center justify-center bg-[#17161a] text-[12px] tracking-wide text-white/80">
        Free fitting at our Amman studio · Prescription lenses cut in four working days
      </div>

      <header className="flex h-16 shrink-0 items-center justify-between border-b border-black/[0.08] px-10">
        <span className="text-[22px] font-semibold tracking-[0.42em]">OPTIQ</span>
        <nav className="flex gap-9 text-[14px] text-black/60">
          <span className="text-black">Optical</span>
          <span>Sunglasses</span>
          <span>Lenses</span>
          <span>Studios</span>
        </nav>
        <div className="flex items-center gap-5 text-black/70">
          <Search className="size-[18px]" />
          <User className="size-[18px]" />
          <span className="relative">
            <ShoppingBag className="size-[19px]" />
            <span className="absolute -right-2.5 -top-2 flex size-[18px] items-center justify-center rounded-full bg-[#17161a] text-[10px] font-semibold text-white">
              {s.bag}
            </span>
          </span>
        </div>
      </header>

      <main className="grid h-[436px] shrink-0 grid-cols-[1.28fr_1fr] grid-rows-[minmax(0,1fr)] gap-8 px-10 pt-6">
        <section className="relative overflow-hidden rounded-[22px] bg-[radial-gradient(120%_90%_at_50%_20%,#fbf9f5_0%,#e9e3d8_60%,#ddd4c5_100%)]">
          <span className="absolute left-6 top-5 rounded-full bg-white/80 px-3 py-1 text-[11px] font-medium tracking-wide">
            New · 2026
          </span>
          <span className="absolute right-6 top-5 text-[12px] text-black/45">{colorName}</span>
          <div className="absolute left-1/2 top-[48%] w-[74%] -translate-x-1/2 -translate-y-1/2">
            <Frame shape={p.shape} color={colorHex} sun={p.cat === "sun"} className="w-full drop-shadow-[0_18px_18px_rgba(0,0,0,0.18)]" />
          </div>
          <div className="absolute bottom-[58px] left-1/2 h-4 w-[52%] -translate-x-1/2 rounded-[50%] bg-black/10 blur-md" />
          <div className="absolute inset-x-0 bottom-5 flex justify-center gap-2">
            {["Front", "Side", "Folded"].map((v, i) => (
              <span
                key={v}
                className={`rounded-full px-3.5 py-1.5 text-[11px] ${i === 0 ? "bg-[#17161a] text-white" : "bg-white/70 text-black/55"}`}
              >
                {v}
              </span>
            ))}
          </div>
        </section>

        <section className="flex min-h-0 flex-col">
          <p className="text-[12px] text-black/45">
            {p.cat === "sun" ? "Sunglasses" : "Optical"} / {p.material.split(",")[0]}
          </p>
          <h1 className="mt-1 text-[36px] font-semibold leading-none tracking-[-0.02em]">{p.name}</h1>
          <p className="mt-2 text-[14px] text-black/55">
            {p.material} · <span className="font-mono text-[12px]">{p.size}</span>
          </p>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-[24px] font-semibold">JOD {p.price}</span>
            <span className="flex items-center gap-1 text-[12px] text-black/50">
              <Star className="size-3.5 fill-[#17161a] text-[#17161a]" /> 4.9 · 212 reviews
            </span>
          </div>

          <p className="mt-4 text-[12px] font-medium text-black/60">Colour · {colorName}</p>
          <div className="mt-2 flex gap-2.5">
            {p.colors.map(([name, hex], i) => (
              <button
                key={name}
                type="button"
                onClick={on(act, { t: "color", i })}
                className={`size-8 rounded-full border-2 transition ${i === s.color ? "border-[#17161a]" : "border-transparent"}`}
                aria-label={name}
              >
                <span className="block size-full rounded-full border-[3px] border-[#f7f4ee]" style={{ background: hex }} />
              </button>
            ))}
          </div>

          <p className="mt-3 text-[12px] font-medium text-black/60">Lenses</p>
          <div className="mt-2 flex gap-2">
            {LENSES.map((l, i) => (
              <button
                key={l}
                type="button"
                onClick={on(act, { t: "lens", i })}
                className={`rounded-full border px-3.5 py-1.5 text-[12px] transition ${i === s.lens ? "border-[#17161a] bg-[#17161a] text-white" : "border-black/15 text-black/65 hover:border-black/40"}`}
              >
                {l}
              </button>
            ))}
          </div>

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={on(act, { t: "add" })}
              className="flex-1 rounded-full bg-[#17161a] py-3.5 text-[14px] font-medium text-white transition hover:bg-black"
            >
              Add to bag · JOD {p.price}
            </button>
            <button type="button" className="rounded-full border border-black/20 px-6 text-[14px]">
              Book a fitting
            </button>
          </div>

          <ul className="mt-4 flex flex-col gap-1.5 text-[12.5px] text-black/60">
            <li className="flex items-center gap-2.5"><Truck className="size-4" /> Dispatched in four working days, Amman to Aqaba</li>
            <li className="flex items-center gap-2.5"><Ruler className="size-4" /> Measure your fit from one selfie</li>
            <li className="flex items-center gap-2.5"><RotateCcw className="size-4" /> Free adjustments for a year</li>
          </ul>
        </section>
      </main>

      <section className="mt-5 min-h-0 flex-1 border-t border-black/[0.08] px-10 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {(["all", "optical", "sun"] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={on(act, { t: "cat", c })}
                className={`rounded-full px-4 py-1.5 text-[13px] transition ${s.cat === c ? "bg-[#17161a] text-white" : "text-black/55 hover:text-black"}`}
              >
                {c === "all" ? "All frames" : c === "optical" ? "Optical" : "Sunglasses"}
              </button>
            ))}
          </div>
          <span className="text-[12px] text-black/45">48 frames · new in this week</span>
        </div>
        <div className="mt-4 grid grid-cols-5 gap-4">
          {shelf.map((x) => (
            <button
              key={x.id}
              type="button"
              onClick={on(act, { t: "select", id: x.id })}
              className={`rounded-2xl bg-white p-3 text-left transition ${x.id === p.id ? "ring-2 ring-[#17161a]" : "ring-1 ring-black/[0.06] hover:ring-black/20"}`}
            >
              <div className="rounded-xl bg-[#f1ede5] px-3 py-4">
                <Frame shape={x.shape} color={x.colors[0][1]} sun={x.cat === "sun"} className="w-full" />
              </div>
              <div className="mt-2.5 flex items-baseline justify-between">
                <span className="text-[13px] font-medium">{x.name}</span>
                <span className="text-[12px] text-black/55">JOD {x.price}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {s.flash > 0 ? (
        <div
          key={s.flash}
          className="ns-toast absolute bottom-7 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full bg-[#17161a] px-5 py-3 text-[13px] text-white shadow-xl"
        >
          <ShoppingBag className="size-4" /> {p.name} in {colorName} added to your bag
        </div>
      ) : null}
    </div>
  );
}

export const demo = defineDemo<S, A>({
  initial: { product: "ravine", color: 0, lens: 0, cat: "all", bag: 1, flash: 0 },
  reduce(s, a) {
    switch (a.t) {
      case "select":
        return { ...s, product: a.id, color: 0 };
      case "color":
        return { ...s, color: a.i };
      case "lens":
        return { ...s, lens: a.i };
      case "cat":
        return { ...s, cat: a.c };
      case "add":
        return { ...s, bag: s.bag + 1, flash: s.flash + 1 };
    }
  },
  View,
});
