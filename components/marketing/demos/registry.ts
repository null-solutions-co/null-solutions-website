import type { DemoModule } from "./kit";

export type AnyDemo = DemoModule<unknown, unknown>;

const as = (m: { demo: unknown }) => m.demo as AnyDemo;

/**
 * Live demos load on demand — a visitor who never opens one never downloads
 * its state logic. The work cards only render each demo's stateless View.
 */
export const DEMO_LOADERS: Record<string, () => Promise<AnyDemo>> = {
  S1: () => import("./EyewearStore").then(as),
  S2: () => import("./OpsDashboard").then(as),
  S3: () => import("./FieldApp").then(as),
  S4: () => import("./AiWorkbench").then(as),
  S5: () => import("./AnalyticsBoard").then(as),
  S6: () => import("./SecurityConsole").then(as),
  S7: () => import("./SocWatch").then(as),
  S8: () => import("./PipelineView").then(as),
  S9: () => import("./IntegrationFlow").then(as),
  S10: () => import("./ServiceDesk").then(as),
};
