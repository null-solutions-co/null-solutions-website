import {
  HubConnectionBuilder,
  HttpTransportType,
  LogLevel,
  type HubConnection,
} from "@microsoft/signalr";

/**
 * SignalR connection to the notifications hub. The browser can't read the
 * httpOnly session cookie, so `accessTokenFactory` fetches a short-lived token
 * from the BFF (`/api/realtime-token`); SignalR sends it as `?access_token=`
 * on the WebSocket handshake. See docs/api-contract.md §10.
 */
export function createHubConnection(): HubConnection {
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ?? "";

  return new HubConnectionBuilder()
    // ?lang= picks the language of the notifications pushed to this connection
    .withUrl(`${base}/hubs/notifications?lang=${document.documentElement.lang === "ar" ? "ar" : "en"}`, {
      transport: HttpTransportType.WebSockets | HttpTransportType.LongPolling,
      accessTokenFactory: async () => {
        const res = await fetch("/api/realtime-token", { cache: "no-store" });
        if (!res.ok) return "";
        const { token } = (await res.json()) as { token: string };
        return token;
      },
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Warning)
    .build();
}

/** Server → client events on the hub. */
export type HubEvents = {
  notification: (payload: unknown) => void;
  notificationRead: (payload: { id: string; unreadCount: number }) => void;
  projectUpdated: (payload: { projectId: string }) => void;
};
