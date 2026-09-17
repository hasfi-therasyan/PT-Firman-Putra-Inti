/**
 * MCM (Mandiri Cash Management) email parser.
 * Handles the confirmed notification template from §8 of the build spec.
 */
import { createHash } from "crypto";

export interface ParsedPayment {
  tanggal_transaksi: string;
  jenis: string;
  nominal: number;
  arah: "masuk" | "keluar";
  nama_pengirim: string;
  rekening_pengirim_masked: string;
  nama_tujuan: string;
  rekening_tujuan_masked: string;
  berita: string;
  status_bank: string;
  content_hash: string;
}

export interface ParseFailure {
  error: string;
  field?: string;
}

// Company accounts set (loaded at runtime)
let companyAccounts: string[] = [];

export function setCompanyAccounts(accounts: string[]) {
  companyAccounts = accounts;
}

export function canHandle(subject: string, from: string): boolean {
  const fromLower = from.toLowerCase();
  const subjectLower = subject.toLowerCase();
  
  // TEMPORARY: Melonggarkan filter 'from' agar bisa ditest menggunakan email personal.
  // Untuk production, tambahkan kembali 'fromLower.includes("mandiri") &&'
  return (
    subjectLower.includes("mandiri cash management") ||
    subjectLower.includes("mcm") ||
    subjectLower.includes("transaksi") ||
    fromLower.includes("mcm@bankmandiri")
  );
}

const MONTH_MAP: Record<string, string> = {
  jan: "01", feb: "02", mar: "03", apr: "04",
  may: "05", jun: "06", jul: "07", aug: "08",
  sep: "09", oct: "10", nov: "11", dec: "12",
};

function parseAccountField(raw: string): { rekening: string; nama: string } {
  const idx = raw.indexOf(" - ");
  if (idx === -1) return { rekening: raw.trim(), nama: "" };
  return { rekening: raw.substring(0, idx).trim(), nama: raw.substring(idx + 3).trim() };
}

export function parse(body: string): ParsedPayment | ParseFailure {
  const text = body
    .replace(/\r/g, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/tr>/gi, "\n")
    .replace(/<[^>]*>/g, "");

  const fields: Record<string, string> = {};
  for (const line of text.split("\n")) {
    const m = line.match(/^\s*([\w\s/]+?)\s*:\s*(.+)$/);
    if (m) fields[m[1].trim().toLowerCase()] = m[2].trim();
  }

  const transactionDate = fields["transaction date"];
  const transactionTime = fields["transaction time"];
  const transactionType = fields["transaction type"];
  const sourceAccount = fields["source account"];
  const beneficiaryAc = fields["beneficiary a/c"];
  const amount = fields["amount"];
  const remark = fields["remark"] || "";
  const status = fields["status"];

  if (!transactionDate) return { error: "Missing Transaction Date", field: "transaction_date" };
  if (!transactionTime) return { error: "Missing Transaction Time", field: "transaction_time" };
  if (!sourceAccount) return { error: "Missing Source Account", field: "source_account" };
  if (!beneficiaryAc) return { error: "Missing Beneficiary A/C", field: "beneficiary_ac" };
  if (!amount) return { error: "Missing Amount", field: "amount" };

  const dateMatch = transactionDate.match(/(\d{1,2})-([A-Za-z]{3})-(\d{4})/);
  if (!dateMatch) return { error: `Invalid date: ${transactionDate}`, field: "transaction_date" };
  const monthNum = MONTH_MAP[dateMatch[2].toLowerCase()];
  if (!monthNum) return { error: `Unknown month: ${dateMatch[2]}`, field: "transaction_date" };

  const isoDate = `${dateMatch[3]}-${monthNum}-${dateMatch[1].padStart(2, "0")}T${transactionTime}+07:00`;

  let nominal: number;
  try {
    const cleaned = amount.replace(/\u00A0/g, " ").replace(/^(IDR\.?|Rp\.?|RP\.?)\s*/i, "").trim();
    const lastDot = cleaned.lastIndexOf(".");
    const lastComma = cleaned.lastIndexOf(",");

    if (lastDot !== -1 && lastComma !== -1) {
      if (lastDot > lastComma) {
        const intP = cleaned.substring(0, lastDot).replace(/,/g, "");
        const fracP = cleaned.substring(lastDot + 1);
        if (fracP !== "00") return { error: `Fractional sen: ${amount}`, field: "amount" };
        nominal = parseInt(intP, 10);
      } else {
        const intP = cleaned.substring(0, lastComma).replace(/\./g, "");
        const fracP = cleaned.substring(lastComma + 1);
        if (fracP !== "00") return { error: `Fractional sen: ${amount}`, field: "amount" };
        nominal = parseInt(intP, 10);
      }
    } else {
      const sep = lastDot !== -1 ? "." : ",";
      const parts = cleaned.split(sep);
      const _all3 = parts.length > 1 && parts.every((p) => p.length === 3);
      nominal = parseInt(cleaned.replace(new RegExp("\\" + sep, "g"), ""), 10);
    }

    if (isNaN(nominal) || nominal <= 0) return { error: `Invalid amount: ${amount}`, field: "amount" };
  } catch { return { error: `Amount parse failed: ${amount}`, field: "amount" }; }

  const source = parseAccountField(sourceAccount);
  const beneficiary = parseAccountField(beneficiaryAc);

  const beneficiaryMatches = companyAccounts.some(
    (acct) => beneficiary.rekening === acct || beneficiary.rekening.startsWith(acct.substring(0, 6))
  );
  const sourceMatches = companyAccounts.some(
    (acct) => source.rekening === acct || source.rekening.startsWith(acct.substring(0, 6))
  );

  let arah: "masuk" | "keluar";
  if (beneficiaryMatches) arah = "masuk";
  else if (sourceMatches) arah = "keluar";
  else return { error: "No company account matched — cannot determine direction" };

  const hashInput = `${isoDate}|${nominal}|${source.rekening}|${remark}|${beneficiary.rekening}`;
  const contentHash = createHash("sha256").update(hashInput).digest("hex");

  return {
    tanggal_transaksi: isoDate,
    jenis: transactionType || "",
    nominal,
    arah,
    nama_pengirim: source.nama,
    rekening_pengirim_masked: source.rekening,
    nama_tujuan: beneficiary.nama,
    rekening_tujuan_masked: beneficiary.rekening,
    berita: remark,
    status_bank: status || "",
    content_hash: contentHash,
  };
}