"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { MOCKS_ENABLED } from "@/lib/env";
import { api } from "@/lib/api/endpoints";
import { useSession } from "@/hooks/useSession";
import { useToast } from "./Toaster";

/**
 * Keeps the portal live. In live mode it opens the SignalR connection and maps
 * hub events onto the query cache. In mock mode there is no hub, so it polls the
 * mock store's unread count and behaves the same way when it goes up — an admin
 * advancing a gate in one tab shows up live in the client's tab.
 */
export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient();
  const toast = useToast();
  const t = useTranslations("notifications");
  const { data: session } = useSession();
  const active = !!session;

  useEffect(() => {
    if (!active) return;

    if (MOCKS_ENABLED) {
      let last: number | null = null;
      const check = () =>
        api
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
      check();
      const timer = window.setInterval(check, 8000);
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
