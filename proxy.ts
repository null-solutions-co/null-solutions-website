import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { PORTAL_PATH, SESSION_COOKIE } from "./lib/auth/constants";

// Next 16 renamed `middleware` → `proxy`. This runs next-intl locale routing
// and then a coarse portal auth guard (presence of the session cookie —
// fine-grained scope checks happen server-side in the BFF proxy + pages).
const handleI18nRouting = createMiddleware(routing);

export function proxy(request: NextRequest) {
  const response = handleI18nRouting(request);

  const { pathname } = request.nextUrl;
  const localePrefix = pathname.match(/^\/ar(?=\/|$)/)?.[0] ?? "";
  const bare = pathname.slice(localePrefix.length) || "/";

  if (PORTAL_PATH.test(bare) && !request.cookies.has(SESSION_COOKIE)) {
    const url = request.nextUrl.clone();
    url.pathname = `${localePrefix}/login`;
    url.search = "";
    url.searchParams.set("from", bare);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
