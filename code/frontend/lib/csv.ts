export type CsvRow = Record<string, string>;

/**
 * Very small CSV parser (handles commas + quotes).
 * Assumes first row is headers.
 */
export function parseCsv(text: string): CsvRow[] {
  const rows: string[][] = [];
  let cur: string[] = [];
  let cell = "";
  let inQuotes = false;

  function pushCell() {
    cur.push(cell);
    cell = "";
  }
  function pushRow() {
    // ignore completely empty trailing row
    if (cur.length === 1 && cur[0].trim() === "") {
      cur = [];
      return;
    }
    rows.push(cur);
    cur = [];
  }

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (ch === '"' ) {
      if (inQuotes && next === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && ch === ",") {
      pushCell();
      continue;
    }

    if (!inQuotes && (ch === "\n" || ch === "\r")) {
      // handle CRLF
      if (ch === "\r" && next === "\n") i++;
      pushCell();
      pushRow();
      continue;
    }

    cell += ch;
  }

  // last cell/row
  pushCell();
  pushRow();

  if (rows.length === 0) return [];
  const headers = rows[0].map(h => h.trim().toLowerCase());
  const out: CsvRow[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const obj: CsvRow = {};
    for (let j = 0; j < headers.length; j++) {
      const key = headers[j] || `col_${j}`;
      obj[key] = (row[j] ?? "").trim();
    }
    // skip empty rows
    const any = Object.values(obj).some(v => v && v.trim() !== "");
    if (any) out.push(obj);
  }
  return out;
}

export function pick(row: CsvRow, keys: string[]): string {
  for (const k of keys) {
    const v = row[k];
    if (v && v.trim() !== "") return v.trim();
  }
  return "";
}
