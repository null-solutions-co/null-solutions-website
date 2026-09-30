"use client";

import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@/i18n/navigation";
import { api } from "@/lib/api/endpoints";
import { useSession } from "@/hooks/useSession";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const t = useTranslations("portal");
  const router = useRouter();
  const qc = useQueryClient();
  const { data: session } = useSession();

  async function onLogout() {
    // The team signs in at /team, clients at /login.
    const back = session?.scope === "full" ? "/team" : "/login";
    await api.logout().catch(() => undefined);
    qc.removeQueries({ queryKey: ["session"] });
    qc.clear();
    router.replace(back);
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" onClick={onLogout}>
      {t("signOut")}
    </Button>
  );
}
