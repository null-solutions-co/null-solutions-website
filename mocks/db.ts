/**
 * The mock backend's database — one in-memory store on the Next.js server.
 *
 * It stands in for PostgreSQL until the real API exists: every mock request
 * (the BFF proxy, team sign-in, access-code entry) reads and writes this same
 * store, so a project set up in the admin screens can be opened with its
 * access code and shows exactly that project, the way the real system will.
 *
 * Kept on globalThis so route modules and hot reloads share one instance.
 * Resets when the server restarts — it is a mock, not persistence.
 */
import type {
  ChangeRequest,
  Client,
  DocumentMeta,
  Gate,
  GateId,
  Invoice,
  InvoiceSummary,
  Milestone,
  Notification,
  Project,
  ProjectProgressSummary,
  ProjectSummary,
  Role,
  UserSummary,
} from "@/lib/api/schemas";
import { generateAccessCode, hashAccessCode, normalizeAccessCode, sameHash } from "@/lib/auth/access-code";
import * as fx from "./fixtures/data";

/** NULL team accounts. Clients have no accounts: they use a project access code. */
export type MockUser = UserSummary;

export type StoredNotification = Notification & { projectId: string | null };

/** A project's current access code: its hash only, never the code itself. */
export type StoredAccess = { id: string; hash: string; issuedAt: string };

export type Db = {
  users: MockUser[];
  clients: Client[];
  projects: Record<string, Project>;
  gates: Record<string, Gate[]>;
  milestones: Record<string, Milestone[]>;
  invoices: Record<string, Invoice>;
  documents: DocumentMeta[];
  requests: Record<string, ChangeRequest>;
  notifications: StoredNotification[];
  access: Record<string, StoredAccess | null>;
  /** Progress set by hand from the admin page; wins over the gate-based figure. */
  manualPercent: Record<string, number>;
  seq: number;
};

