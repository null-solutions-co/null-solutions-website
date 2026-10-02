import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { HeroFlight, type FlightDevice } from "./HeroFlight";
import { Laptop, Tablet, Phone, Browser, type Framed } from "./hero/Devices";
import { BankWeb } from "./hero/BankWeb";
import { RidePhone } from "./hero/RidePhone";
import { FlightsTablet } from "./hero/FlightsTablet";
import { SaasLanding } from "./hero/SaasLanding";
import { WalletPhone } from "./hero/WalletPhone";
import { MarketsWeb } from "./hero/MarketsWeb";
import { ClinicTablet } from "./hero/ClinicTablet";

/** The cluster, nearest first: the kind of products we ship, on the devices they run on. */
const FLIGHT: { code: string; device: Framed }[] = [
  { code: "S2", device: Laptop({ w: 620, children: <BankWeb /> }) },
  { code: "S3", device: Phone({ w: 220, children: <RidePhone /> }) },
  { code: "S1", device: Tablet({ w: 520, children: <FlightsTablet /> }) },
  { code: "S1", device: Browser({ w: 600, url: "qanat.io", tab: "qanat · Payments API", children: <SaasLanding /> }) },
  { code: "S3", device: Phone({ w: 220, children: <WalletPhone /> }) },
  { code: "S5", device: Laptop({ w: 640, children: <MarketsWeb /> }) },
  { code: "S2", device: Tablet({ w: 320, portrait: true, children: <ClinicTablet /> }) },
];

export async function Hero() {
  const t = await getTranslations("home");
  const s = await getTranslations("services");
  const headline = t("headline");
  const accent = t("headlineAccent");
  const idx = headline.indexOf(accent);
  const before = idx >= 0 ? headline.slice(0, idx) : headline;
  const after = idx >= 0 ? headline.slice(idx + accent.length) : "";

  const devices: FlightDevice[] = FLIGHT.map((f, i) => ({
    code: f.code,
    name: s(`items.${f.code}.name`),
    ...f.device,
    // phones fly the first five as pictures (see FlightDevice.still)
    still: i < 5 ? `/hero/flight-${i}.webp` : undefined,
  }));

  return (
    <HeroFlight
      devices={devices}
      copy={
        <>
          <h1 className="ns-hero-in mkt-display max-w-[11ch] text-[clamp(2.8rem,6.2vw,6rem)]">
            {before}
            {idx >= 0 ? <span className="text-signal-ink">{accent}</span> : null}
            {after}
          </h1>


          <div className="ns-hero-in ns-hero-in--3 mt-8 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-fg px-7 py-3.5 font-mono text-xs uppercase tracking-[0.14em] max-[480px]:px-5 max-[480px]:tracking-[0.08em] text-ground transition-colors hover:bg-signal-ink hover:text-white"
            >
              {t("ctaPrimary")} <span className="rtl:rotate-180">→</span>
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 rounded-full border border-fg/20 px-7 py-3.5 font-mono text-xs uppercase tracking-[0.14em] max-[480px]:px-5 max-[480px]:tracking-[0.08em] text-fg transition-colors hover:border-fg"
            >
              {t("ctaSecondary")}
            </Link>
          </div>

        </>
      }
    />
  );
}
