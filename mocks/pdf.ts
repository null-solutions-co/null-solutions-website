/**
 * A tiny, valid one-page PDF for the mock backend, so "Download" on a file or
 * an invoice returns something a browser can actually open. The real API
 * streams the stored file (docs/api-contract.md §6, §7). Built-in Helvetica
 * only covers Latin, so non-Latin characters are dropped from the text.
 */
export function mockPdf(title: string, lines: string[]): Uint8Array {
  const clean = (s: string) =>
    s.replace(/[^\x20-\x7e]/g, "").replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)").trim();

  const text = [
    "BT /F1 20 Tf 56 770 Td (" + clean(title) + ") Tj ET",
    ...lines.map((l, i) => `BT /F1 11 Tf 56 ${736 - i * 18} Td (${clean(l)}) Tj ET`),
  ].join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${text.length} >>\nstream\n${text}\nendstream`,
  ];

  let out = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((body, i) => {
    offsets.push(out.length);
    out += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = out.length;
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const o of offsets) out += `${String(o).padStart(10, "0")} 00000 n \n`;
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return new TextEncoder().encode(out);
}

/** `attachment` with an ASCII fallback name and the real (UTF-8) one. */
export function attachment(name: string): string {
  const ascii = name.replace(/[^\x20-\x7e]/g, "").replace(/["\\]/g, "").trim() || "document.pdf";
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(name)}`;
}
