import { http, HttpResponse } from "msw";
import type { ChangeRequest, ChangeRequestMessage, DocumentMeta, Invoice, Milestone, Project } from "@/lib/api/schemas";
import {
  newClient,
  newDocument,
  newInvoice,
  newMilestone,
  newPayment,
  newProject,
  progressUpdate,
  milestoneUpdate,
} from "@/lib/api/schemas";
import * as fx from "./fixtures/data";
import { attachment, mockPdf } from "./pdf";
import {
  GATE_IDS,
  GATE_TITLES,
  VIEWER_HEADER,
  decodeViewer,
  accessOf,
  db,
  invoiceSummaryOf,
  issueAccess,
  jod,
  newInvoiceNumber,
  newProjectCode,
  nextId,
  notify,
  now,
  progressOf,
  recompute,
  revokeAccess,
  summaryOf,
  toNumber,
  visibleProjectIds,
  type Viewer,
} from "./db";

/**
 * The mock API. These handlers don't intercept the network any more — the BFF
 * proxy resolves each request against them server-side (msw `getResponse`),
 * passing who's signed in in a header. That's what lets a client see only the
 * project their access code opens, and lets the admin screens set one up for real.
 */

const json = <T>(data: T, status = 200) => HttpResponse.json(data as object, { status });
const error = (status: number, code: string, message: string) =>
  HttpResponse.json({ error: { code, message }, traceId: "mock" }, { status });
const notFound = () => error(404, "not_found", "Not found.");
const forbidden = () => error(403, "forbidden", "You don't have access to this.");
const invalid = () => error(422, "validation_error", "Some fields are missing or invalid.");

const page = <T>(items: T[], url: URL) => {
  const p = Number(url.searchParams.get("page") ?? 1);
  const size = Number(url.searchParams.get("pageSize") ?? 20);
  const start = (p - 1) * size;
  return { items: items.slice(start, start + size), page: p, pageSize: size, total: items.length };
};

const ANON: Viewer = { id: null, role: null, clientId: null, name: "", scope: "full", projectId: null };

function viewer(request: Request): Viewer {
  try {
    return { ...ANON, ...decodeViewer(request.headers.get(VIEWER_HEADER)) };
  } catch {
    return ANON;
  }
}

const canSee = (v: Viewer, projectId: string) => visibleProjectIds(v).includes(projectId);
const isDev = (v: Viewer) => v.role === "Dev" && v.scope === "full";
const isTeam = (v: Viewer) => (v.role === "Dev" || v.role === "Partner") && v.scope === "full";
/** A client's notifications are the ones about their project. The team has none. */
const inbox = (v: Viewer) =>
  db().notifications.filter((n) => v.scope === "project" && !!v.projectId && n.projectId === v.projectId);

const P = "*/api/proxy";