export const GATE_IDS = ["G0", "G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8", "G9"] as const;
export const GATE_TITLES: Record<GateId, string> = {
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

/** Seeded NULL team account. Its password is MOCK_STAFF_PASSWORD (see checkStaffPassword). */
export const SEED_ADMIN_EMAIL = "admin@nullsolutions.jo";

/**
 * Access codes for the seeded projects, so the client view can be tried
 * locally. Development and tests only: a production server (even one
 * deliberately run in mock mode) starts with no codes at all.
 */
export const DEV_ACCESS_CODES: Record<string, string> = {
  "p-001": "NS-7K2M-9QXA-4HPD-3WRT",
  "p-002": "NS-UFQ2-DLVR-8K4E-M6NB",
};

function storedAccess(code: string, issuedAt: string): StoredAccess {
  return { id: crypto.randomUUID(), hash: hashAccessCode(normalizeAccessCode(code) ?? ""), issuedAt };
}

function seed(): Db {
  const gates = structuredClone(fx.gates);
  // p-002 is delivered: every gate done.
  gates["p-002"] = GATE_IDS.map((id) => ({
    id,
    title: GATE_TITLES[id],
    status: "done",
    startedAt: "2026-02-01T00:00:00Z",
    completedAt: "2026-05-15T00:00:00Z",
  }));

  return {
    users: [
      {
        id: "u-dev-001",
        email: SEED_ADMIN_EMAIL,
        displayName: "NULL Team",
        role: "Dev",
        clientId: null,
        locale: "ar",
      },
    ],
    clients: structuredClone(fx.clients),
    projects: structuredClone(fx.projects),
    gates,
    milestones: { "p-002": [], ...structuredClone(fx.milestones) },
    invoices: structuredClone(fx.invoices),
    documents: structuredClone(fx.documents),
    requests: structuredClone(fx.changeRequests),
    notifications: fx.notifications.map((n) => ({ ...n, projectId: "p-001" })),
    access:
      process.env.NODE_ENV === "production"
        ? {}
        : Object.fromEntries(
            Object.entries(DEV_ACCESS_CODES).map(([id, code]) => [id, storedAccess(code, "2026-08-01T09:00:00Z")]),
          ),
    manualPercent: {},
    seq: 1000,
  };
}

const g = globalThis as unknown as { __nsMockDb?: Db };

export function db(): Db {
  if (!g.__nsMockDb) {
    g.__nsMockDb = seed();
    for (const id of Object.keys(g.__nsMockDb.projects)) recompute(id);
  }
  return g.__nsMockDb;
}

export const nextId = (prefix: string) => `${prefix}-${++db().seq}`;
export const now = () => new Date().toISOString();

// ---- money ----

export const toNumber = (amount: string) => Number.parseFloat(amount) || 0;
export const jod = (n: number) => ({ currency: "JOD" as const, amount: n.toFixed(3) });

// ---- derived views ----

export function summaryOf(p: Project): ProjectSummary {
  const { id, code, name, serviceLine, status, percentComplete, currentGate, startedAt, targetDate } = p;
  return { id, code, name, serviceLine, status, percentComplete, currentGate, startedAt, targetDate };
}

export function invoiceSummaryOf(i: Invoice): InvoiceSummary {
  const { id, number, projectId, projectName, issueDate, dueDate, status, total, amountPaid, amountDue } = i;
  return { id, number, projectId, projectName, issueDate, dueDate, status, total, amountPaid, amountDue };
}

/** Keep a project's progress fields in step with its gates. */
export function recompute(projectId: string) {
  const d = g.__nsMockDb ?? db();
  const p = d.projects[projectId];
  const gates = d.gates[projectId];
  if (!p || !gates) return;
  const done = gates.filter((x) => x.status === "done").length;
  const current = gates.find((x) => x.status === "in_progress") ?? gates.find((x) => x.status !== "done");
  p.percentComplete = Math.min(100, Math.round(done * 10 + (current?.status === "in_progress" ? 5 : 0)));
  p.currentGate = current?.id ?? "G9";
  if (done === gates.length) {
    p.status = "delivered";
    p.percentComplete = 100;
  }
  const manual = d.manualPercent?.[projectId];
  if (manual !== undefined) p.percentComplete = manual;
  p.updatedAt = now();
}

export function progressOf(projectId: string): ProjectProgressSummary | null {
  const d = db();
  const p = d.projects[projectId];
  const gates = d.gates[projectId];
  if (!p || !gates) return null;
  const done = gates.filter((x) => x.status === "done").length;
  const idx = GATE_IDS.indexOf(p.currentGate);
  const bills = Object.values(d.invoices).filter((i) => i.projectId === projectId && i.status !== "void");
  const due = bills.reduce((sum, i) => sum + toNumber(i.amountDue.amount), 0);
  const unpaid = bills
    .filter((i) => i.status !== "paid")
    .sort((a, b) => (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999"));
  const eta = p.estimatedCompletionDate ?? p.targetDate;
  return {
    projectId: p.id,
    code: p.code,
    name: p.name,
    status: p.status,
    percentComplete: p.percentComplete,
    currentGate: p.currentGate,
    currentGateTitle: GATE_TITLES[p.currentGate],
    nextGate: done === gates.length || idx >= 9 ? null : GATE_IDS[idx + 1],
    gatesDone: done,
    gatesTotal: gates.length,
    estimatedCompletionDate: eta,
    daysRemaining: eta ? Math.max(0, Math.ceil((Date.parse(eta) - Date.now()) / 86_400_000)) : null,
    outstandingBalance: jod(due),
    payments: {
      total: bills.length,
      paid: bills.length - unpaid.length,
      remaining: jod(due),
      nextDue: unpaid[0]?.dueDate ?? null,
    },
    updatedAt: p.updatedAt,
  };
}

/** Tell the client of one project that something happened. */
export function notify(
  projectId: string | null,
  n: Omit<StoredNotification, "id" | "isRead" | "createdAt" | "projectId">,
) {
  db().notifications.unshift({ ...n, id: nextId("n"), isRead: false, createdAt: now(), projectId });
}

// ---- identity ----

/** Who is calling — set by the BFF proxy from the session, read by handlers. */
export type Viewer = {
  id: string | null;
  role: Role | null;
  clientId: string | null;
  name: string;
  scope: "full" | "project";
  projectId: string | null;
};

export const VIEWER_HEADER = "x-mock-viewer";

/**
 * The viewer travels in a header, and header values must be Latin-1 — a client
 * named in Arabic would throw. So it's JSON, percent-encoded.
 */
export const encodeViewer = (v: unknown) => encodeURIComponent(JSON.stringify(v));
export const decodeViewer = (raw: string | null): Record<string, unknown> => {
  if (!raw) return {};
  try {
    return JSON.parse(decodeURIComponent(raw));
  } catch {
    return {};
  }
};

/** Projects this viewer may see: the team sees everything, a client their one project. */
export function visibleProjectIds(v: Viewer): string[] {
  const d = db();
  if (v.scope === "project") return v.projectId && d.projects[v.projectId] ? [v.projectId] : [];
  if (v.role === "Dev" || v.role === "Partner") return Object.keys(d.projects);
  return [];
}

// ---- project access codes ----

export function accessOf(projectId: string): StoredAccess | null {
  return db().access[projectId] ?? null;
}

/** Issue (or re-issue) a project's code. Returns the plain code: the one time it exists. */
export function issueAccess(projectId: string): { accessCode: string; issuedAt: string } {
  const accessCode = generateAccessCode();
  const issuedAt = now();
  db().access[projectId] = storedAccess(accessCode, issuedAt);
  return { accessCode, issuedAt };
}

export function revokeAccess(projectId: string) {
  db().access[projectId] = null;
}

/** The project a typed code opens. Every stored hash is compared, in constant time. */
export function projectByAccessCode(input: string): { project: Project; access: StoredAccess } | null {
  const normalized = normalizeAccessCode(input);
  const hash = hashAccessCode(normalized ?? "-");
  const d = db();
  let found: { project: Project; access: StoredAccess } | null = null;
  for (const [projectId, access] of Object.entries(d.access)) {
    if (access && sameHash(access.hash, hash) && d.projects[projectId]) {
      found = { project: d.projects[projectId], access };
    }
  }
  return normalized ? found : null;
}

// ---- generators ----

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/**
 * Project number, e.g. NS-7K2M9: a reference printed on proposals and
 * invoices. Not a secret and not a way in; that's the access code.
 */
export function newProjectCode(): string {
  const taken = new Set(Object.values(db().projects).map((p) => p.code));
  for (;;) {
    let code = "NS-";
    for (let i = 0; i < 5; i++) code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
    if (!taken.has(code)) return code;
  }
}

export function newInvoiceNumber(): string {
  const max = Object.values(db().invoices).reduce((m, i) => {
    const n = Number.parseInt(i.number.split("-").pop() ?? "0", 10);
    return Number.isFinite(n) ? Math.max(m, n) : m;
  }, 0);
  return `NS-${new Date().getFullYear()}-${String(max + 1).padStart(3, "0")}`;
}

export function findUserByEmail(email: string): MockUser | undefined {
  const e = email.trim().toLowerCase();
  return db().users.find((u) => u.email.toLowerCase() === e);
}

/**
 * Mock team sign-in. The password comes from MOCK_STAFF_PASSWORD; with none
 * set, development falls back to a local-only default and production refuses
 * every attempt. Compared in constant time.
 */
export function checkStaffPassword(password: unknown): boolean {
  const expected =
    process.env.MOCK_STAFF_PASSWORD || (process.env.NODE_ENV === "production" ? "" : "null-team-dev");
  if (!expected || typeof password !== "string") return false;
  return sameHash(hashAccessCode(`pw:${password}`), hashAccessCode(`pw:${expected}`));
}

export function toUserSummary(u: MockUser): UserSummary {
  const { id, email, displayName, role, clientId, locale } = u;
  return { id, email, displayName, role, clientId, locale };
}
