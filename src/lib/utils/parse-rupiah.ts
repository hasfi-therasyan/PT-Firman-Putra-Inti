/**
 * Parse Indonesian rupiah strings to integer.
 * Handles: IDR 50,000,000.00 | Rp 50.000.000,00 | 4.500.317 etc.
 * Returns bigint-like number. Fails on fractional sen values.
 */
export function parseRupiah(input: string): number {
  if (!input || typeof input !== "string") {
    throw new Error("Invalid input: empty or non-string");
  }

  // Strip currency prefix and whitespace
  const s = input
    .replace(/\u00A0/g, " ") // non-breaking space
    .replace(/^(IDR\.?|Rp\.?|RP\.?|Rp)\s*/i, "")
    .trim();

  if (!s) {
    throw new Error("Invalid input: empty after stripping prefix");
  }

  // Find last separator position
  const lastDot = s.lastIndexOf(".");
  const lastComma = s.lastIndexOf(",");

  if (lastDot === -1 && lastComma === -1) {
    // No separators — pure digits
    const n = parseInt(s, 10);
    if (isNaN(n)) throw new Error(`Invalid amount: ${input}`);
    return n;
  }

  const lastSep = Math.max(lastDot, lastComma);
  const afterLast = s.substring(lastSep + 1);

  // Determine decimal vs thousands separator
  let intPart: string;
  let fracPart: string | null = null;

  if (lastDot !== -1 && lastComma !== -1) {
    // Two separator types: the last one is the decimal separator
    if (lastDot > lastComma) {
      // US style: 50,000,000.00
      intPart = s.substring(0, lastDot).replace(/,/g, "");
      fracPart = afterLast;
    } else {
      // Indonesian style: 50.000.000,00
      intPart = s.substring(0, lastComma).replace(/\./g, "");
      fracPart = afterLast;
    }
  } else {
    // Single separator type
    // Check if all groups are 3 digits → thousands separator, no decimals
    const sep = lastDot !== -1 ? "." : ",";
    const parts = s.split(sep);
    const allGroupsOfThree = parts.every((p) => p.length === 3);

    if (allGroupsOfThree && parts.length > 1) {
      // 50.000.000 → all groups of 3 → thousands only
      intPart = s.replace(sep, "");
    } else {
      // Could be decimal — but we reject fractional sen
      intPart = s.replace(sep, "");
      fracPart = afterLast;
    }
  }

  // Validate fractional part — reject anything other than .00 or ,00
  if (fracPart && fracPart !== "00") {
    throw new Error(
      `Invalid amount: fractional value detected (${input}). LPG invoices should not have sen.`
    );
  }

  const n = parseInt(intPart, 10);
  if (isNaN(n)) {
    throw new Error(`Invalid amount: ${input}`);
  }

  return n;
}
