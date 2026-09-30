/**
 * Where the portal gets its data.
 *
 * - "live": the BFF talks to NEXT_PUBLIC_API_URL.
 * - "mock": the in-process mock backend (mocks/). The default in development.
 * - "off":  a production build with no mode set. The public site works, the
 *   portal answers 503. Mock mode never switches itself on in production,
 *   because its data lives in memory and it ships seeded test access.
 */
const requested = process.env.NEXT_PUBLIC_API_MODE;
const production = process.env.NODE_ENV === "production";

export const API_MODE: "mock" | "live" | "off" =
  requested === "live" ? "live" : requested === "mock" ? "mock" : production ? "off" : "mock";

export const MOCKS_ENABLED = API_MODE === "mock";
export const PORTAL_ENABLED = API_MODE !== "off";
