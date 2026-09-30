import { z } from "zod";
import { gateId, isoDateTime, money } from "./common";

export const projectStatus = z.enum([
  "discovery",
  "in_progress",
  "on_hold",
  "in_review",
  "delivered",
  "closed",
]);
export type ProjectStatus = z.infer<typeof projectStatus>;

export const projectSummary = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  serviceLine: z.object({ id: z.string(), code: z.string(), name: z.string() }),
  status: projectStatus,
  percentComplete: z.number().min(0).max(100),
  currentGate: gateId,
  startedAt: isoDateTime.nullable(),
  targetDate: isoDateTime.nullable(),
});
export type ProjectSummary = z.infer<typeof projectSummary>;

export const project = projectSummary.extend({
  description: z.string().nullable(),
  clientId: z.string(),
  estimatedCompletionDate: isoDateTime.nullable(),
  updatedAt: isoDateTime,
  /** The agreed price of the whole project; null until set. */
  price: money.nullish(),
});
export type Project = z.infer<typeof project>;

export const gateStatus = z.enum(["not_started", "in_progress", "done", "blocked"]);
export type GateStatus = z.infer<typeof gateStatus>;

export const gate = z.object({
  id: gateId,
  title: z.string(),
  status: gateStatus,
  startedAt: isoDateTime.nullable(),
  completedAt: isoDateTime.nullable(),
});
export type Gate = z.infer<typeof gate>;

export const milestoneStatus = z.enum(["pending", "in_progress", "done", "blocked"]);
export type MilestoneStatus = z.infer<typeof milestoneStatus>;

export const milestone = z.object({
  id: z.string(),
  projectId: z.string(),
  gate: gateId.nullable(),
  title: z.string(),
  status: milestoneStatus,
  dueDate: isoDateTime.nullable(),
  completedAt: isoDateTime.nullable(),
  order: z.number(),
});
export type Milestone = z.infer<typeof milestone>;

export const projectProgressSummary = z.object({
  projectId: z.string(),
  code: z.string(),
  name: z.string(),
  status: projectStatus,
  percentComplete: z.number().min(0).max(100),
  currentGate: gateId,
  currentGateTitle: z.string(),
  nextGate: gateId.nullable(),
  gatesDone: z.number().int().min(0).max(10),
  gatesTotal: z.number().int(),
  estimatedCompletionDate: isoDateTime.nullable(),
  daysRemaining: z.number().int().nullable(),
  outstandingBalance: money.nullable(),
  /** The client's payments (each one an invoice): how many are made, what's left, and the next due date. */
  payments: z
    .object({
      total: z.number().int().min(0),
      paid: z.number().int().min(0),
      remaining: money,
      nextDue: isoDateTime.nullable(),
    })
    .optional(),
  updatedAt: isoDateTime,
});
export type ProjectProgressSummary = z.infer<typeof projectProgressSummary>;
