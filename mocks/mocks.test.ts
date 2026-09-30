import { beforeEach, describe, expect, it } from "vitest";
import { getResponse } from "msw";
import { z } from "zod";
import * as s from "@/lib/api/schemas";
import { generateAccessCode, normalizeAccessCode } from "@/lib/auth/access-code";
import { handlers } from "./handlers";
import { DEV_ACCESS_CODES, VIEWER_HEADER, accessOf, encodeViewer, checkStaffPassword, projectByAccessCode, type Viewer } from "./db";

/**
 * The mock API, called the way the BFF proxy calls it: server-side, with the
 * signed-in viewer in a header. Every response is also checked against the
 * frontend's zod schemas, so mocks and client can't drift apart.
 */

const project1: Viewer = { id: "project:p-001", role: "Client", clientId: "c-001", name: "Ufuq", scope: "project", projectId: "p-001" };
const admin: Viewer = { id: "u-dev-001", role: "Dev", clientId: null, name: "NULL", scope: "full", projectId: null };

async function call(v: Viewer, method: string, path: string, body?: unknown) {
  const res = await getResponse(
    handlers,
    new Request(`http://mock.local/api/proxy/${path}`, {
      method,
      headers: { "content-type": "application/json", [VIEWER_HEADER]: encodeViewer(v) },
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  );
  const text = res ? await res.text() : "";
  return { status: res?.status ?? 404, body: text ? JSON.parse(text) : null };
}

beforeEach(() => {
  delete (globalThis as { __nsMockDb?: unknown }).__nsMockDb;
});

describe("access codes", () => {
  it("are 80-bit, well formed and forgiving about how they're typed", () => {
    const code = generateAccessCode();
    expect(code).toMatch(/^NS-[A-HJ-NP-Z2-9]{4}(-[A-HJ-NP-Z2-9]{4}){3}$/);
    const raw = normalizeAccessCode(code)!;
    expect(raw).toHaveLength(16);
    expect(normalizeAccessCode(code.toLowerCase().replace(/-/g, " "))).toBe(raw);
    expect(normalizeAccessCode(raw)).toBe(raw);
    expect(normalizeAccessCode("NS-7K2M9")).toBeNull(); // the old short project number
    expect(normalizeAccessCode("NS-0000-1111-OOOO-IIII")).toBeNull(); // letters we never use
    expect(new Set(Array.from({ length: 200 }, generateAccessCode)).size).toBe(200);
  });

  it("the seeded code opens its project; a wrong one opens nothing", () => {
    expect(projectByAccessCode(DEV_ACCESS_CODES["p-001"])?.project.id).toBe("p-001");
    expect(projectByAccessCode(DEV_ACCESS_CODES["p-001"].toLowerCase())?.project.id).toBe("p-001");
    expect(projectByAccessCode(generateAccessCode())).toBeNull();
    expect(projectByAccessCode("")).toBeNull();
  });

  it("replacing a code kills the old one; turning access off kills both", async () => {
    const before = accessOf("p-001")!;
    const issued = s.issuedAccessCode.parse((await call(admin, "POST", "admin/projects/p-001/access")).body);
    expect(projectByAccessCode(DEV_ACCESS_CODES["p-001"])).toBeNull();
    const now = projectByAccessCode(issued.accessCode)!;
    expect(now.project.id).toBe("p-001");
    expect(now.access.id).not.toBe(before.id); // sessions opened with the old code no longer match

    expect((await call(admin, "DELETE", "admin/projects/p-001/access")).status).toBe(204);
    expect(projectByAccessCode(issued.accessCode)).toBeNull();
    expect(s.projectAccess.parse((await call(admin, "GET", "admin/projects/p-001/access")).body).active).toBe(false);
  });

  it("the stored access never contains the code", () => {
    const stored = JSON.stringify(accessOf("p-001"));
    expect(stored).not.toContain(normalizeAccessCode(DEV_ACCESS_CODES["p-001"]));
  });

  it("team sign-in needs the configured password", () => {
    expect(checkStaffPassword("null-team-dev")).toBe(true); // local default, never in production
    expect(checkStaffPassword("wrong")).toBe(false);
    expect(checkStaffPassword(undefined)).toBe(false);
  });
});

describe("a client sees their one project", () => {
  it("projects, detail, progress and gates match the schemas", async () => {
    const list = await call(project1, "GET", "projects/mine");
    expect(z.array(s.projectSummary).parse(list.body).map((p) => p.id)).toEqual(["p-001"]);

    const summary = s.projectProgressSummary.parse((await call(project1, "GET", "projects/p-001/summary")).body);
    expect(summary.currentGate).toBe("G4");
    expect(summary.gatesDone).toBe(4);

    const gates = z.array(s.gate).parse((await call(project1, "GET", "projects/p-001/gates")).body);
    expect(gates).toHaveLength(10);
  });

  it("can't see the same company's other project", async () => {
    expect((await call(project1, "GET", "projects/p-002")).status).toBe(404);
    const inv = s.paginated(s.invoiceSummary).parse((await call(project1, "GET", "invoices")).body);
    expect(inv.items.every((i) => i.projectId === "p-001")).toBe(true);
  });

  it("change request: client opens it, NULL replies, client is notified, client may only close it", async () => {
    const created = s.changeRequest.parse(
      (await call(project1, "POST", "projects/p-001/requests", { type: "comment", subject: "Test subject", body: "A test comment body." })).body,
    );
    const reply = s.changeRequestMessage.parse((await call(admin, "POST", `requests/${created.id}/messages`, { body: "On it." })).body);
    expect(reply.authorRole).toBe("null_team");
    const notes = s.notificationList.parse((await call(project1, "GET", "notifications")).body);
    expect(notes.items[0].type).toBe("request_replied");

    expect((await call(project1, "PATCH", `requests/${created.id}`, { status: "in_progress" })).status).toBe(403);
    expect((await call(project1, "PATCH", `requests/${created.id}`, { status: "closed" })).status).toBe(200);
    expect((await call(project1, "POST", `requests/${created.id}/messages`, { body: "one more" })).status).toBe(409);
  });

  it("downloads files and invoice PDFs for its own project only", async () => {
    const pdf = await getResponse(
      handlers,
      new Request("http://mock.local/api/proxy/invoices/i-021/pdf", { headers: { [VIEWER_HEADER]: encodeViewer(project1) } }),
    );
    expect(pdf?.status).toBe(200);
    expect(pdf?.headers.get("content-type")).toBe("application/pdf");
    expect(pdf?.headers.get("content-disposition")).toMatch(/^attachment;/);
    expect(new TextDecoder().decode(await pdf!.arrayBuffer()).startsWith("%PDF-1.4")).toBe(true);

    const other: Viewer = { ...project1, id: "project:p-002", projectId: "p-002" };
    const docs = s.paginated(s.documentMeta).parse((await call(project1, "GET", "documents")).body);
    const denied = await getResponse(
      handlers,
      new Request(`http://mock.local/api/proxy/documents/${docs.items[0].id}/content`, { headers: { [VIEWER_HEADER]: encodeViewer(other) } }),
    );
    expect(denied?.status).toBe(404);
  });

  it("can't reach admin or partner data", async () => {
    expect((await call(project1, "GET", "admin/clients")).status).toBe(403);
    expect((await call(project1, "POST", "admin/projects/p-001/access")).status).toBe(403);
    expect((await call(project1, "GET", "partner/metrics")).status).toBe(403);
  });
});

describe("admin sets a new project up end to end", () => {
  it("client → project → code → gates → invoice → payment → file, and nobody else sees it", async () => {
    const c = s.client.parse((await call(admin, "POST", "admin/clients", { name: "Dar Build", contactEmail: "it@darbuild.jo", serviceLineCodes: ["S1"] })).body);
    const detail = s.adminClientDetail.parse((await call(admin, "GET", `admin/clients/${c.id}`)).body);
    expect(detail.projects).toHaveLength(0);

    // Creating the project hands back its first access code in the same response.
    const p = s.createdProject.parse(
      (await call(admin, "POST", "admin/projects", { clientId: c.id, name: "Company website", serviceLineCode: "S1", targetDate: "2026-12-15" })).body,
    );
    expect(p.currentGate).toBe("G0");
    expect(p.access).toBeDefined();
    expect(projectByAccessCode(p.access!.accessCode)?.project.id).toBe(p.id);
    expect(s.projectAccess.parse((await call(admin, "GET", `admin/projects/${p.id}/access`)).body).active).toBe(true);

    // Replacing it: the new code works, the first one stops.
    const issued = s.issuedAccessCode.parse((await call(admin, "POST", `admin/projects/${p.id}/access`)).body);
    expect(projectByAccessCode(issued.accessCode)?.project.id).toBe(p.id);
    expect(projectByAccessCode(p.access!.accessCode)).toBeNull();

    s.project.parse((await call(admin, "POST", `admin/projects/${p.id}/advance`)).body);
    const advanced = s.project.parse((await call(admin, "POST", `admin/projects/${p.id}/advance`)).body);
    expect(advanced.currentGate).toBe("G2");

    const m = s.milestone.parse((await call(admin, "POST", `admin/projects/${p.id}/milestones`, { title: "Homepage design", gate: "G4" })).body);
    s.milestone.parse((await call(admin, "PATCH", `admin/milestones/${m.id}`, { status: "done" })).body);

    const inv = s.invoice.parse(
      (await call(admin, "POST", `admin/projects/${p.id}/invoices`, { description: "Deposit", amount: "800", dueDate: "2026-10-30" })).body,
    );
    const paid = s.invoice.parse((await call(admin, "POST", `admin/invoices/${inv.id}/payments`, { amount: "300", method: "cliq" })).body);
    expect(paid.amountDue.amount).toBe("500.000");

    s.documentMeta.parse((await call(admin, "POST", `admin/projects/${p.id}/documents`, { name: "Sitemap.pdf", type: "deliverable" })).body);

    // Progress set by hand wins, and survives the next gate move.
    expect(s.project.parse((await call(admin, "PATCH", `admin/projects/${p.id}/progress`, { percentComplete: 40 })).body).percentComplete).toBe(40);
    expect((await call(admin, "PATCH", `admin/projects/${p.id}/progress`, { percentComplete: 140 })).status).toBe(422);
    s.project.parse((await call(admin, "POST", `admin/projects/${p.id}/advance`)).body);
    const sum = s.projectProgressSummary.parse((await call(admin, "GET", `projects/${p.id}/summary`)).body);
    expect(sum.percentComplete).toBe(40);
    expect(sum.payments).toEqual({ total: 1, paid: 0, remaining: { currency: "JOD", amount: "500.000" }, nextDue: expect.any(String) });

    // Opened with its code, the project shows exactly its own money, files and news.
    // (Named in Arabic on purpose: the viewer header must survive non-Latin names.)
    const viewer: Viewer = { id: `project:${p.id}`, role: "Client", clientId: c.id, name: "دار البناء", scope: "project", projectId: p.id };
    expect(z.array(s.projectSummary).parse((await call(viewer, "GET", "projects/mine")).body).map((x) => x.id)).toEqual([p.id]);
    expect(s.paginated(s.invoiceSummary).parse((await call(viewer, "GET", "invoices")).body).total).toBe(1);
    expect(s.paginated(s.documentMeta).parse((await call(viewer, "GET", "documents")).body).total).toBe(1);
    expect(s.notificationList.parse((await call(viewer, "GET", "notifications")).body).unreadCount).toBeGreaterThanOrEqual(6);

    // …and the other client doesn't, either way round.
    expect((await call(project1, "GET", `projects/${p.id}`)).status).toBe(404);
    expect((await call(viewer, "GET", "projects/p-001")).status).toBe(404);
    const theirNotes = s.notificationList.parse((await call(project1, "GET", "notifications")).body);
    expect(theirNotes.items.some((n) => n.link?.id === p.id)).toBe(false);
  });

  it("the team has no client inbox", async () => {
    expect(s.notificationList.parse((await call(admin, "GET", "notifications")).body).total).toBe(0);
  });
});
