"use client";

import { useState } from "react";
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/system/Toaster";
import { ApiError } from "@/lib/api/errors";

/**
 * A 401 inside the portal means the session is gone: it expired, or NULL
 * replaced the project's access code. Send the visitor back to sign in rather
 * than leaving them on a page of errors. (The session query itself is allowed
 * to 401: that's how signed-out is detected.)
 */
function onUnauthorized(error: unknown, queryKey?: readonly unknown[]) {
  if (!(error instanceof ApiError) || error.status !== 401 || queryKey?.[0] === "session") return;
  const path = window.location.pathname;
  if (/\/(login|team)$/.test(path)) return;
  const ar = path === "/ar" || path.startsWith("/ar/");
  window.location.assign(ar ? "/ar/login" : "/login");
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({ onError: (e, q) => onUnauthorized(e, q.queryKey) }),
        mutationCache: new MutationCache({ onError: (e) => onUnauthorized(e) }),
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: (count, e) => !(e instanceof ApiError && e.status < 500) && count < 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      <Toaster>{children}</Toaster>
    </QueryClientProvider>
  );
}
