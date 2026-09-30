import { z } from "zod";
import { isoDateTime, paginated } from "./common";

export const notificationType = z.enum([
  "invoice_issued",
  "invoice_overdue",
  "payment_recorded",
  "document_added",
  "gate_advanced",
  "milestone_completed",
  "request_replied",
  "request_status_changed",
  "project_updated",
]);
export type NotificationType = z.infer<typeof notificationType>;

export const notificationLinkEntity = z.enum([
  "project",
  "invoice",
  "document",
  "request",
]);

export const notification = z.object({
  id: z.string(),
  type: notificationType,
  title: z.string(),
  body: z.string(),
  isRead: z.boolean(),
  createdAt: isoDateTime,
  link: z
    .object({ entity: notificationLinkEntity, id: z.string() })
    .nullable(),
});
export type Notification = z.infer<typeof notification>;

export const notificationList = paginated(notification).extend({
  unreadCount: z.number().int().min(0),
});
export type NotificationList = z.infer<typeof notificationList>;

export const unreadCount = z.object({ count: z.number().int().min(0) });
export type UnreadCount = z.infer<typeof unreadCount>;
