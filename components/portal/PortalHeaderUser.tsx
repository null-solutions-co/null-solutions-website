"use client";

import { useTranslations } from "next-intl";
import { useSession } from "@/hooks/useSession";
import { LogoutButton } from "./LogoutButton";

export function PortalHeaderUser() {
  const t = useTranslations("portal");
  const { data } = useSession();

  if (!data) return null;

  const label = data.displayName || data.projectId || data.id;
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="u-label min-w-0 truncate">
        <span className="max-sm:hidden">{t("signedInAs")} </span>
        {label}
      </span>
      <LogoutButton />
    </div>
  );
}
