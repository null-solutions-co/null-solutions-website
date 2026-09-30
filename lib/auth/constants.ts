/**
 * Cookie name — kept here (no server-only imports) so middleware can use it too.
 * In production it carries the `__Host-` prefix: the browser then only accepts
 * it over HTTPS, for this exact host, on path `/`. No subdomain can set or
 * shadow it.
 */
export const SESSION_COOKIE = process.env.NODE_ENV === "production" ? "__Host-ns_session" : "ns_session";

/** Portal route prefixes that require a session (locale prefix stripped). */
export const PORTAL_PATH =
  /^\/(dashboard|projects|invoices|documents|notifications|requests|partner|admin)(\/|$)/;