export const handlers = [
  // ---- projects ----
  http.get(`${P}/projects/mine`, ({ request }) => {
    const ids = visibleProjectIds(viewer(request));
    return json(ids.map((id) => summaryOf(db().projects[id])));
  }),
  http.get(`${P}/projects/:id`, ({ params, request }) => {
    const p = db().projects[params.id as string];
    return p && canSee(viewer(request), p.id) ? json(p) : notFound();
  }),
  http.get(`${P}/projects/:id/summary`, ({ params, request }) => {
    const id = params.id as string;
    if (!canSee(viewer(request), id)) return notFound();
    const s = progressOf(id);
    return s ? json(s) : notFound();
  }),
  http.get(`${P}/projects/:id/gates`, ({ params, request }) => {
    const id = params.id as string;
    if (!canSee(viewer(request), id)) return notFound();
    return json(db().gates[id] ?? []);
  }),
  http.get(`${P}/projects/:id/milestones`, ({ params, request }) => {
    const id = params.id as string;
    if (!canSee(viewer(request), id)) return notFound();
    return json([...(db().milestones[id] ?? [])].sort((a, b) => a.order - b.order));
  }),

  // ---- change requests ----
  http.get(`${P}/projects/:id/requests`, ({ params, request }) => {
    const id = params.id as string;
    if (!canSee(viewer(request), id)) return notFound();
    const list = Object.values(db().requests)
      .filter((r) => r.projectId === id)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map(({ messages: _m, body: _b, createdBy: _c, ...summary }) => summary);
    return json(page(list, new URL(request.url)));
  }),
  http.post(`${P}/projects/:id/requests`, async ({ params, request }) => {
    const v = viewer(request);
    const projectId = params.id as string;
    if (!canSee(v, projectId)) return notFound();
    const body = (await request.json()) as { type: ChangeRequest["type"]; subject: string; body: string };
    const id = nextId("r");
    const ts = now();
    const created: ChangeRequest = {
      id,
      projectId,
      type: body.type,
      subject: body.subject,
      status: "open",
      createdAt: ts,
      updatedAt: ts,
      messageCount: 1,
      lastMessageAt: ts,
      lastMessageBy: "client",
      body: body.body,
      createdBy: v.id ?? "unknown",
      messages: [
        { id: nextId("rm"), requestId: id, body: body.body, authorRole: "client", authorName: v.name, createdAt: ts },
      ],
    };
    db().requests[id] = created;
    return json(created, 201);
  }),
  http.get(`${P}/requests/:id`, ({ params, request }) => {
    const r = db().requests[params.id as string];
    return r && canSee(viewer(request), r.projectId) ? json(r) : notFound();
  }),
  http.post(`${P}/requests/:id/messages`, async ({ params, request }) => {
    const v = viewer(request);
    const r = db().requests[params.id as string];
    if (!r || !canSee(v, r.projectId)) return notFound();
    if (r.status === "closed") return error(409, "conflict", "This request is closed.");
    const body = (await request.json()) as { body: string };
    const ts = now();
    const team = isDev(v);
    const msg: ChangeRequestMessage = {
      id: nextId("rm"),
      requestId: r.id,
      body: body.body,
      authorRole: team ? "null_team" : "client",
      authorName: team ? "NULL" : v.name,
      createdAt: ts,
    };
    r.messages.push(msg);
    r.messageCount = r.messages.length;
    r.lastMessageAt = ts;
    r.lastMessageBy = msg.authorRole;
    r.updatedAt = ts;
    if (team) {
      notify(r.projectId, {
        type: "request_replied",
        title: `NULL replied: ${r.subject}`,
        body: body.body.slice(0, 140),
        link: { entity: "request", id: r.id },
      });
    }
    return json(msg, 201);
  }),
  http.patch(`${P}/requests/:id`, async ({ params, request }) => {
    const v = viewer(request);
    const r = db().requests[params.id as string];
    if (!r || !canSee(v, r.projectId)) return notFound();
    const body = (await request.json()) as { status: ChangeRequest["status"] };
    // The team can move a request anywhere; a client can only close their own.
    if (!isDev(v) && body.status !== "closed") return forbidden();
    r.status = body.status;
    r.updatedAt = now();
    if (isDev(v)) {
      notify(r.projectId, {
        type: "request_status_changed",
        title: `Request updated: ${r.subject}`,
        body: `Status: ${body.status.replace("_", " ")}`,
        link: { entity: "request", id: r.id },
      });
    }
    return json(r);
  }),

  // ---- invoices ----
  http.get(`${P}/invoices`, ({ request }) => {
    const url = new URL(request.url);
    const ids = new Set(visibleProjectIds(viewer(request)));
    const projectId = url.searchParams.get("projectId");
    const status = url.searchParams.get("status");
    const list = Object.values(db().invoices)
      .filter((i) => ids.has(i.projectId))
      .filter((i) => !projectId || i.projectId === projectId)
      .filter((i) => !status || i.status === status)
      .sort((a, b) => b.issueDate.localeCompare(a.issueDate))
      .map(invoiceSummaryOf);
    return json(page(list, url));
  }),
  http.get(`${P}/invoices/:id`, ({ params, request }) => {
    const i = db().invoices[params.id as string];
    return i && canSee(viewer(request), i.projectId) ? json(i) : notFound();
  }),

  // ---- documents ----
  http.get(`${P}/documents`, ({ request }) => {
    const url = new URL(request.url);
    const ids = new Set(visibleProjectIds(viewer(request)));
    const projectId = url.searchParams.get("projectId");
    const list = db()
      .documents.filter((d) => ids.has(d.projectId))
      .filter((d) => !projectId || d.projectId === projectId)
      .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
    return json(page(list, url));
  }),

  // Downloads. Metadata-only mock files, so each returns a small generated PDF.
  http.get(`${P}/documents/:id/content`, ({ params, request }) => {
    const doc = db().documents.find((d) => d.id === params.id);
    if (!doc || !canSee(viewer(request), doc.projectId)) return notFound();
    const project = db().projects[doc.projectId];
    const pdf = mockPdf(doc.name, [
      `Project: ${project?.name ?? ""} (${project?.code ?? ""})`,
      `Type: ${doc.type} - version ${doc.version}`,
      `Added: ${doc.uploadedAt.slice(0, 10)} by ${doc.uploadedBy}`,
      "Sample file from the NULL Solutions portal (mock mode).",
    ]);
    const name = /\.pdf$/i.test(doc.name) ? doc.name : `${doc.name}.pdf`;
    return new HttpResponse(pdf, { headers: { "content-type": "application/pdf", "content-disposition": attachment(name) } });
  }),
  http.get(`${P}/invoices/:id/pdf`, ({ params, request }) => {
    const inv = db().invoices[params.id as string];
    if (!inv || !canSee(viewer(request), inv.projectId)) return notFound();
    const pdf = mockPdf(`Invoice ${inv.number}`, [
      `Project: ${db().projects[inv.projectId]?.code ?? ""}`,
      `Issued: ${inv.issueDate.slice(0, 10)}   Due: ${inv.dueDate?.slice(0, 10) ?? "-"}`,
      `Total: JOD ${inv.total.amount}   Paid: JOD ${inv.amountPaid.amount}   Due: JOD ${inv.amountDue.amount}`,
      `Status: ${inv.status.replace("_", " ")}`,
      "Pay by bank transfer or CliQ. Sample invoice (mock mode).",
    ]);
    return new HttpResponse(pdf, { headers: { "content-type": "application/pdf", "content-disposition": attachment(`${inv.number}.pdf`) } });
  }),

  // ---- notifications ----
  http.get(`${P}/notifications`, ({ request }) => {
    const v = viewer(request);
    const url = new URL(request.url);
    const mine = inbox(v);
    const list = url.searchParams.get("unreadOnly") === "true" ? mine.filter((n) => !n.isRead) : mine;
    return json({
      ...page(list.map(({ projectId: _p, ...n }) => n), url),
      unreadCount: mine.filter((n) => !n.isRead).length,
    });
  }),
  http.get(`${P}/notifications/unread-count`, ({ request }) => {
    const v = viewer(request);
    return json({ count: inbox(v).filter((n) => !n.isRead).length });
  }),
  http.patch(`${P}/notifications/:id/read`, ({ params, request }) => {
    const v = viewer(request);
    const n = inbox(v).find((x) => x.id === params.id);
    if (!n) return notFound();
    n.isRead = true;
    const { projectId: _p, ...out } = n;
    return json(out);
  }),
  http.post(`${P}/notifications/read-all`, ({ request }) => {
    const v = viewer(request);
    inbox(v).forEach((n) => {
      n.isRead = true;
    });
    return json({ unreadCount: 0 });
  }),

  // ---- partner ----
  http.get(`${P}/partner/metrics`, ({ request }) => (isTeam(viewer(request)) ? json(fx.partnerMetrics) : forbidden())),

  // ---- admin: clients ----
  http.get(`${P}/admin/clients`, ({ request }) => {
    if (!isDev(viewer(request))) return forbidden();
    const url = new URL(request.url);
    const q = url.searchParams.get("q")?.toLowerCase();
    const list = db()
      .clients.filter((c) => !q || c.name.toLowerCase().includes(q) || c.contactEmail.toLowerCase().includes(q))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return json(page(list, url));
  }),
  http.post(`${P}/admin/clients`, async ({ request }) => {
    if (!isDev(viewer(request))) return forbidden();
    const parsed = newClient.safeParse(await request.json());
    if (!parsed.success) return invalid();
    const c = { id: nextId("c"), ...parsed.data, contactPhone: parsed.data.contactPhone || null, status: "active" as const, createdAt: now() };
    db().clients.push(c);
    return json(c, 201);
  }),
  http.get(`${P}/admin/clients/:id`, ({ params, request }) => {
    if (!isDev(viewer(request))) return forbidden();
    const d = db();
    const c = d.clients.find((x) => x.id === params.id);
    if (!c) return notFound();
    return json({
      client: c,
      projects: Object.values(d.projects).filter((p) => p.clientId === c.id).map(summaryOf),
    });
  }),
  // ---- admin: projects ----
  http.post(`${P}/admin/projects`, async ({ request }) => {
    if (!isDev(viewer(request))) return forbidden();
    const parsed = newProject.safeParse(await request.json());
    if (!parsed.success) return invalid();
    const d = db();
    const b = parsed.data;
    if (!d.clients.some((c) => c.id === b.clientId)) return notFound();
    const line = fx.serviceLines.find((l) => l.code === b.serviceLineCode);
    if (!line) return invalid();
    const ts = now();
    const id = nextId("p");
    const target = b.targetDate ? `${b.targetDate}T00:00:00Z` : null;
    const p: Project = {
      id,
      code: newProjectCode(),
      name: b.name,
      serviceLine: { id: line.id, code: line.code, name: line.name },
      status: "discovery",
      percentComplete: 0,
      currentGate: "G0",
      startedAt: ts,
      targetDate: target,
      description: b.description || null,
      clientId: b.clientId,
      estimatedCompletionDate: target,
      updatedAt: ts,
    };
    d.projects[id] = p;
    d.gates[id] = GATE_IDS.map((g, i) => ({
      id: g,
      title: GATE_TITLES[g],
      status: i === 0 ? "in_progress" : "not_started",
      startedAt: i === 0 ? ts : null,
      completedAt: null,
    }));
    d.milestones[id] = [];
    recompute(id);
    notify(id, {
      type: "project_updated",
      title: `Your project is set up: ${p.name}`,
      body: `Project number ${p.code}. You can follow it here from now on.`,
      link: { entity: "project", id },
    });
    // The first access code comes back in the same response (shown once), so
    // there's no second call that could miss the project.
    return json({ ...d.projects[id], access: issueAccess(id) }, 201);
  }),
  http.patch(`${P}/admin/projects/:id/progress`, async ({ params, request }) => {
    if (!isDev(viewer(request))) return forbidden();
    const parsed = progressUpdate.safeParse(await request.json());
    if (!parsed.success) return invalid();
    const d = db();
    const id = params.id as string;
    const p = d.projects[id];
    if (!p) return notFound();
    const before = p.percentComplete;
    d.manualPercent[id] = parsed.data.percentComplete;
    if (p.status === "discovery" && parsed.data.percentComplete > 0) p.status = "in_progress";
    recompute(id);
    if (p.percentComplete !== before) {
      notify(id, {
        type: "project_updated",
        title: `Your project is now ${p.percentComplete}% done`,
        body: p.name,
        link: { entity: "project", id },
      });
    }
    return json(d.projects[id]);
  }),
  // ---- admin: client access ----
  http.get(`${P}/admin/projects/:id/access`, ({ params, request }) => {
    if (!isDev(viewer(request))) return forbidden();
    const id = params.id as string;
    if (!db().projects[id]) return notFound();
    const a = accessOf(id);
    return json({ active: !!a, issuedAt: a?.issuedAt ?? null });
  }),
  http.post(`${P}/admin/projects/:id/access`, ({ params, request }) => {
    if (!isDev(viewer(request))) return forbidden();
    const id = params.id as string;
    if (!db().projects[id]) return notFound();
    // Replaces any earlier code, which signs out everyone who used it.
    return json(issueAccess(id), 201);
  }),
  http.delete(`${P}/admin/projects/:id/access`, ({ params, request }) => {
    if (!isDev(viewer(request))) return forbidden();
    const id = params.id as string;
    if (!db().projects[id]) return notFound();
    revokeAccess(id);
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(`${P}/admin/projects/:id/advance`, ({ params, request }) => {
    if (!isDev(viewer(request))) return forbidden();
    const d = db();
    const id = params.id as string;
    const p = d.projects[id];
    const gates = d.gates[id];
    if (!p || !gates) return notFound();
    const i = gates.findIndex((x) => x.status !== "done");
    if (i === -1) return error(409, "conflict", "Every gate is already done.");
    const ts = now();
    gates[i] = { ...gates[i], status: "done", startedAt: gates[i].startedAt ?? ts, completedAt: ts };
    if (i + 1 < gates.length) gates[i + 1] = { ...gates[i + 1], status: "in_progress", startedAt: ts };
    if (p.status === "discovery" && i >= 1) p.status = "in_progress";
    recompute(id);
    const next = gates[i + 1];
    notify(id, {
      type: "gate_advanced",
      title: next ? `Your project moved to ${next.id} · ${next.title}` : `${p.name} is complete`,
      body: `${gates[i].id} · ${gates[i].title} is done.`,
      link: { entity: "project", id },
    });
    return json(d.projects[id]);
  }),
  http.post(`${P}/admin/projects/:id/milestones`, async ({ params, request }) => {
    if (!isDev(viewer(request))) return forbidden();
    const d = db();
    const id = params.id as string;
    if (!d.projects[id]) return notFound();
    const parsed = newMilestone.safeParse(await request.json());
    if (!parsed.success) return invalid();
    const list = (d.milestones[id] ??= []);
    const m: Milestone = {
      id: nextId("m"),
      projectId: id,
      gate: parsed.data.gate,
      title: parsed.data.title,
      status: "pending",
      dueDate: parsed.data.dueDate ? `${parsed.data.dueDate}T00:00:00Z` : null,
      completedAt: null,
      order: list.length + 1,
    };
    list.push(m);
    return json(m, 201);
  }),
  http.patch(`${P}/admin/milestones/:id`, async ({ params, request }) => {
    if (!isDev(viewer(request))) return forbidden();
    const parsed = milestoneUpdate.safeParse(await request.json());
    if (!parsed.success) return invalid();
    const d = db();
    for (const [projectId, list] of Object.entries(d.milestones)) {
      const m = list.find((x) => x.id === params.id);
      if (!m) continue;
      m.status = parsed.data.status;
      m.completedAt = parsed.data.status === "done" ? now() : null;
      if (parsed.data.status === "done") {
        notify(projectId, {
          type: "milestone_completed",
          title: `Milestone done: ${m.title}`,
          body: `${m.gate ?? ""} · ${d.projects[projectId]?.name ?? ""}`.trim(),
          link: { entity: "project", id: projectId },
        });
      }
      return json(m);
    }
    return notFound();
  }),

  // ---- admin: invoices ----
  http.post(`${P}/admin/projects/:id/invoices`, async ({ params, request }) => {
    if (!isDev(viewer(request))) return forbidden();
    const d = db();
    const p = d.projects[params.id as string];
    if (!p) return notFound();
    const parsed = newInvoice.safeParse(await request.json());
    if (!parsed.success) return invalid();
    const amount = toNumber(parsed.data.amount);
    const id = nextId("i");
    const inv: Invoice = {
      id,
      number: newInvoiceNumber(),
      projectId: p.id,
      projectName: p.name,
      issueDate: now(),
      dueDate: `${parsed.data.dueDate}T00:00:00Z`,
      status: "sent",
      total: jod(amount),
      amountPaid: jod(0),
      amountDue: jod(amount),
      lineItems: [{ id: nextId("li"), description: parsed.data.description, quantity: 1, unitPrice: jod(amount), total: jod(amount) }],
      subtotal: jod(amount),
      tax: null,
      notes: null,
      paymentInstructions: { cliq: { alias: "NULLSOL" } },
      payments: [],
      pdfPath: `/invoices/${id}/pdf`,
    };
    d.invoices[id] = inv;
    notify(p.id, {
      type: "invoice_issued",
      title: `New invoice ${inv.number}`,
      body: `${parsed.data.description} · JOD ${amount.toFixed(3)}`,
      link: { entity: "invoice", id },
    });
    return json(inv, 201);
  }),
  http.post(`${P}/admin/invoices/:id/payments`, async ({ params, request }) => {
    if (!isDev(viewer(request))) return forbidden();
    const d = db();
    const inv = d.invoices[params.id as string];
    if (!inv) return notFound();
    const parsed = newPayment.safeParse(await request.json());
    if (!parsed.success) return invalid();
    const amount = toNumber(parsed.data.amount);
    const paid = toNumber(inv.amountPaid.amount) + amount;
    const total = toNumber(inv.total.amount);
    inv.payments.push({
      id: nextId("pm"),
      invoiceId: inv.id,
      method: parsed.data.method,
      amount: jod(amount),
      paidAt: now(),
      reference: parsed.data.reference || null,
    });
    inv.amountPaid = jod(Math.min(paid, total));
    inv.amountDue = jod(Math.max(total - paid, 0));
    inv.status = paid >= total ? "paid" : "partially_paid";
    notify(inv.projectId, {
      type: "payment_recorded",
      title: `Payment received for ${inv.number}`,
      body: `JOD ${amount.toFixed(3)} · thank you.`,
      link: { entity: "invoice", id: inv.id },
    });
    return json(inv);
  }),

  // ---- admin: documents ----
  http.post(`${P}/admin/projects/:id/documents`, async ({ params, request }) => {
    if (!isDev(viewer(request))) return forbidden();
    const d = db();
    const p = d.projects[params.id as string];
    if (!p) return notFound();
    const parsed = newDocument.safeParse(await request.json());
    if (!parsed.success) return invalid();
    // Metadata only in mock mode — the real endpoint takes the file itself (multipart).
    const doc: DocumentMeta = {
      id: nextId("d"),
      projectId: p.id,
      name: parsed.data.name,
      type: parsed.data.type,
      contentType: "application/pdf",
      sizeBytes: 250_000,
      uploadedAt: now(),
      uploadedBy: "NULL",
      version: 1,
    };
    d.documents.push(doc);
    notify(p.id, {
      type: "document_added",
      title: `New file: ${doc.name}`,
      body: `Added to ${p.name}.`,
      link: { entity: "document", id: doc.id },
    });
    return json(doc, 201);
  }),
];
