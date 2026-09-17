/**
 * Parse Rupiah amounts from Indonesian bank notification emails.
 * Handles multiple formatting conventions.
 *
 * IMPORTANT: This function determines financial data integrity.
 * Every edge case must be covered and tested.
 */
export function parseRupiah(input: string): number {
  if (!input || typeof input !== "string") {
    throw new Error("parseRupiah: empty or non-string input");
  }

  // Strip currency prefix and whitespace (including non-breaking spaces)
  const s = input
    .replace(/\u00A0/g, " ")
    .replace(/^(IDR\.?|Rp\.?|RP\.?|IDR)\s*/i, "")
    .trim();

  if (!s) {
    throw new Error("parseRupiah: empty after stripping prefix");
  }

  const lastDot = s.lastIndexOf(".");
  const lastComma = s.lastIndexOf(",");

  if (lastDot === -1 && lastComma === -1) {
    const n = parseInt(s, 10);
    if (isNaN(n)) throw new Error(`parseRupiah: invalid amount: "${input}"`);
    return n;
  }

  let intPart: string;
  let fracPart: string | null = null;

  if (lastDot !== -1 && lastComma !== -1) {
    // Two separator types: last one is decimal separator
    if (lastDot > lastComma) {
      // US style: 50,000,000.00
      intPart = s.substring(0, lastDot).replace(/,/g, "");
      fracPart = s.substring(lastDot + 1);
    } else {
      // Indonesian style: 50.000.000,00
      intPart = s.substring(0, lastComma).replace(/\./g, "");
      fracPart = s.substring(lastComma + 1);
    }
  } else {
    // Single separator type
    const sep = lastDot !== -1 ? "." : ",";
    const parts = s.split(sep);

    // If all groups are exactly 3 digits → thousands separator, no decimals
    const allGroupsOfThree = parts.length > 1 && parts.every((p) => p.length === 3);

    if (allGroupsOfThree) {
      intPart = s.replace(new RegExp("\\" + sep, "g"), "");
    } else {
      // Could be decimal — reject fractional sen
      intPart = s.replace(new RegExp("\\" + sep, "g"), "");
      fracPart = parts[parts.length - 1];
    }
  }

  // Reject fractional sen (anything other than .00 or ,00)
  if (fracPart !== null && fracPart !== "00") {
    throw new Error(
      `parseRupiah: fractional sen detected in "${input}". LPG invoices have no sen.`
    );
  }

  const n = parseInt(intPart, 10);
  if (isNaN(n)) {
    throw new Error(`parseRupiah: could not parse integer from "${input}"`);
  }

  return n;
}
