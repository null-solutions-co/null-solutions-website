import { describe, expect, it } from "vitest";
import en from "@/messages/en.json";
import { COMPANY } from "./company";
import { PORTFOLIO } from "./portfolio";
import { instagramHandle, mergeMessages, parseCompany, parsePortfolio, parseSiteMessages } from "./cms-parse";

describe("mergeMessages", () => {
  const bundled = {
    nav: { home: "Home", about: "About" },
    list: ["a", "b"],
    facts: [{ n: 11, label: "lines" }],
    count: "{count, plural, one {# client} other {# clients}}",
  };

  it("lays CMS texts over the bundled ones", () => {
    const out = mergeMessages(bundled, { nav: { home: "Start" }, facts: [{ n: 12 }] });
    expect(out.nav).toEqual({ home: "Start", about: "About" });
    expect(out.facts).toEqual([{ n: 12, label: "lines" }]);
    expect(out.count).toBe(bundled.count);
  });

  it("falls back to bundled for missing, blank or mistyped values", () => {
    const out = mergeMessages(bundled, { nav: { home: "", about: null }, list: "oops", count: { x: 1 } });
    expect(out).toEqual(bundled);
  });

  it("keeps the bundled array length", () => {
    expect(mergeMessages(bundled, { list: ["x", "y", "z"] }).list).toEqual(["x", "y"]);
    expect(mergeMessages(bundled, { list: ["x"] }).list).toEqual(["x", "b"]);
  });

  it("keeps extra CMS keys and does not mutate its inputs", () => {
    const copy = structuredClone(bundled);
    const out = mergeMessages(bundled, { extra: { k: "v" } }) as typeof bundled & { extra?: unknown };
    expect(out.extra).toEqual({ k: "v" });
    expect(bundled).toEqual(copy);
  });

  it("is the identity for a CMS copy of the bundled file", () => {
    expect(mergeMessages(en, structuredClone(en))).toEqual(en);
  });
});

describe("parseSiteMessages", () => {
  it("accepts the platform payload and rejects anything else", () => {
    expect(parseSiteMessages({ locale: "en", updatedAt: null, messages: { a: "b" } })).toEqual({ a: "b" });
    expect(parseSiteMessages({ messages: ["x"] })).toBeNull();
    expect(parseSiteMessages(null)).toBeNull();
  });
});

describe("parsePortfolio", () => {
  it("accepts the site's own PortfolioEntry shape", () => {
    expect(parsePortfolio({ entries: PORTFOLIO })).toEqual(PORTFOLIO);
  });

  it("accepts absolute platform image URLs", () => {
    const entry = { ...PORTFOLIO[0], shot: "https://platform.example/api/media/abc" };
    expect(parsePortfolio({ entries: [entry] })?.[0].shot).toBe(entry.shot);
  });

  it("rejects a malformed list", () => {
    expect(parsePortfolio({ entries: [{ slug: "x" }] })).toBeNull();
    expect(parsePortfolio({ entries: [{ ...PORTFOLIO[0], kind: "erp" }] })).toBeNull();
    expect(parsePortfolio({})).toBeNull();
  });
});

describe("parseCompany", () => {
  it("maps /api/public/site onto the COMPANY shape", () => {
    const out = parseCompany({
      company: {
        email: "hello@null-solutions.com",
        phone: "+962 79 000 0000",
        social: { instagram: "https://www.instagram.com/null_solutions/", linkedin: "https://www.linkedin.com/company/null" },
      },
    });
    expect(out).toEqual({
      email: "hello@null-solutions.com",
      phone: "+962 79 000 0000",
      instagram: { handle: "null_solutions", href: "https://www.instagram.com/null_solutions/" },
      social: [
        { label: "Instagram", href: "https://www.instagram.com/null_solutions/" },
        { label: "LinkedIn", href: "https://www.linkedin.com/company/null" },
      ],
    });
  });

  it("matches COMPANY for the platform's seeded values", () => {
    const out = parseCompany({
      company: { email: COMPANY.email, phone: null, social: { instagram: COMPANY.instagram.href, linkedin: null } },
    });
    expect(out).toEqual(COMPANY);
  });

  it("keeps bundled values for empty or unsafe fields", () => {
    const out = parseCompany({
      company: { email: "not-an-email", phone: "", social: { instagram: "javascript:alert(1)", linkedin: "ftp://x" } },
    });
    expect(out).toEqual(COMPANY);
    expect(parseCompany({ nope: true })).toEqual(COMPANY);
  });

  it("reads the Instagram handle", () => {
    expect(instagramHandle("https://instagram.com/abc.def")).toBe("abc.def");
    expect(instagramHandle("https://evil.example/abc")).toBeNull();
  });
});
