import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { WorkGrid, type WorkItem } from "./WorkGrid";
import { BrowserScene, PhoneScene, GlassesScene, BROWSER_CAMERA, PHONE_CAMERA, GLASSES_CAMERA } from "./demos/Scenes";
import type { DemoModule } from "./demos/kit";
import { demo as eyewear } from "./demos/EyewearStore";
import { demo as ops } from "./demos/OpsDashboard";
import { demo as field } from "./demos/FieldApp";
import { demo as ai } from "./demos/AiWorkbench";
import { demo as analytics } from "./demos/AnalyticsBoard";
import { demo as assessment } from "./demos/SecurityConsole";
import { demo as soc } from "./demos/SocWatch";
import { demo as pipeline } from "./demos/PipelineView";
import { demo as integration } from "./demos/IntegrationFlow";
import { demo as desk } from "./demos/ServiceDesk";

type Shot = Pick<WorkItem, "scene" | "camera" | "demo">;

/** A demo's opening frame, server-rendered: no state, no JS for the card. */
function still<S, A>(d: DemoModule<S, A>): ReactNode {
  const View = d.View;
  return <View s={d.initial} />;
}

function browser(url: string, demo: ReactNode): Shot {
  return { scene: <BrowserScene url={url}>{demo}</BrowserScene>, camera: BROWSER_CAMERA, demo };
}

/** One shot per service line: the scene you start on, the product you land in. */
const SHOTS: Record<string, Shot> = {
  S1: { scene: <GlassesScene>{still(eyewear)}</GlassesScene>, camera: GLASSES_CAMERA, demo: still(eyewear) },
  S2: browser("fleetline.app/overview", still(ops)),
  S3: { scene: <PhoneScene>{still(field)}</PhoneScene>, camera: PHONE_CAMERA, demo: still(field) },
  S4: browser("clause.app/contracts", still(ai)),
  S5: browser("insight.app/revenue", still(analytics)),
  S6: browser("review.app/findings", still(assessment)),
  S7: browser("watchfloor.app/live", still(soc)),
  S8: browser("deploy.app/pipelines", still(pipeline)),
  S9: browser("connect.app/flows", still(integration)),
  S10: browser("desk.app/queue", still(desk)),
};

const ORDER = ["S1", "S2", "S4", "S3", "S6", "S7", "S5", "S8", "S9", "S10"] as const;

/** Each card wears its product's colours, so the stack alternates light and dark. */
/**
 * Card grounds from the brand palette (docs/brand-palette.md), alternating
 * light and dark in display order (S1, S2, S4, S3, S6, S7, S5, S8, S9, S10)
 * so the stack reads as a rhythm: Paper/Mist tints against Navy/Graphite.
 */
const PALETTE: Record<string, { bg: string; fg: string }> = {
  S1: { bg: "#f2f2f2", fg: "#0a0a0a" },
  S2: { bg: "#161616", fg: "#fafafa" },
  S4: { bg: "#e9e9e9", fg: "#0a0a0a" },
  S3: { bg: "#0d1b2a", fg: "#fafafa" },
  S6: { bg: "#f2f2f2", fg: "#0a0a0a" },
  S7: { bg: "#161616", fg: "#fafafa" },
  S5: { bg: "#e9e9e9", fg: "#0a0a0a" },
  S8: { bg: "#161616", fg: "#fafafa" },
  S9: { bg: "#f2f2f2", fg: "#0a0a0a" },
  S10: { bg: "#0d1b2a", fg: "#fafafa" },
};

/**
 * All ten service lines as zoom-through cards; clicking one opens it live.
 * `full` is the Services page variant: the page supplies its own heading, and
 * each card carries its description.
 */
export async function FeaturedWork({ full = false }: { full?: boolean }) {
  const t = await getTranslations("home");
  const s = await getTranslations("services");

  const items: WorkItem[] = ORDER.map((code) => ({
    code,
    name: s(`items.${code}.name`),
    tag: t(`workTags.${code}`),
    description: s(`items.${code}.description`),
    ...PALETTE[code],
    ...SHOTS[code],
  }));

  return (
    <WorkGrid
      eyebrow={full ? undefined : t("servicesEyebrow")}
      title={full ? undefined : t("workTitle")}
      intro={full ? undefined : t("workIntro")}
      link={full ? undefined : t("workLink")}
      note={t("workNote")}
      labels={{
        open: t("demo.open"),
        hint: t("demo.hint"),
        live: t("demo.live"),
        close: t("demo.close"),
        ctaLine: t("demo.ctaLine"),
        cta: t("demo.cta"),
        loading: t("demo.loading"),
      }}
      items={items}
    />
  );
}
