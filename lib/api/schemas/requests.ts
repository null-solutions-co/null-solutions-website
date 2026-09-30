import { z } from "zod";
import { isoDateTime } from "./common";

export const changeRequestType = z.enum(["comment", "question", "change_request"]);
export type ChangeRequestType = z.infer<typeof changeRequestType>;

export const changeRequestStatus = z.enum([
  "open",
  "in_review",
  "answered",
  "accepted",
  "rejected",
  "closed",
]);
export type ChangeRequestStatus = z.infer<typeof changeRequestStatus>;

export const requestAuthorRole = z.enum(["client", "null_team"]);
export type RequestAuthorRole = z.infer<typeof requestAuthorRole>;

export const changeRequestMessage = z.object({
  id: z.string(),
  requestId: z.string(),
  body: z.string(),
  authorRole: requestAuthorRole,
  authorName: z.string(),
  createdAt: isoDateTime,
});
export type ChangeRequestMessage = z.infer<typeof changeRequestMessage>;

export const changeRequestSummary = z.object({
  id: z.string(),
  projectId: z.string(),
  type: changeRequestType,
  subject: z.string(),
  status: changeRequestStatus,
  createdAt: isoDateTime,
  updatedAt: isoDateTime,
  messageCount: z.number().int().min(0),
  lastMessageAt: isoDateTime,
  lastMessageBy: requestAuthorRole,
});
export type ChangeRequestSummary = z.infer<typeof changeRequestSummary>;

export const changeRequest = changeRequestSummary.extend({
  body: z.string(),
  createdBy: z.string(),
  messages: z.array(changeRequestMessage),
});
export type ChangeRequest = z.infer<typeof changeRequest>;

// ---- request bodies ----

export const newChangeRequest = z.object({
  type: changeRequestType,
  subject: z.string().min(3).max(160),
  body: z.string().min(10).max(4000),
});
export type NewChangeRequest = z.infer<typeof newChangeRequest>;

export const newRequestMessage = z.object({
  body: z.string().min(1).max(4000),
});
export type NewRequestMessage = z.infer<typeof newRequestMessage>;
