/**
 * The portfolio: companies NULL has delivered for.
 *
 * Only facts go in here. A field we don't have yet is left out and the page
 * simply doesn't show it (Gate 0 #4: nothing invented). To add a client: an
 * entry below, plus optionally their logo in public/assets/partners/ and a
 * 1440×900 screenshot of the live site in public/assets/portfolio/.
 */

type Localized = { ar: string; en: string };

export type WorkKind = "website" | "app" | "software";

export type PortfolioEntry = {
  slug: string;
  name: Localized;
  kind: WorkKind;
  /** The cover: a colour the work sits well on, and whether text on it is light or dark. */
  cover: {
    bg: string;
    ink: "light" | "dark";
    art?: { src: string; w: number; h: number };
    /** Apps with no screenshot: a line icon for what the app is about, drawn on the phone outline. */
    icon?: "coffee" | "car";
  };
  logo?: { src: string; w: number; h: number };
  /** Screenshot of the live site (websites); replaces the logo cover. */
  shot?: string;
  /** Public address, shown as a link. */
  url?: string;
  /** The company's full name as they write it, when the short one is initials. */
  fullName?: Localized;
  summary?: Localized;
};

export const PORTFOLIO: PortfolioEntry[] = [
  {
    slug: "fancy-design",
    name: { ar: "فانسي", en: "Fancy Design" },
    kind: "website",
    cover: { bg: "#f2f2f2", ink: "dark" },
    shot: "/assets/portfolio/fancy-design.jpg",
    url: "https://fancydesign.com.sa",
  },
  {
    slug: "al-rayyan",
    name: { ar: "الريان", en: "Al-Rayyan Group" },
    kind: "website",
    cover: { bg: "#161616", ink: "light" },
    shot: "/assets/portfolio/al-rayyan.jpg",
    url: "https://alrayyanjo.com",
  },
  {
    slug: "fcd",
    name: { ar: "FCD", en: "FCD" },
    kind: "website",
    cover: { bg: "#e9e9e9", ink: "dark" },
    shot: "/assets/portfolio/fcd.jpg",
    url: "https://fcd-co.com",
    fullName: { ar: "شركة الواجهات لتصميم المفاهيم والمقاولات", en: "Façade Concept Design Contracting" },
  },
  {
    slug: "place-it-decor",
    name: { ar: "Place It Decor", en: "Place It Decor" },
    kind: "website",
    cover: { bg: "#1c1c1c", ink: "light" },
    shot: "/assets/portfolio/placeit.jpg",
    url: "https://placeitdecor.com",
  },
  {
    slug: "zaytouna-media",
    name: { ar: "زيتونة ميديا", en: "Zaytouna Media" },
    kind: "website",
    logo: { src: "/assets/partners/zaytouna-media.png", w: 360, h: 450 },
    cover: { bg: "#f4f4f4", ink: "dark" },
  },
  {
    slug: "lore-cafe",
    name: { ar: "لور كافيه", en: "Lore Café" },
    kind: "app",
    cover: { bg: "#161616", ink: "light", icon: "coffee" },
    summary: { ar: "تطبيق جوال صممناه وبنيناه لمقهى لور.", en: "A mobile app we designed and built for Lore Café." },
  },
  {
    slug: "jo-ride",
    name: { ar: "Jo Ride", en: "Jo Ride" },
    kind: "app",
    cover: { bg: "#1c1c1c", ink: "light", icon: "car" },
    summary: { ar: "تطبيق لتأجير السيارات.", en: "A car rental app." },
  },
];
