import type { Metadata } from "next";
import Link from "next/link";
import { getInvoiceList } from "./actions";
import { formatRupiah } from "@/lib/utils/format";
import { InvoiceFilterBar } from "./invoice-filter";

export const metadata: Metadata = {
  title: "Invoice",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft", issued: "Diterbitkan", partial: "Sebagian",
  paid: "Lunas", overdue: "Jatuh Tempo", cancelled: "Dibatalkan",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700", issued: "bg-blue-100 text-blue-700",
  partial: "bg-yellow-100 text-yellow-700", paid: "bg-green-100 text-green-700",
  overdue: "bg-red-100 text-red-700", cancelled: "bg-gray-100 text-gray-500",
};

export default async function InvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  const params = await searchParams;
  let invoices: Awaited<ReturnType<typeof getInvoiceList>> = [];
  let error: string | null = null;
  try {
    invoices = await getInvoiceList({
      status: params.status || undefined,
    });
    // Search filter
    if (params.search) {
      const s = params.search.toLowerCase();
      invoices = invoices.filter((inv: any) => {
        const pangkalanNama = (inv.pangkalan as any)?.nama?.toLowerCase() || "";
        const nomorInvoice = inv.nomor_invoice?.toLowerCase() || "";
        return nomorInvoice.includes(s) || pangkalanNama.includes(s);
      });
    }
  } catch (e) {
    error = e instanceof Error ? e.message : "Gagal memuat data";
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Invoice</h1>
        <Link href="/invoice/new" className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/80">
          + Baru
        </Link>
      </div>

      <InvoiceFilterBar
        currentStatus={params.status || ""}
        currentSearch={params.search || ""}
      />

      {error && <p className="text-sm text-destructive">{error}</p>}
      {!error && invoices.length === 0 && (
        <div className="rounded-lg border bg-card p-8 text-center">
          <p className="text-muted-foreground">Belum ada invoice.</p>
        </div>
      )}
      <div className="space-y-2">
        {invoices.map((inv) => {
          const paid = inv.total_dibayar || 0;
          const progressPct = inv.total > 0 ? Math.min(100, (paid / inv.total) * 100) : 0;
          return (
            <Link key={inv.id} href={`/invoice/${inv.id}`} className="block rounded-lg border bg-card p-4 hover:bg-muted/50">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{inv.nomor_invoice}</p>
                  <p className="text-xs text-muted-foreground">{(inv.pangkalan as any)?.nama || "Unknown"} · {inv.tanggal_invoice}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[inv.status || "draft"]}`}>
                    {STATUS_LABELS[inv.status || "draft"]}
                  </span>
                  <p className="mt-1 text-sm font-semibold tabular-nums">{formatRupiah(inv.total)}</p>
                </div>
              </div>
              {paid > 0 && (
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <div className="flex-1 rounded-full bg-muted h-1.5">
                    <div className="h-full rounded-full bg-green-500" style={{ width: `${progressPct}%` }} />
                  </div>
                  <span className="text-muted-foreground tabular-nums">{formatRupiah(paid)} / {formatRupiah(inv.total)}</span>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
