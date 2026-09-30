"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/endpoints";
import type {
  ChangeRequestStatus,
  DocumentType,
  InvoiceStatus,
  MilestoneStatus,
  NewChangeRequest,
  NewClient,
  ProjectUpdate,
  NewInvoice,
  NewMilestone,
  NewPayment,
  NewProject,
  NewRequestMessage,
} from "@/lib/api/schemas";

type Page = { page?: number; pageSize?: number };

export const useMyProjects = () =>
  useQuery({ queryKey: ["projects", "mine"], queryFn: () => api.myProjects() });

export const useProject = (id: string) =>
  useQuery({ queryKey: ["project", id], queryFn: () => api.project(id), enabled: !!id });

export const useProjectSummary = (id: string) =>
  useQuery({ queryKey: ["project", id, "summary"], queryFn: () => api.projectSummary(id), enabled: !!id });

export const useProjectGates = (id: string) =>
  useQuery({ queryKey: ["project", id, "gates"], queryFn: () => api.projectGates(id), enabled: !!id });

export const useProjectMilestones = (id: string) =>
  useQuery({ queryKey: ["project", id, "milestones"], queryFn: () => api.projectMilestones(id), enabled: !!id });

export const useInvoices = (query?: Page & { projectId?: string; status?: InvoiceStatus }) =>
  useQuery({ queryKey: ["invoices", query ?? {}], queryFn: () => api.invoices(query) });

export const useInvoice = (id: string) =>
  useQuery({ queryKey: ["invoice", id], queryFn: () => api.invoice(id), enabled: !!id });

export const useDocuments = (query?: Page & { projectId?: string; type?: DocumentType }) =>
  useQuery({ queryKey: ["documents", query ?? {}], queryFn: () => api.documents(query) });

export const useNotifications = (query?: Page & { unreadOnly?: boolean }) =>
  useQuery({ queryKey: ["notifications", query ?? {}], queryFn: () => api.notifications(query) });

export const useUnreadCount = () =>
  useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => api.unreadCount(),
    refetchInterval: 60_000,
  });

export const useProjectRequests = (id: string, query?: Page & { status?: ChangeRequestStatus }) =>
  useQuery({
    queryKey: ["project", id, "requests", query ?? {}],
    queryFn: () => api.projectRequests(id, query),
    enabled: !!id,
  });

export const useRequest = (id: string) =>
  useQuery({ queryKey: ["request", id], queryFn: () => api.request(id), enabled: !!id });

export const usePartnerMetrics = () =>
  useQuery({ queryKey: ["partner", "metrics"], queryFn: () => api.partnerMetrics() });

// ---- admin ----

export const useAdminClients = (query?: Page & { q?: string }) =>
  useQuery({ queryKey: ["admin", "clients", query ?? {}], queryFn: () => api.adminClients(query) });

export const useAdminClient = (id: string) =>
  useQuery({ queryKey: ["admin", "client", id], queryFn: () => api.adminClient(id), enabled: !!id });

// ---- mutations ----

export function useCreateRequest(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: NewChangeRequest) => api.createRequest(projectId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["project", projectId, "requests"] }),
  });
}

export function useAddRequestMessage(requestId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: NewRequestMessage) => api.addRequestMessage(requestId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["request", requestId] }),
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.markNotificationRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.markAllNotificationsRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

/** Admin writes touch a project's whole picture — refresh all of it. */
function useAdminMutation<TVars, TOut>(fn: (v: TVars) => Promise<TOut>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: ["admin"] }),
        qc.invalidateQueries({ queryKey: ["project"] }),
        qc.invalidateQueries({ queryKey: ["projects"] }),
        qc.invalidateQueries({ queryKey: ["invoices"] }),
        qc.invalidateQueries({ queryKey: ["documents"] }),
      ]),
  });
}

export const useCreateClient = () => useAdminMutation((b: NewClient) => api.adminCreateClient(b));
export const useProjectAccess = (projectId: string) =>
  useQuery({ queryKey: ["admin", "access", projectId], queryFn: () => api.adminProjectAccess(projectId) });
export const useIssueAccessCode = () => useAdminMutation((projectId: string) => api.adminIssueAccessCode(projectId));
export const useRevokeAccessCode = () => useAdminMutation((projectId: string) => api.adminRevokeAccessCode(projectId));
export const useCreateProject = () => useAdminMutation((b: NewProject) => api.adminCreateProject(b));
export const useAdvanceGate = (projectId: string) => useAdminMutation(() => api.adminAdvanceGate(projectId));
export const useSetProgress = (projectId: string) =>
  useAdminMutation((percentComplete: number) => api.adminSetProgress(projectId, { percentComplete }));
export const useAddMilestone = (projectId: string) =>
  useAdminMutation((b: NewMilestone) => api.adminAddMilestone(projectId, b));
export const useSetMilestone = () =>
  useAdminMutation(({ id, status }: { id: string; status: MilestoneStatus }) => api.adminSetMilestone(id, { status }));
export const useIssueInvoice = (projectId: string) =>
  useAdminMutation((b: NewInvoice) => api.adminIssueInvoice(projectId, b));
export const useRecordPayment = () =>
  useAdminMutation(({ invoiceId, body }: { invoiceId: string; body: NewPayment }) => api.adminRecordPayment(invoiceId, body));
export const useAddDocument = (projectId: string) =>
  useAdminMutation((form: FormData) => api.adminAddDocument(projectId, form));
export const useUpdateProject = (projectId: string) =>
  useAdminMutation((b: ProjectUpdate) => api.adminUpdateProject(projectId, b));
export const useProjectBilling = (projectId: string) =>
  useQuery({ queryKey: ["admin", "billing", projectId], queryFn: () => api.adminProjectBilling(projectId), enabled: !!projectId });
export const useBillingOverview = () => useQuery({ queryKey: ["admin", "billing"], queryFn: () => api.adminBilling() });
export const useRemindInvoice = () => useAdminMutation((invoiceId: string) => api.adminRemindInvoice(invoiceId));
export const useVoidInvoice = () => useAdminMutation((invoiceId: string) => api.adminVoidInvoice(invoiceId));
