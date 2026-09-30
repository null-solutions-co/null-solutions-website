import { describe, it, expect } from "vitest";
import {
  projectProgressSummary,
  invoice,
  notificationList,
  changeRequest,
  paginated,
  invoiceSummary,
} from "./index";

describe("api schemas parse contract-shaped payloads", () => {
  it("projectProgressSummary", () => {
    const payload = {
      projectId: "p1",
      code: "NS-4F9K2",
      name: "Acme rebuild",
      status: "in_progress",
      percentComplete: 64,
      currentGate: "G4",
      currentGateTitle: "Design",
      nextGate: "G5",
      gatesDone: 4,
      gatesTotal: 10,
      estimatedCompletionDate: "2026-10-12T00:00:00Z",
      daysRemaining: 43,
      outstandingBalance: { currency: "JOD", amount: "3150.000" },
      updatedAt: "2026-08-30T09:00:00Z",
    };
    expect(projectProgressSummary.parse(payload)).toMatchObject({ currentGate: "G4" });
  });

  it("readonly summary has null outstandingBalance", () => {
    const payload = {
      projectId: "p1",
      code: "NS-4F9K2",
      name: "Acme rebuild",
      status: "in_progress",
      percentComplete: 64,
      currentGate: "G4",
      currentGateTitle: "Design",
      nextGate: null,
      gatesDone: 4,
      gatesTotal: 10,
      estimatedCompletionDate: null,
      daysRemaining: null,
      outstandingBalance: null,
      updatedAt: "2026-08-30T09:00:00Z",
    };
    expect(projectProgressSummary.parse(payload).outstandingBalance).toBeNull();
  });

  it("invoice with line items and CliQ instructions", () => {
    const payload = {
      id: "i1",
      number: "NS-2026-021",
      projectId: "p1",
      projectName: "Acme rebuild",
      issueDate: "2026-09-01T00:00:00Z",
      dueDate: "2026-09-30T00:00:00Z",
      status: "partially_paid",
      total: { currency: "JOD", amount: "2250.000" },
      amountPaid: { currency: "JOD", amount: "1000.000" },
      amountDue: { currency: "JOD", amount: "1250.000" },
      lineItems: [
        {
          id: "l1",
          description: "Design phase",
          quantity: 1,
          unitPrice: { currency: "JOD", amount: "2250.000" },
          total: { currency: "JOD", amount: "2250.000" },
        },
      ],
      subtotal: { currency: "JOD", amount: "2250.000" },
      tax: null,
      notes: null,
      paymentInstructions: { cliq: { alias: "NULLSOL" } },
      payments: [],
      pdfPath: "/invoices/i1/pdf",
    };
    expect(invoice.parse(payload).lineItems).toHaveLength(1);
  });

  it("notificationList envelope", () => {
    const payload = {
      items: [
        {
          id: "n1",
          type: "gate_advanced",
          title: "Moved to G4",
          body: "Your project entered the Design gate.",
          isRead: false,
          createdAt: "2026-08-30T09:00:00Z",
          link: { entity: "project", id: "p1" },
        },
      ],
      page: 1,
      pageSize: 20,
      total: 1,
      unreadCount: 1,
    };
    expect(notificationList.parse(payload).unreadCount).toBe(1);
  });

  it("changeRequest thread", () => {
    const payload = {
      id: "r1",
      projectId: "p1",
      type: "change_request",
      subject: "Swap the hero image",
      status: "in_review",
      createdAt: "2026-08-28T09:00:00Z",
      updatedAt: "2026-08-29T09:00:00Z",
      messageCount: 2,
      lastMessageAt: "2026-08-29T09:00:00Z",
      lastMessageBy: "null_team",
      body: "Please use the new photograph from the shoot.",
      createdBy: "u1",
      messages: [
        {
          id: "m1",
          requestId: "r1",
          body: "Please use the new photograph.",
          authorRole: "client",
          authorName: "Sara",
          createdAt: "2026-08-28T09:00:00Z",
        },
      ],
    };
    expect(changeRequest.parse(payload).messages[0].authorRole).toBe("client");
  });

  it("strips unknown keys rather than failing", () => {
    const withExtra = {
      items: [],
      page: 1,
      pageSize: 20,
      total: 0,
      somethingNew: "backend added this",
    };
    const result = paginated(invoiceSummary).parse(withExtra) as Record<string, unknown>;
    expect(result.somethingNew).toBeUndefined();
  });
});
