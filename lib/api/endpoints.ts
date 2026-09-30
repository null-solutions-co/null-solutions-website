import { z } from "zod";
import { apiRequest, type RequestOptions } from "./client";
import * as s from "./schemas";

/**
 * Typed calls to the BFF. Paths here are BFF paths (`/api` prefix is added by the
 * client). Resource paths mirror docs/api-contract.md; they are forwarded by the
 * BFF proxy to the ASP.NET API.
 */

const P = "/proxy"; // authenticated passthrough

const ok = z.object({}).passthrough(); // for 204 / body-less responses

type Page = { page?: number; pageSize?: number };

export const api = {
  // ---- auth ----
  session: () => apiRequest("/auth/session", s.sessionUser),
  /** NULL team only (the /team page). Clients use `accessByCode`. */
  login: (body: s.LoginRequest) =>
    apiRequest("/auth/login", s.loginResponse, { method: "POST", body }),
  accessByCode: (body: s.AccessRequest) =>
    apiRequest("/auth/access", s.accessResponse, { method: "POST", body }),
  logout: () => apiRequest("/auth/logout", ok, { method: "POST" }),
  realtimeToken: () => apiRequest("/realtime-token", s.realtimeToken),

  // ---- public ----
  submitLead: (body: s.LeadRequest) =>
    apiRequest("/leads", s.leadCreated, { method: "POST", body }),

  // ---- projects ----
  myProjects: () => apiRequest(`${P}/projects/mine`, z.array(s.projectSummary)),
  project: (id: string) => apiRequest(`${P}/projects/${id}`, s.project),
  projectSummary: (id: string) =>
    apiRequest(`${P}/projects/${id}/summary`, s.projectProgressSummary),
  projectGates: (id: string) =>
    apiRequest(`${P}/projects/${id}/gates`, z.array(s.gate)),
  projectMilestones: (id: string) =>
    apiRequest(`${P}/projects/${id}/milestones`, z.array(s.milestone)),

  // ---- change requests ----
  projectRequests: (
    id: string,
    query?: Page & { status?: s.ChangeRequestStatus },
  ) =>
    apiRequest(
      `${P}/projects/${id}/requests`,
      s.paginated(s.changeRequestSummary),
      { query },
    ),
  createRequest: (id: string, body: s.NewChangeRequest) =>
    apiRequest(`${P}/projects/${id}/requests`, s.changeRequest, {
      method: "POST",
      body,
    }),
  request: (id: string) => apiRequest(`${P}/requests/${id}`, s.changeRequest),
  addRequestMessage: (id: string, body: s.NewRequestMessage) =>
    apiRequest(`${P}/requests/${id}/messages`, s.changeRequestMessage, {
      method: "POST",
      body,
    }),
  setRequestStatus: (id: string, status: s.ChangeRequestStatus) =>
    apiRequest(`${P}/requests/${id}`, s.changeRequest, {
      method: "PATCH",
      body: { status },
    }),

  // ---- invoices ----
  invoices: (query?: Page & { projectId?: string; status?: s.InvoiceStatus }) =>
    apiRequest(`${P}/invoices`, s.paginated(s.invoiceSummary), { query }),
  invoice: (id: string) => apiRequest(`${P}/invoices/${id}`, s.invoice),

  // ---- documents ----
  documents: (query?: Page & { projectId?: string; type?: s.DocumentType }) =>
    apiRequest(`${P}/documents`, s.paginated(s.documentMeta), { query }),

  // ---- notifications ----
  notifications: (query?: Page & { unreadOnly?: boolean }) =>
    apiRequest(`${P}/notifications`, s.notificationList, { query }),
  unreadCount: () =>
    apiRequest(`${P}/notifications/unread-count`, s.unreadCount),
  markNotificationRead: (id: string) =>
    apiRequest(`${P}/notifications/${id}/read`, s.notification, {
      method: "PATCH",
    }),
  markAllNotificationsRead: () =>
    apiRequest(`${P}/notifications/read-all`, z.object({ unreadCount: z.number() }), {
      method: "POST",
    }),

  // ---- partner / admin ----
  partnerMetrics: () => apiRequest(`${P}/partner/metrics`, s.partnerMetrics),
  adminClients: (query?: Page & { q?: string }) =>
    apiRequest(`${P}/admin/clients`, s.paginated(s.client), { query }),
  adminClient: (id: string) => apiRequest(`${P}/admin/clients/${id}`, s.adminClientDetail),
  adminCreateClient: (body: s.NewClient) =>
    apiRequest(`${P}/admin/clients`, s.client, { method: "POST", body }),
  adminCreateProject: (body: s.NewProject) =>
    apiRequest(`${P}/admin/projects`, s.createdProject, { method: "POST", body }),
  adminSetProgress: (projectId: string, body: s.ProgressUpdate) =>
    apiRequest(`${P}/admin/projects/${projectId}/progress`, s.project, { method: "PATCH", body }),
  adminProjectAccess: (projectId: string) =>
    apiRequest(`${P}/admin/projects/${projectId}/access`, s.projectAccess),
  adminIssueAccessCode: (projectId: string) =>
    apiRequest(`${P}/admin/projects/${projectId}/access`, s.issuedAccessCode, { method: "POST" }),
  adminRevokeAccessCode: (projectId: string) =>
    apiRequest(`${P}/admin/projects/${projectId}/access`, ok, { method: "DELETE" }),
  adminAdvanceGate: (projectId: string) =>
    apiRequest(`${P}/admin/projects/${projectId}/advance`, s.project, { method: "POST" }),
  adminAddMilestone: (projectId: string, body: s.NewMilestone) =>
    apiRequest(`${P}/admin/projects/${projectId}/milestones`, s.milestone, { method: "POST", body }),
  adminSetMilestone: (id: string, body: s.MilestoneUpdate) =>
    apiRequest(`${P}/admin/milestones/${id}`, s.milestone, { method: "PATCH", body }),
  adminIssueInvoice: (projectId: string, body: s.NewInvoice) =>
    apiRequest(`${P}/admin/projects/${projectId}/invoices`, s.invoice, { method: "POST", body }),
  adminRecordPayment: (invoiceId: string, body: s.NewPayment) =>
    apiRequest(`${P}/admin/invoices/${invoiceId}/payments`, s.invoice, { method: "POST", body }),
  /** multipart: `file`, `name`, `type` (the real file goes up). */
  adminAddDocument: (projectId: string, form: FormData) =>
    apiRequest(`${P}/admin/projects/${projectId}/documents`, s.documentMeta, { method: "POST", body: form }),
  adminUpdateProject: (projectId: string, body: s.ProjectUpdate) =>
    apiRequest(`${P}/admin/projects/${projectId}`, s.project, { method: "PATCH", body }),
  adminProjectBilling: (projectId: string) =>
    apiRequest(`${P}/admin/projects/${projectId}/billing`, s.projectBilling),
  adminBilling: () => apiRequest(`${P}/admin/billing`, s.billingOverview),
  adminRemindInvoice: (invoiceId: string) =>
    apiRequest(`${P}/admin/invoices/${invoiceId}/remind`, s.reminderResult, { method: "POST" }),
  adminVoidInvoice: (invoiceId: string) =>
    apiRequest(`${P}/admin/invoices/${invoiceId}/void`, s.invoice, { method: "POST" }),
} as const;

export type Api = typeof api;
export type { RequestOptions };
