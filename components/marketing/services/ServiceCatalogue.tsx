import { getTranslations } from "next-intl/server";
import { SERVICE_ACCENT, SERVICE_ART } from "./ServiceArt";
import { ServiceScroller, type ServiceItem } from "./ServiceScroller";
import { SERVICE_CODES } from "@/lib/services";

const CODES = SERVICE_CODES;

/** The ten service lines as a catalogue: what each one is, what's in it, one diagram each. */
export async function ServiceCatalogue() {
  const s = await getTranslations("services");

  const items: ServiceItem[] = CODES.map((code) => {
    const Art = SERVICE_ART[code];
    return {
      code,
      name: s(`items.${code}.name`),
      description: s(`items.${code}.description`),
      includes: s.raw(`items.${code}.includes`) as string[],
      accent: SERVICE_ACCENT[code],
      art: <Art />,
    };
  });

  return (
    <ServiceScroller
      items={items}
      labels={{
        of: s("catalogue.of"),
        includes: s("catalogue.includes"),
        cta: s("catalogue.cta"),
        jump: s("catalogue.jump"),
      }}
    />
  );
}
