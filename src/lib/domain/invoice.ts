/**
 * Invoice numbering and calculation utilities.
 */

/**
 * Generate invoice number from format string.
 * e.g. format "INV/YYYY/MM/NNNN" → "INV/2026/09/0001"
 */
export function generateInvoiceNumber(
  format: string,
  sequence: number,
  date: Date = new Date()
): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const seq = String(sequence).padStart(4, "0");

  return format
    .replace("YYYY", String(year))
    .replace("MM", month)
    .replace("NNNN", seq);
}

/** Calculate total = subtotal + penyesuaian + kode_unik */
export function calculateTotal(subtotal: number, penyesuaian: number, kode_unik: number): number {
  return subtotal + penyesuaian + kode_unik;
}

/** Calculate line total from qty and unit_price */
export function calculateLineTotal(qty: number, unit_price: number): number {
  return qty * unit_price;
}

/**
 * Generate a unique kode_unik (3-digit suffix) for unpaid invoices.
 * Returns a number between 100-999 that is not currently used
 * by any unpaid invoice.
 */
export function generateKodeUnik(existingKodeUniks: number[]): number {
  const used = new Set(existingKodeUniks);
  for (let i = 100; i <= 999; i++) {
    if (!used.has(i)) return i;
  }
  throw new Error("All kode_unik values are exhausted");
}
