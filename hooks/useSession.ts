"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/endpoints";

/** Current portal session (client-side). Returns undefined data when signed out. */
export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: () => api.session(),
    retry: false,
    staleTime: 5 * 60_000,
  });
}
