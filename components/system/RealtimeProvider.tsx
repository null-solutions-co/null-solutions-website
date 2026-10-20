"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { MOCKS_ENABLED } from "@/lib/env";
import { api } from "@/lib/api/endpoints";
import { useSession } from "@/hooks/useSession";
import { useToast } from "./Toaster";

/**
 * SignalR only when asked for: NULL Platform (the live backend) has no hub, so
 * by default the portal polls there too. NEXT_PUBLIC_REALTIME=signalr switches
 * the hub connection on for a backend that serves /hubs/notifications.
 */
const USE_HUB = !MOCKS_ENABLED && process.env.NEXT_PUBLIC_REALTIME === "signalr";
/** Mock store is in-process and cheap to ask; the platform is asked less often. */
const POLL_MS = MOCKS_ENABLED ? 8000 : 15_000;

/**
 * Keeps the portal live. By default it polls the unread-notification count
 * and, when it goes up, refreshes the cached data and shows a toast — an admin
 * advancing a gate in one tab shows up in the client's tab. With
 * NEXT_PUBLIC_REALTIME=signalr (live mode) it opens the SignalR connection
 * instead and maps hub events onto the query cache.
 */
export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient();
  const toast = useToast();
  const t = useTranslations("notifications");
  const { data: session } = useSession();
  const active = !!session;

  useEffect(() => {
    if (!active) return;

    if (!USE_HUB) {
      let last: number | null = null;
      const check = () => {
        // a background tab doesn't need to ask; it catches up on the next tick in front
        if (document.visibilityState === "hidden") return;
        return api
          .unreadCount()
          .then(({ count }) => {
            if (last !== null && count > last) {
              for (const key of ["notifications", "project", "projects", "invoices", "documents"]) {
                qc.invalidateQueries({ queryKey: [key] });
              }
              toast.push({ title: t("live"), tone: "info" });
            }
            last = count;
          })
          .catch(() => {});
      };
      check();
      const timer = window.setInterval(check, POLL_MS);
      return () => window.clearInterval(timer);
    }

    let stopped = false;
    let connection: import("@microsoft/signalr").HubConnection | undefined;

    import("@/lib/realtime/connection").then(({ createHubConnection }) => {
      if (stopped) return;
      connection = createHubConnection();

      connection.on("notification", () => {
        qc.invalidateQueries({ queryKey: ["notifications"] });
        toast.push({ title: t("live"), tone: "info" });
      });
      connection.on("notificationRead", () =>
        qc.invalidateQueries({ queryKey: ["notifications"] }),
      );
      connection.on("projectUpdated", (p: { projectId: string }) =>
        qc.invalidateQueries({ queryKey: ["project", p.projectId] }),
      );

      connection.start().catch(() => undefined);
    });

    return () => {
      stopped = true;
      connection?.stop().catch(() => undefined);
    };
  }, [active, qc, toast, t]);

  return <>{children}</>;
}
