import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/utils/format";
import { ExportPDFButton } from "./export-pdf";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("invoices").select("nomor_invoice").eq("id", id).single();
  return { title: data?.nomor_invoice || "Invoice" };
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  draft: { label: "Draft", cls: "bg-gray-100 text-gray-700" },
  issued: { label: "Diterbitkan", cls: "bg-blue-100 text-blue-700" },
  partial: { label: "Sebagian", cls: "bg-yellow-100 text-yellow-700" },
  paid: { label: "Lunas", cls: "bg-green-100 text-green-700" },
  overdue: { label: "Jatuh Tempo", cls: "bg-red-100 text-red-700" },
  cancelled: { label: "Dibatalkan", cls: "bg-gray-100 text-gray-500" },
};

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: invoice } = await supabase
    .from("invoices")
    .select("*, pangkalan:pangkalan_id(nama, kode, alamat), items:invoice_items(*)")
    .eq("id", id)
    .single();

  if (!invoice) notFound();

  const { data: matches } = await supabase
    .from("payment_matches")
    .select("*, payment:payment_transaction_id(nominal, nama_pengirim, tanggal_transaksi)")
    .eq("invoice_id", id)
    .order("matched_at", { ascending: false });

  const pangkalan = invoice.pangkalan as any;
  const items = invoice.items as any[];
  const paid = matches?.reduce((sum: number, m: any) => sum + (m.nominal_dialokasikan || 0), 0) ?? 0;
  const sisa = invoice.total - paid;
  const progressPct = invoice.total > 0 ? Math.min(100, (paid / invoice.total) * 100) : 0;
  const st = STATUS_MAP[invoice.status] || { label: invoice.status, cls: "bg-gray-100" };

  return (
    <div className="space-y-6 max-w-2xl mx-auto px-2 sm:px-0">
      <div>
        <Link href="/invoice" className="text-xs text-muted-foreground hover:underline">&larr; Kembali</Link>
        <div className="mt-1 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{invoice.nomor_invoice}</h1>
            <p className="text-sm text-muted-foreground">{pangkalan?.nama || "Unknown"} &middot; {invoice.tanggal_invoice}</p>
          </div>
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${st.cls}`}>{st.label}</span>
        </div>
        <div className="mt-2">
          <ExportPDFButton invoice={{
            nomor_invoice: invoice.nomor_invoice,
            tanggal_invoice: invoice.tanggal_invoice,
            tanggal_jatuh_tempo: invoice.tanggal_jatuh_tempo,
            pangkalan: pangkalan,
            items: items.map((i: any) => ({ deskripsi: i.deskripsi, qty: i.qty, unit_price: i.unit_price, line_total: i.line_total })),
            subtotal: invoice.subtotal,
            penyesuaian: invoice.penyesuaian,
            kode_unik: invoice.kode_unik,
            total: invoice.total,
          }} />
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Total</span><span className="font-bold tabular-nums">{formatRupiah(invoice.total)}</span></div>
        <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Dibayar</span><span className="font-bold tabular-nums text-green-600">{formatRupiah(paid)}</span></div>
        <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Sisa</span><span className={`font-bold tabular-nums ${sisa > 0 ? "text-red-600" : ""}`}>{formatRupiah(sisa)}</span></div>
        <div className="rounded-full bg-muted h-2"><div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${progressPct}%` }} /></div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Jatuh tempo: {invoice.tanggal_jatuh_tempo || "-"}</span>
          <span>Kode unik: {invoice.kode_unik > 0 ? invoice.kode_unik : "-"}</span>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold">Item</h2>
        <div className="rounded-lg border bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/50 text-left"><th className="px-4 py-2 font-medium">Deskripsi</th><th className="px-4 py-2 font-medium text-right">Qty</th><th className="px-4 py-2 font-medium text-right">Harga</th><th className="px-4 py-2 font-medium text-right">Subtotal</th></tr></thead>
            <tbody>
              {items.map((item: any) => (
                <tr key={item.id} className="border-b last:border-0">
                  <td className="px-4 py-2">{item.deskripsi}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{item.qty}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{formatRupiah(item.unit_price)}</td>
                  <td className="px-4 py-2 text-right font-medium tabular-nums">{formatRupiah(item.line_total)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t font-medium"><td colSpan={3} className="px-4 py-2 text-right text-muted-foreground">Subtotal</td><td className="px-4 py-2 text-right tabular-nums">{formatRupiah(invoice.subtotal)}</td></tr>
              {invoice.kode_unik > 0 && <tr className="font-medium"><td colSpan={3} className="px-4 py-2 text-right text-muted-foreground">Kode Unik</td><td className="px-4 py-2 text-right tabular-nums">{formatRupiah(invoice.kode_unik)}</td></tr>}
              <tr className="border-t bg-muted/50 font-bold"><td colSpan={3} className="px-4 py-2 text-right">Total</td><td className="px-4 py-2 text-right tabular-nums">{formatRupiah(invoice.total)}</td></tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold">Pembayaran</h2>
        {(!matches || matches.length === 0) ? (
          <div className="rounded-lg border bg-card p-4 text-center text-sm text-muted-foreground">Belum ada pembayaran tercatat.</div>
        ) : (
          <div className="space-y-2">
            {matches.map((m: any) => {
              const pay = m.payment as any;
              return (
                <div key={m.id} className="rounded-lg border bg-card p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{pay?.nama_pengirim || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">{pay?.tanggal_transaksi ? new Date(pay.tanggal_transaksi).toLocaleDateString("id-ID") : "-"} &middot; {m.metode === "auto_exact" ? "Tepat total" : m.metode === "auto_berita" ? "Dari remark" : m.metode === "auto_nama" ? "Cocok nama" : "Manual"}</p>
                  </div>
                  <p className="text-sm font-semibold tabular-nums text-green-600">+{formatRupiah(m.nominal_dialokasikan)}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}