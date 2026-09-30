import { z } from "zod";
import { SERVICE_CODE_PATTERN } from "@/lib/services";
import { gateId, isoDateTime, money } from "./common";
import { project, projectSummary, milestoneStatus } from "./projects";
import { documentType } from "./documents";
import { invoiceSummary, paymentMethod } from "./invoices";
import { client } from "./misc";

/**
 * Admin (Dev role) — setting a client up end to end: client record → project
 * → access code → gates, milestones, invoices, files. The endpoints beyond
 * list/create-client are ★ proposals in docs/api-contract.md §12.
 */

export const adminClientDetail = z.object({
  client,
  projects: z.array(projectSummary),
});
export type AdminClientDetail = z.infer<typeof adminClientDetail>;

/** Whether a project has a working access code. Never includes the code. */
export const projectAccess = z.object({
  active: z.boolean(),
  issuedAt: isoDateTime.nullable(),
});
export type ProjectAccess = z.infer<typeof projectAccess>;

/** Returned once, when a code is issued, for the admin to hand to the client. */
export const issuedAccessCode = z.object({
  accessCode: z.string(),
  issuedAt: isoDateTime,
});
export type IssuedAccessCode = z.infer<typeof issuedAccessCode>;

/** POST /admin/projects: the new project and, in the same response, its first access code (shown once). */
export const createdProject = project.extend({ access: issuedAccessCode.optional() });
export type CreatedProject = z.infer<typeof createdProject>;

// ---- request bodies ----

const lineCode = z.string().regex(SERVICE_CODE_PATTERN);
const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const decimal = z.string().regex(/^\d+(\.\d{1,3})?$/);

export const newClient = z.object({
  name: z.string().trim().min(2).max(160),
  contactEmail: z.string().trim().email(),
  contactPhone: z.string().trim().max(40).optional(),
  serviceLineCodes: z.array(lineCode).default([]),
});
export type NewClient = z.infer<typeof newClient>;

export const newProject = z.object({
  clientId: z.string(),
  name: z.string().trim().min(2).max(160),
  serviceLineCode: lineCode,
  description: z.string().trim().max(2000).optional(),
  targetDate: dateOnly.optional(),
  /** Money, all optional: the price, what's been paid already, and the rest split into installments. */
  price: decimal.optional(),
  paidUpfront: decimal.optional(),
  upfrontMethod: paymentMethod.optional(),
  installments: z.number().int().min(0).max(36).optional(),
  firstDueDate: dateOnly.optional(),
  intervalMonths: z.number().int().min(1).max(12).optional(),
});
export type NewProject = z.infer<typeof newProject>;

/** PATCH /admin/projects/{id}: only the fields sent change. `price: ""` clears the price. */
export const projectUpdate = z.object({
  name: z.string().trim().min(2).max(160).optional(),
  description: z.string().trim().max(2000).optional(),
  targetDate: dateOnly.optional(),
  price: z.union([decimal, z.literal("")]).optional(),
});
export type ProjectUpdate = z.infer<typeof projectUpdate>;

/** PATCH /admin/projects/{id}/progress: the percentage the client sees, set by hand. */
export const progressUpdate = z.object({ percentComplete: z.number().int().min(0).max(100) });
export type ProgressUpdate = z.infer<typeof progressUpdate>;

export const newMilestone = z.object({
  title: z.string().trim().min(2).max(200),
  gate: gateId,
  dueDate: dateOnly.optional(),
});
export type NewMilestone = z.infer<typeof newMilestone>;

export const milestoneUpdate = z.object({ status: milestoneStatus });
export type MilestoneUpdate = z.infer<typeof milestoneUpdate>;

export const newInvoice = z.object({
  description: z.string().trim().min(2).max(300),
  amount: decimal,
  dueDate: dateOnly,
});
export type NewInvoice = z.infer<typeof newInvoice>;

export const newPayment = z.object({
  amount: decimal,
  method: paymentMethod,
  reference: z.string().trim().max(80).optional(),
});
export type NewPayment = z.infer<typeof newPayment>;

export const newDocument = z.object({
  name: z.string().trim().min(2).max(200),
  type: documentType,
});
export type NewDocument = z.infer<typeof newDocument>;

export const paginatedProjects = z.object({
  items: z.array(projectSummary),
  page: z.number(),
  pageSize: z.number(),
  total: z.number(),
});

// ---- billing (admin) ----

export const projectBilling = z.object({
  projectId: z.string(),
  price: money.nullable(),
  invoiced: money,
  paid: money,
  outstanding: money,
  /** Price minus what's been invoiced so far (null without a price). */
  unbilled: money.nullable(),
  overdue: money,
  overdueCount: z.number().int(),
  nextDue: isoDateTime.nullable(),
  invoices: z.array(invoiceSummary),
});
export type ProjectBilling = z.infer<typeof projectBilling>;

export const billingRow = z.object({
  invoiceId: z.string(),
  number: z.string(),
  description: z.string(),
  projectId: z.string(),
  projectName: z.string(),
  clientName: z.string(),
  clientEmail: z.string(),
  dueDate: isoDateTime.nullable(),
  amountDue: money,
  daysOverdue: z.number().int(),
  lastReminderAt: isoDateTime.nullable(),
});
export type BillingRow = z.infer<typeof billingRow>;

export const billingOverview = z.object({
  totals: z.object({
    receivable: money,
    overdue: money,
    dueSoon: money,
    collectedThisMonth: money,
    overdueCount: z.number().int(),
  }),
  overdue: z.array(billingRow),
  dueSoon: z.array(billingRow),
  projects: z.array(
    z.object({
      projectId: z.string(),
      projectCode: z.string(),
      projectName: z.string(),
      clientName: z.string(),
      price: money.nullable(),
      paid: money,
      outstanding: money,
      overdue: money,
    }),
  ),
});
export type BillingOverview = z.infer<typeof billingOverview>;

export const reminderResult = z.object({
  sentAt: isoDateTime,
  /** "sent" | "skipped" (no email service set up) | "failed" */
  email: z.string(),
  recipient: z.string().nullable(),
});
export type ReminderResult = z.infer<typeof reminderResult>;

