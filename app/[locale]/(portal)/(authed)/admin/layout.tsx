import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { readSession } from "@/lib/auth/session";

/** Admin is for the NULL team only; clients who type the URL land on their dashboard. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await readSession();
  if (session?.scope !== "full" || session.user?.role !== "Dev") {
    redirect({ href: "/dashboard", locale: await getLocale() });
  }
  return children;
}
