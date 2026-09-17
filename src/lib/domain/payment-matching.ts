/**
 * Payment matching engine — pure functions.
 * Called by cron and on-demand after ingestion.
 * Never called from React components.
 */

/**
 * Extract invoice number candidates from a remark/berita string.
 * Normalizes separators: INV-2026-09 → INV/2026/09
 */
export function extractInvoiceCandidates(remark: string | null): string[] {
  if (!remark) return [];

  const pattern = /INV[-/]\d{4}[-/]\d{2}[-/]\d+/gi;
  const matches = remark.match(pattern) ?? [];

  return [...new Set(
    matches.map((m) =>
      m.replace(/[-]/g, "/").toUpperCase()
    )
  )];
}

/**
 * Fuzzy match sender name against a known name (pangkalan name or PIC).
 * Simple normalized contains check.
 */
export function namesMatch(senderName: string, knownName: string): boolean {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const normalSender = normalize(senderName);
  const normalKnown = normalize(knownName);

  return (
    normalSender.includes(normalKnown) ||
    normalKnown.includes(normalSender)
  );
}

export interface MatchCandidate {
  invoiceId: string;
  total: number;
  sisa: number;
  pangkalanId: string;
  pangkalanNama: string;
  nomorInvoice: string;
}

export interface MatchResult {
  invoiceId: string;
  nominalDialokasikan: number;
  metode:
    | "auto_exact"
    | "auto_kode_unik"
    | "auto_berita"
    | "auto_nama"
    | "manual";
  confidence: number;
}

/**
 * Attempt to match a payment to invoice(s).
 * Returns empty array if no match found.
 */
export function matchPayment(
  nominal: number,
  berita: string | null,
  senderName: string | null,
  candidates: MatchCandidate[]
): MatchResult[] {
  // 1. Exact total including kode_unik → confidence 0.99
  const exactMatch = candidates.find((c) => c.total === nominal && c.sisa > 0);
  if (exactMatch) {
    return [{
      invoiceId: exactMatch.invoiceId,
      nominalDialokasikan: Math.min(nominal, exactMatch.sisa),
      metode: "auto_exact",
      confidence: 0.99,
    }];
  }

  // 2. Invoice number in remark → confidence 0.95
  const remarkCandidates = extractInvoiceCandidates(berita);
  if (remarkCandidates.length === 1) {
    const target = candidates.find(
      (c) =>
        c.nomorInvoice.toUpperCase().replace(/[-]/g, "/").includes(remarkCandidates[0])
    );
    if (target && nominal <= target.total) {
      return [{
        invoiceId: target.invoiceId,
        nominalDialokasikan: Math.min(nominal, target.sisa),
        metode: "auto_berita",
        confidence: 0.95,
      }];
    }
  }

  // 3. Sender name match + unique candidate → confidence 0.8
  if (senderName) {
    const nameMatches = candidates.filter(
      (c) => namesMatch(senderName, c.pangkalanNama) && c.sisa > 0
    );
    if (nameMatches.length === 1 && nominal <= nameMatches[0].total) {
      return [{
        invoiceId: nameMatches[0].invoiceId,
        nominalDialokasikan: Math.min(nominal, nameMatches[0].sisa),
        metode: "auto_nama",
        confidence: 0.8,
      }];
    }
  }

  // No confident match
  return [];
}
