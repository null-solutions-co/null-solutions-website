/**
 * NULL's public contact details, used by the portfolio and contact pages.
 * Only real values go here. An empty field is simply not shown, so the social
 * accounts and phone can be filled in whenever the founder sends them.
 */
export const COMPANY = {
  email: "info@null-solutions.com",
  /** e.g. "+962 7X XXX XXXX" — shown as a tel: link once set. */
  phone: "",
  instagram: { handle: "null_solutions", href: "https://www.instagram.com/null_solutions/" },
  social: [{ label: "Instagram", href: "https://www.instagram.com/null_solutions/" }] as { label: string; href: string }[],
};
