import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";
import { PortalShell } from "@/components/portal/PortalShell";
import { RealtimeProvider } from "@/components/system/RealtimeProvider";
import { readSession } from "@/lib/auth/session";

export default async function AuthedPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await readSession();
  if (!session) {
    redirect({ href: "/login", locale: await getLocale() });
  }
  return (
    <RealtimeProvider>
      <PortalShell>{children}</PortalShell>
    </RealtimeProvider>
  );
}
