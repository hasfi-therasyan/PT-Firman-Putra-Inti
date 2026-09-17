/**
 * Invoice status machine — validates transitions.
 * Every status change must go through here.
 */

export type InvoiceStatus =
  | "draft"
  | "issued"
  | "partial"
  | "paid"
  | "overdue"
  | "cancelled";

// Allowed transitions: from → [to, ...]
const TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]> = {
  draft: ["issued", "cancelled"],
  issued: ["partial", "paid", "overdue", "cancelled"],
  partial: ["paid", "overdue", "cancelled"],
  paid: [], // terminal
  overdue: ["paid", "cancelled"],
  cancelled: [], // terminal
};

/**
 * Check if a status transition is valid.
 */
export function canTransition(from: InvoiceStatus, to: InvoiceStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Assert a valid transition or throw.
 */
export function assertTransition(from: InvoiceStatus, to: InvoiceStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(
      `Invalid invoice status transition: ${from} → ${to}. ` +
        `Allowed: ${TRANSITIONS[from]?.join(", ") || "(none)"}`
    );
  }
}

/**
 * Determine the correct status based on payment state.
 * Called after payment allocation changes.
 */
export function deriveStatus(
  input: { currentStatus?: InvoiceStatus; status?: InvoiceStatus; total: number; total_dibayar?: number; totalDibayar?: number; tanggal_jatuh_tempo?: Date | string; jatuhTempo?: Date | string },
): InvoiceStatus;
export function deriveStatus(
  currentStatus: InvoiceStatus,
  total: number,
  totalDibayar: number,
  jatuhTempo: Date | string,
): InvoiceStatus;
export function deriveStatus(
  a: InvoiceStatus | { currentStatus?: InvoiceStatus; status?: InvoiceStatus; total: number; total_dibayar?: number; totalDibayar?: number; tanggal_jatuh_tempo?: Date | string; jatuhTempo?: Date | string },
  b?: number,
  c?: number,
  d?: Date | string,
): InvoiceStatus {
  let currentStatus: InvoiceStatus;
  let total: number;
  let totalDibayar: number;
  let jatuhTempo: Date | string;

  if (typeof a === 'object') {
    currentStatus = a.currentStatus ?? a.status ?? 'draft';
    total = a.total;
    totalDibayar = a.total_dibayar ?? a.totalDibayar ?? 0;
    jatuhTempo = a.tanggal_jatuh_tempo ?? a.jatuhTempo ?? new Date();
  } else {
    currentStatus = a;
    total = b!;
    totalDibayar = c!;
    jatuhTempo = d!;
  }
  // Never override terminal states
  if (currentStatus === "cancelled" || currentStatus === "paid") {
    return currentStatus;
  }

  const now = new Date();
  const deadline = typeof jatuhTempo === "string" ? new Date(jatuhTempo) : jatuhTempo;
  const isOverdue = now > deadline;

  if (totalDibayar >= total) return "paid";
  if (totalDibayar > 0) return isOverdue ? "overdue" : "partial";
  if (isOverdue) return "overdue";
  return currentStatus;
}

/**
 * Calculate invoice total from subtotal, penyesuaian, and kode_unik.
 */
export function calculateTotal(
  subtotal: number,
  penyesuaian: number,
  kodeUnik: number
): number {
  return subtotal + penyesuaian + kodeUnik;
}
