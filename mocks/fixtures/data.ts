/**
 * Realistic fixture data for local development — Amman names, JOD amounts,
 * dates in the 2026 build window. Also usable by the backend owner as
 * expected-response examples for docs/api-contract.md.
 */
import type {
  ChangeRequest,
  Client,
  DocumentMeta,
  Gate,
  Invoice,
  Milestone,
  Notification,
  PartnerMetrics,
  Project,
  ProjectProgressSummary,
  ProjectSummary,
  ServiceLine,
  SessionUser,
} from "@/lib/api/schemas";

export const sessionUser: SessionUser = {
  id: "u-001",
  email: "abdallah@ufuq.jo",
  displayName: "عبدالله جابر",
  role: "Client",
  clientId: "c-001",
  locale: "ar",
  scope: "full",
  projectId: null,
};

export const serviceLines: ServiceLine[] = [
  { id: "sl-1", code: "S1", name: "Web Platforms", shortDescription: "CMS-driven marketing sites and corporate portals.", order: 1 },
  { id: "sl-2", code: "S2", name: "Software", shortDescription: "Custom software: dashboards, internal tools, client portals.", order: 2 },
  { id: "sl-3", code: "S3", name: "Mobile Apps", shortDescription: "iOS and Android, cross-platform.", order: 3 },
  { id: "sl-4", code: "S4", name: "AI Solutions", shortDescription: "Assistants, chatbots, document intelligence, LLM integration.", order: 4 },
  { id: "sl-5", code: "S5", name: "Data & Analytics", shortDescription: "Pipelines, warehousing, BI dashboards.", order: 5 },
  { id: "sl-6", code: "S6", name: "Security Assessments", shortDescription: "Penetration testing, vulnerability assessment, code review.", order: 6 },
  { id: "sl-7", code: "S7", name: "Security Operations", shortDescription: "Monitoring, SIEM, incident response.", order: 7 },
  { id: "sl-8", code: "S8", name: "Cloud & DevOps", shortDescription: "Cloud migration, CI/CD, containers, infra-as-code.", order: 8 },
  { id: "sl-9", code: "S9", name: "Integration", shortDescription: "Third-party systems, middleware, APIs.", order: 9 },
  { id: "sl-10", code: "S10", name: "Managed Support", shortDescription: "Ongoing maintenance and support under SLA.", order: 10 },
  { id: "sl-11", code: "S11", name: "ERP Systems", shortDescription: "Accounting, inventory, sales, purchasing and HR in one system.", order: 11 },
];

const projectBase = {
  id: "p-001",
  code: "NS-7K2M9",
  name: "منصة الأفق الرقمي",
  serviceLine: { id: "sl-2", code: "S2", name: "Software" },
  status: "in_progress" as const,
  percentComplete: 64,
  currentGate: "G4" as const,
  startedAt: "2026-06-15T00:00:00Z",
  targetDate: "2026-10-31T00:00:00Z",
};

export const projectSummaries: ProjectSummary[] = [
  projectBase,
  {
    id: "p-002",
    code: "NS-3B8Q1",
    name: "موقع الأفق التعريفي",
    serviceLine: { id: "sl-1", code: "S1", name: "Web Platforms" },
    status: "delivered",
    percentComplete: 100,
    currentGate: "G9",
    startedAt: "2026-02-01T00:00:00Z",
    targetDate: "2026-05-15T00:00:00Z",
  },
];

export const projects: Record<string, Project> = {
  "p-001": {
    ...projectBase,
    description:
      "منصة ويب داخلية لإدارة الطلبات والفرق، مبنية على Next.js وربط مع أنظمة العميل الحالية.",
    clientId: "c-001",
    estimatedCompletionDate: "2026-10-12T00:00:00Z",
    updatedAt: "2026-08-28T09:00:00Z",
  },
  "p-002": {
    ...projectSummaries[1],
    description: "موقع تعريفي ثنائي اللغة.",
    clientId: "c-001",
    estimatedCompletionDate: "2026-05-10T00:00:00Z",
    updatedAt: "2026-05-15T00:00:00Z",
  },
};

