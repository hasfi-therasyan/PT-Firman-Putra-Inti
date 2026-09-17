import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/utils/format";

export const metadata: Metadata = {
  title: "Rekonsiliasi",
};

export default async function RekonsiliasiPage() {
  const supabase = await createClient();

  // Unmatched payments
  const { data: unmatchedPayments } = await supabase
    .from("payment_transactions")
    .select("*")
    .eq("status", "unmatched")
    .eq("arah", "masuk")
    .order("created_at", { ascending: false });

  // Invoices needing attention (overdue or partial)
  const { data: attentionInvoices } = await supabase
    .from("invoices")
    .select("*, pangkalan:pangkalan_id(nama)")
    .in("status", ["overdue", "partial"])
    .order("tanggal_jatuh_tempo");

  // Monthly summary
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const { data: monthInvoices } = await supabase.from("invoices").select("total").gte("tanggal_invoice", monthStart).not("status", "eq", "cancelled");
  const { data: monthPayments } = await supabase.from("payment_transactions").select("nominal").eq("arah", "masuk").eq("status_bank", "Success").gte("created_at", monthStart);

  const totalInvoiced = (monthInvoices ?? []).reduce((s: number, i: any) => s + i.total, 0);
  const totalReceived = (monthPayments ?? []).reduce((s: number, p: any) => s + p.nominal, 0);
  const unresolvedCount = (unmatchedPayments?.length ?? 0) + (attentionInvoices?.length ?? 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Rekonsiliasi</h1>

      {/* Monthly summary */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-3">
          <p className="text-xs text-muted-foreground">Ditagih Bulan Ini</p>
          <p className="text-lg font-bold tabular-nums">{formatRupiah(totalInvoiced)}</p>
        </div>
        <div className="rounded-lg border bg-card p-3">
          <p className="text-xs text-muted-foreground">Diterima Bulan Ini</p>
          <p className="text-lg font-bold tabular-nums text-green-600">{formatRupiah(totalReceived)}</p>
        </div>
        <div className="rounded-lg border bg-card p-3">
          <p className="text-xs text-muted-foreground">Belum Selesai</p>
          <p className={`text-lg font-bold tabular-nums ${unresolvedCount > 0 ? "text-orange-600" : ""}`}>{unresolvedCount} item</p>
        </div>
      </div>

      {/* Unmatched payments */}
      <div className="space-y-3">
        <h2 className="font-semibold text-orange-600">Pembayaran Belum Tercocok ({unmatchedPayments?.length ?? 0})</h2>
        {(!unmatchedPayments || unmatchedPayments.length === 0) ? (
          <div className="rounded-lg border bg-card p-4 text-center text-sm text-muted-foreground">Semua pembayaran sudah tercocok.</div>
        ) : (
          <div className="space-y-2">
            {unmatchedPayments.map((p: any) => (
              <div key={p.id} className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{p.nama_pengirim || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">{p.tanggal_transaksi ? new Date(p.tanggal_transaksi).toLocaleDateString("id-ID") : "-"} &middot; {p.berita || "-"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold tabular-nums">{formatRupiah(p.nominal)}</p>
                    <p className="text-xs text-muted-foreground">{p.sumber}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invoices needing attention */}
      {attentionInvoices && attentionInvoices.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-red-600">Invoice Perlu Perhatian ({attentionInvoices.length})</h2>
          <div className="space-y-2">
            {attentionInvoices.map((inv: any) => (
              <div key={inv.id} className="rounded-lg border bg-card p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{inv.nomor_invoice}</p>
                    <p className="text-xs text-muted-foreground">{(inv.pangkalan as any)?.nama}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${inv.status === "overdue" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {inv.status === "overdue" ? "Jatuh Tempo" : "Sebagian"}
                    </span>
                    <p className="mt-1 text-sm font-semibold tabular-nums">{formatRupiah(inv.total - (inv.total_dibayar || 0))}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
