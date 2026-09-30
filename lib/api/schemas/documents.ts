import { z } from "zod";
import { isoDateTime } from "./common";

export const documentType = z.enum([
  "proposal",
  "contract",
  "deliverable",
  "report",
  "invoice",
  "other",
]);
export type DocumentType = z.infer<typeof documentType>;

export const documentMeta = z.object({
  id: z.string(),
  projectId: z.string(),
  name: z.string(),
  type: documentType,
  contentType: z.string(),
  sizeBytes: z.number().int().min(0),
  uploadedAt: isoDateTime,
  uploadedBy: z.string(),
  version: z.number().int().nullable(),
});
export type DocumentMeta = z.infer<typeof documentMeta>;

/** Backend may stream the file OR return a short-lived pre-signed URL. */
export const documentDownload = z.object({
  url: z.string().url(),
  expiresAt: isoDateTime,
});
export type DocumentDownload = z.infer<typeof documentDownload>;