export const projectSummary: Record<string, ProjectProgressSummary> = {
  "p-001": {
    projectId: "p-001",
    code: "NS-7K2M9",
    name: "منصة الأفق الرقمي",
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
    updatedAt: "2026-08-28T09:00:00Z",
  },
};

const gateTitles: Record<string, string> = {
  G0: "First call",
  G1: "Discovery",
  G2: "Scope and quote",
  G3: "Plan",
  G4: "Design",
  G5: "Build",
  G6: "Testing",
  G7: "Security check",
  G8: "Launch",
  G9: "Support",
};

export const gates: Record<string, Gate[]> = {
  "p-001": (["G0", "G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8", "G9"] as const).map(
    (id, i): Gate => ({
      id,
      title: gateTitles[id],
      status: i < 4 ? "done" : i === 4 ? "in_progress" : "not_started",
      startedAt: i <= 4 ? "2026-06-15T00:00:00Z" : null,
      completedAt: i < 4 ? "2026-07-20T00:00:00Z" : null,
    }),
  ),
};

export const milestones: Record<string, Milestone[]> = {
  "p-001": [
    { id: "m-1", projectId: "p-001", gate: "G4", title: "نظام التصميم والـ tokens", status: "done", dueDate: "2026-08-10T00:00:00Z", completedAt: "2026-08-09T00:00:00Z", order: 1 },
    { id: "m-2", projectId: "p-001", gate: "G4", title: "شاشات لوحة التحكم", status: "in_progress", dueDate: "2026-09-05T00:00:00Z", completedAt: null, order: 2 },
    { id: "m-3", projectId: "p-001", gate: "G4", title: "مراجعة العميل للتصميم", status: "pending", dueDate: "2026-09-12T00:00:00Z", completedAt: null, order: 3 },
    { id: "m-4", projectId: "p-001", gate: "G5", title: "تطوير الواجهة الأمامية", status: "pending", dueDate: "2026-09-30T00:00:00Z", completedAt: null, order: 4 },
    { id: "m-5", projectId: "p-001", gate: "G5", title: "ربط الـ API", status: "pending", dueDate: "2026-10-05T00:00:00Z", completedAt: null, order: 5 },
  ],
};

const cliq = { paymentInstructions: { cliq: { alias: "NULLSOL" } } };

