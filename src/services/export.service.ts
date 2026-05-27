function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) return "";

  const text = String(value);
  const mustQuote = /[",\n\r]/.test(text);
  const escaped = text.replace(/"/g, '""');

  return mustQuote ? `"${escaped}"` : escaped;
}

export function buildCsvContent(rows: unknown[][]): string {
  return rows.map((row) => row.map(escapeCsvValue).join(",")).join("\n");
}

export function downloadCsv(content: string, filename: string): void {
  const csvContent = `data:text/csv;charset=utf-8,${encodeURIComponent(content)}`;
  const link = document.createElement("a");
  link.setAttribute("href", csvContent);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
