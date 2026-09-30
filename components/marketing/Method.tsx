import { getTranslations } from "next-intl/server";
import { MethodJourney } from "./MethodJourney";

const CODES = ["G0", "G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8", "G9"] as const;

/** The ten delivery stages, shared by Home, Services and About. */
export async function Method() {
  const t = await getTranslations("home");
  return (
    <MethodJourney
      eyebrow={t("methodEyebrow")}
      title={t("methodTitle")}
      body={t("methodBody")}
      stages={CODES.map((code) => ({
        code,
        // shown as steps on the marketing site (S0–S9, user's call); the
        // portal keeps the G0–G9 gate names
        label: code.replace("G", "S"),
        name: t(`stages.${code}.name`),
        line: t(`stages.${code}.line`),
      }))}
    />
  );
}