export const invoices: Record<string, Invoice> = {
  "i-014": {
    id: "i-014", number: "NS-2026-014", projectId: "p-001", projectName: "منصة الأفق الرقمي",
    issueDate: "2026-06-20T00:00:00Z", dueDate: "2026-07-05T00:00:00Z", status: "paid",
    total: { currency: "JOD", amount: "1500.000" }, amountPaid: { currency: "JOD", amount: "1500.000" }, amountDue: { currency: "JOD", amount: "0.000" },
    lineItems: [{ id: "li-1", description: "الدفعة الأولى — الاكتشاف والتخطيط", quantity: 1, unitPrice: { currency: "JOD", amount: "1500.000" }, total: { currency: "JOD", amount: "1500.000" } }],
    subtotal: { currency: "JOD", amount: "1500.000" }, tax: null, notes: null, ...cliq,
    payments: [{ id: "pm-1", invoiceId: "i-014", method: "cliq", amount: { currency: "JOD", amount: "1500.000" }, paidAt: "2026-06-28T00:00:00Z", reference: "CLIQ-8891" }],
    pdfPath: "/invoices/i-014/pdf",
  },
  "i-021": {
    id: "i-021", number: "NS-2026-021", projectId: "p-001", projectName: "منصة الأفق الرقمي",
    issueDate: "2026-09-01T00:00:00Z", dueDate: "2026-09-30T00:00:00Z", status: "partially_paid",
    total: { currency: "JOD", amount: "2250.000" }, amountPaid: { currency: "JOD", amount: "1000.000" }, amountDue: { currency: "JOD", amount: "1250.000" },
    lineItems: [{ id: "li-2", description: "الدفعة الثانية — مرحلة التصميم", quantity: 1, unitPrice: { currency: "JOD", amount: "2250.000" }, total: { currency: "JOD", amount: "2250.000" } }],
    subtotal: { currency: "JOD", amount: "2250.000" }, tax: null, notes: "دفعة جزئية مستلمة بتاريخ 10 أيلول.", ...cliq,
    payments: [{ id: "pm-2", invoiceId: "i-021", method: "bank_transfer", amount: { currency: "JOD", amount: "1000.000" }, paidAt: "2026-09-10T00:00:00Z", reference: "TRF-4402" }],
    pdfPath: "/invoices/i-021/pdf",
  },
  "i-022": {
    id: "i-022", number: "NS-2026-022", projectId: "p-001", projectName: "منصة الأفق الرقمي",
    issueDate: "2026-07-25T00:00:00Z", dueDate: "2026-08-15T00:00:00Z", status: "overdue",
    total: { currency: "JOD", amount: "900.000" }, amountPaid: { currency: "JOD", amount: "0.000" }, amountDue: { currency: "JOD", amount: "900.000" },
    lineItems: [{ id: "li-3", description: "استضافة وبيئات التطوير — 6 أشهر", quantity: 6, unitPrice: { currency: "JOD", amount: "150.000" }, total: { currency: "JOD", amount: "900.000" } }],
    subtotal: { currency: "JOD", amount: "900.000" }, tax: null, notes: null, ...cliq,
    payments: [], pdfPath: "/invoices/i-022/pdf",
  },
  "i-025": {
    id: "i-025", number: "NS-2026-025", projectId: "p-001", projectName: "منصة الأفق الرقمي",
    issueDate: "2026-08-28T00:00:00Z", dueDate: "2026-10-15T00:00:00Z", status: "sent",
    total: { currency: "JOD", amount: "1000.000" }, amountPaid: { currency: "JOD", amount: "0.000" }, amountDue: { currency: "JOD", amount: "1000.000" },
    lineItems: [{ id: "li-4", description: "الدفعة الثالثة — بدء التطوير", quantity: 1, unitPrice: { currency: "JOD", amount: "1000.000" }, total: { currency: "JOD", amount: "1000.000" } }],
    subtotal: { currency: "JOD", amount: "1000.000" }, tax: null, notes: null, ...cliq,
    payments: [], pdfPath: "/invoices/i-025/pdf",
  },
};

export const documents: DocumentMeta[] = [
  { id: "d-1", projectId: "p-001", name: "عرض المشروع v2.pdf", type: "proposal", contentType: "application/pdf", sizeBytes: 482_113, uploadedAt: "2026-06-12T00:00:00Z", uploadedBy: "فريق NULL", version: 2 },
  { id: "d-2", projectId: "p-001", name: "عقد التطوير موقّع.pdf", type: "contract", contentType: "application/pdf", sizeBytes: 231_009, uploadedAt: "2026-06-18T00:00:00Z", uploadedBy: "فريق NULL", version: 1 },
  { id: "d-3", projectId: "p-001", name: "نظام التصميم.pdf", type: "deliverable", contentType: "application/pdf", sizeBytes: 1_204_882, uploadedAt: "2026-08-09T00:00:00Z", uploadedBy: "فريق NULL", version: 1 },
];

const now = "2026-08-30T09:00:00Z";

