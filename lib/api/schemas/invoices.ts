import { z } from "zod";
import { isoDateTime, money } from "./common";

export const invoiceStatus = z.enum([
  "sent",
  "partially_paid",
  "paid",
  "overdue",
  "void",
]);
export type InvoiceStatus = z.infer<typeof invoiceStatus>;

export const paymentMethod = z.enum(["bank_transfer", "cliq", "cash", "other"]);
export type PaymentMethod = z.infer<typeof paymentMethod>;

export const invoiceSummary = z.object({
  id: z.string(),
  number: z.string(),
  projectId: z.string(),
  projectName: z.string(),
  issueDate: isoDateTime,
  dueDate: isoDateTime.nullable(),
  status: invoiceStatus,
  total: money,
  amountPaid: money,
  amountDue: money,
});
export type InvoiceSummary = z.infer<typeof invoiceSummary>;

export const invoiceLineItem = z.object({
  id: z.string(),
  description: z.string(),
  quantity: z.number(),
  unitPrice: money,
  total: money,
});
export type InvoiceLineItem = z.infer<typeof invoiceLineItem>;

export const payment = z.object({
  id: z.string(),
  invoiceId: z.string(),
  method: paymentMethod,
  amount: money,
  paidAt: isoDateTime,
  reference: z.string().nullable(),
});
export type Payment = z.infer<typeof payment>;

export const invoice = invoiceSummary.extend({
  lineItems: z.array(invoiceLineItem),
  subtotal: money,
  tax: money.nullable(),
  notes: z.string().nullable(),
  paymentInstructions: z.object({
    bankTransfer: z
      .object({
        bankName: z.string(),
        accountName: z.string(),
        iban: z.string(),
        swift: z.string().nullish(),
      })
      .nullish(),
    cliq: z.object({ alias: z.string() }).nullish(),
  }),
  payments: z.array(payment),
  pdfPath: z.string(),
  /** 0 = the deposit, 1..n = the payment plan's installments; null for a one-off invoice. */
  installmentNo: z.number().int().nullish(),
});
export type Invoice = z.infer<typeof invoice>;