export const changeRequests: Record<string, ChangeRequest> = {
  "r-001": {
    id: "r-001", projectId: "p-001", type: "question", subject: "سؤال عن دعم المتصفحات القديمة",
    status: "answered", createdAt: "2026-08-20T09:00:00Z", updatedAt: "2026-08-21T12:00:00Z",
    messageCount: 3, lastMessageAt: "2026-08-21T12:00:00Z", lastMessageBy: "null_team",
    body: "هل ستدعم المنصة متصفح Internet Explorer؟", createdBy: "u-001",
    messages: [
      { id: "rm-1", requestId: "r-001", body: "هل ستدعم المنصة متصفح Internet Explorer؟", authorRole: "client", authorName: "عبدالله جابر", createdAt: "2026-08-20T09:00:00Z" },
      { id: "rm-2", requestId: "r-001", body: "لا ندعم IE — انتهى دعمه رسميًا. ندعم أحدث نسختين من Chrome و Edge و Safari و Firefox.", authorRole: "null_team", authorName: "فريق NULL", createdAt: "2026-08-21T10:00:00Z" },
      { id: "rm-3", requestId: "r-001", body: "تمام، شكرًا للتوضيح.", authorRole: "client", authorName: "عبدالله جابر", createdAt: "2026-08-21T12:00:00Z" },
    ],
  },
  "r-002": {
    id: "r-002", projectId: "p-001", type: "change_request", subject: "تغيير لون الأزرار الرئيسية",
    status: "in_review", createdAt: "2026-08-27T09:00:00Z", updatedAt: "2026-08-28T09:00:00Z",
    messageCount: 2, lastMessageAt: "2026-08-28T09:00:00Z", lastMessageBy: "null_team",
    body: "نريد الأزرار الرئيسية باللون الكهرماني بدل الأسود.", createdBy: "u-001",
    messages: [
      { id: "rm-4", requestId: "r-002", body: "نريد الأزرار الرئيسية باللون الكهرماني بدل الأسود.", authorRole: "client", authorName: "عبدالله جابر", createdAt: "2026-08-27T09:00:00Z" },
      { id: "rm-5", requestId: "r-002", body: "نراجع الأثر على التباين وسنعود لك خلال يومين.", authorRole: "null_team", authorName: "فريق NULL", createdAt: "2026-08-28T09:00:00Z" },
    ],
  },
};

export const notifications: Notification[] = [
  { id: "n-1", type: "gate_advanced", title: "انتقل مشروعك إلى بوابة G4 — التصميم", body: "أكملنا مرحلة التخطيط وبدأنا التصميم.", isRead: false, createdAt: "2026-08-28T09:05:00Z", link: { entity: "project", id: "p-001" } },
  { id: "n-2", type: "invoice_issued", title: "فاتورة جديدة NS-2026-025", body: "الدفعة الثالثة — 1,000.000 دينار، تستحق 15 تشرين الأول.", isRead: false, createdAt: "2026-08-28T08:00:00Z", link: { entity: "invoice", id: "i-025" } },
  { id: "n-3", type: "document_added", title: "أُضيف مستند: نظام التصميم.pdf", body: "متاح الآن في صفحة الملفات.", isRead: true, createdAt: "2026-08-09T10:00:00Z", link: { entity: "document", id: "d-3" } },
  { id: "n-4", type: "request_replied", title: "رد فريق NULL على طلبك", body: "طلب تغيير لون الأزرار — قيد المراجعة.", isRead: true, createdAt: "2026-08-28T09:00:00Z", link: { entity: "request", id: "r-002" } },
];

export const partnerMetrics: PartnerMetrics = {
  generatedAt: now,
  cards: [
    { key: "assigned", label: "مشاريع مُسندة", value: 3 },
    { key: "active", label: "مشاريع نشطة", value: 2 },
    { key: "deliverables_due", label: "تسليمات مستحقة", value: 1 },
    { key: "open_requests", label: "طلبات مفتوحة", value: 4 },
  ],
};

export const clients: Client[] = [
  { id: "c-001", name: "شركة الأفق الرقمي", contactEmail: "info@ufuq.jo", contactPhone: "+962 6 500 1234", status: "active", serviceLineCodes: ["S1", "S2"], createdAt: "2026-02-01T00:00:00Z" },
  { id: "c-002", name: "مجموعة الريّان", contactEmail: "it@alrayyan.jo", contactPhone: null, status: "prospect", serviceLineCodes: ["S6"], createdAt: "2026-07-10T00:00:00Z" },
];
